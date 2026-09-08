<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\OrderCancellationService;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;
use Throwable;

class PaymentController extends Controller
{
    private const PAYMENT_METHOD = 'khqr';
    private const CURRENCY = 'USD';
    private const EXPIRATION_MINUTES = 3;

    public function generate(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'This order is no longer available for payment.',
                'status' => $order->status,
            ], 422);
        }

        if ($order->payment_method !== self::PAYMENT_METHOD) {
            return response()->json([
                'message' => 'This order does not support KHQR payment.',
            ], 422);
        }

        $token = config('services.bakong.token');
        $accountId = config('services.bakong.account_id');

        if (!$token || !$accountId) {
            return response()->json([
                'message' => 'Bakong payment configuration is missing.',
            ], 503);
        }

        $amount = round((float) $order->total, 2);

        if ($amount <= 0) {
            return response()->json([
                'message' => 'Invalid order amount.',
            ], 422);
        }

        $existingPayment = $order->payments()
            ->where('method', self::PAYMENT_METHOD)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();

        if ($existingPayment) {
            return response()->json([
                'payment_id' => $existingPayment->id,
                'qr_string' => $existingPayment->qr_string,
                'md5' => $existingPayment->md5,
                'expires_at' => $existingPayment->expires_at,
            ]);
        }

        try {
            $expiresAt = now()->addMinutes(self::EXPIRATION_MINUTES);

            $individualInfo = new IndividualInfo(
                bakongAccountID: $accountId,
                merchantName: config(
                    'services.bakong.merchant_name',
                    'My Store'
                ),
                merchantCity: config(
                    'services.bakong.merchant_city',
                    'Phnom Penh'
                ),
                currency: KHQRData::CURRENCY_USD,
                amount: $amount,
                expirationTimestamp: (string) $expiresAt->valueOf(),
            );

            $bakong = new BakongKHQR($token);

            $result = $bakong->generateIndividual($individualInfo);

            if (
                !isset($result->status['code']) ||
                $result->status['code'] !== 0 ||
                empty($result->data['qr']) ||
                empty($result->data['md5'])
            ) {
                Log::error('KHQR generation failed', [
                    'order_id' => $order->id,
                    'status' => $result->status ?? null,
                ]);

                return response()->json([
                    'message' => 'Failed to generate KHQR code.',
                ], 500);
            }

            $payment = DB::transaction(function () use (
                $order,
                $amount,
                $expiresAt,
                $result
            ) {
                $existingPayment = Payment::query()
                    ->where('order_id', $order->id)
                    ->where('method', self::PAYMENT_METHOD)
                    ->where('status', 'pending')
                    ->where('expires_at', '>', now())
                    ->lockForUpdate()
                    ->latest('id')
                    ->first();

                if ($existingPayment) {
                    return $existingPayment;
                }

                return Payment::create([
                    'order_id' => $order->id,
                    'method' => self::PAYMENT_METHOD,
                    'amount' => $amount,
                    'currency' => self::CURRENCY,
                    'md5' => $result->data['md5'],
                    'qr_string' => $result->data['qr'],
                    'status' => 'pending',
                    'expires_at' => $expiresAt,
                ]);
            });

            return response()->json([
                'payment_id' => $payment->id,
                'qr_string' => $payment->qr_string,
                'md5' => $payment->md5,
                'expires_at' => $payment->expires_at,
            ], 201);
        } catch (Throwable $e) {
            Log::error('KHQR payment generation error', [
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to generate KHQR payment. Please try again.',
            ], 500);
        }
    }

    public function checkStatus(
        Request $request,
        Payment $payment,
        TelegramService $telegram,
        OrderCancellationService $orderCancellation
    ) {
        $payment->loadMissing('order');

        if (!$payment->order) {
            return response()->json([
                'message' => 'Order associated with this payment was not found.',
            ], 404);
        }

        if ($payment->order->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($payment->method !== self::PAYMENT_METHOD) {
            return response()->json([
                'message' => 'Unsupported payment method.',
            ], 422);
        }

        if ($payment->status === 'paid') {
            return response()->json([
                'status' => 'paid',
            ]);
        }

        if ($payment->status === 'cancelled') {
            return response()->json([
                'status' => 'cancelled',
            ]);
        }

        if ($payment->status === 'expired') {
            return response()->json([
                'status' => 'expired',
            ]);
        }

        if ($payment->expires_at && $payment->expires_at->isPast()) {
            $payment->update([
                'status' => 'expired',
            ]);

            $this->restoreOrderIfNoActivePayment(
                $payment,
                $orderCancellation
            );

            return response()->json([
                'status' => 'expired',
            ]);
        }

        try {
            $bakong = new BakongKHQR(
                config('services.bakong.token')
            );

            $result = $bakong->checkTransactionByMD5(
                $payment->md5
            );

            if (($result['responseCode'] ?? null) === 0) {
                $paid = DB::transaction(function () use ($payment) {
                    $lockedPayment = Payment::query()
                        ->whereKey($payment->id)
                        ->lockForUpdate()
                        ->first();

                    if (!$lockedPayment) {
                        return false;
                    }

                    if ($lockedPayment->status === 'paid') {
                        return false;
                    }

                    if ($lockedPayment->status !== 'pending') {
                        return false;
                    }

                    $lockedPayment->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);

                    $lockedPayment->order()->update([
                        'status' => 'paid',
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                    ]);

                    return true;
                });

                if ($paid) {
                    try {
                        $order = Order::with(['items', 'address', 'user'])->find($payment->order_id) ?? $payment->order;
                        $telegram->sendOrderPaid($order, $payment);
                    } catch (Throwable $telegramError) {
                        Log::warning(
                            'Telegram payment notification failed',
                            [
                                'payment_id' => $payment->id,
                                'order_id' => $payment->order_id,
                                'error' => $telegramError->getMessage(),
                            ]
                        );
                    }
                }
            }

            $payment->refresh();

            return response()->json([
                'status' => $payment->status,
            ]);
        } catch (Throwable $e) {
            Log::error('KHQR payment status check failed', [
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'pending',
                'message' => 'Unable to verify payment at the moment.',
            ]);
        }
    }

    public function cancel(
        Request $request,
        Payment $payment,
        OrderCancellationService $orderCancellation
    ) {
        $payment->loadMissing('order');

        if (!$payment->order) {
            return response()->json([
                'message' => 'Order associated with this payment was not found.',
            ], 404);
        }

        if ($payment->order->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($payment->method !== self::PAYMENT_METHOD) {
            return response()->json([
                'message' => 'Unsupported payment method.',
            ], 422);
        }

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'A paid payment cannot be cancelled.',
            ], 422);
        }

        if ($payment->status === 'cancelled') {
            return response()->json([
                'status' => 'cancelled',
            ]);
        }

        if ($payment->status === 'expired') {
            $this->restoreOrderIfNoActivePayment(
                $payment,
                $orderCancellation
            );

            return response()->json([
                'status' => 'expired',
            ]);
        }

        try {
            DB::transaction(function () use ($payment) {
                $lockedPayment = Payment::query()
                    ->whereKey($payment->id)
                    ->lockForUpdate()
                    ->first();

                if (!$lockedPayment) {
                    return;
                }

                if ($lockedPayment->status === 'pending') {
                    $lockedPayment->update([
                        'status' => 'cancelled',
                    ]);
                }
            });

            $payment->refresh();

            $this->restoreOrderIfNoActivePayment(
                $payment,
                $orderCancellation
            );

            return response()->json([
                'status' => $payment->status,
            ]);
        } catch (Throwable $e) {
            Log::error('KHQR payment cancellation failed', [
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to cancel payment. Please try again.',
            ], 500);
        }
    }

    private function restoreOrderIfNoActivePayment(
        Payment $payment,
        OrderCancellationService $orderCancellation
    ): void {
        $order = $payment->order;

        if (!$order || $order->status !== 'pending') {
            return;
        }

        $hasActivePayment = $order->payments()
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->exists();

        if (!$hasActivePayment) {
            $orderCancellation->cancelPendingOrder($order);
        }
    }
}
