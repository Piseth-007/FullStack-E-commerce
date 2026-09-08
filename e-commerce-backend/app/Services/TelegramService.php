<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class TelegramService
{
    protected function getNotificationSettings(): array
    {
        try {
            return Setting::getGroup('notifications');
        } catch (Throwable $e) {
            Log::warning('Failed to load notification settings from database', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function isEnabled(): bool
    {
        $settings = $this->getNotificationSettings();
        if (array_key_exists('telegram_enabled', $settings)) {
            return (bool) $settings['telegram_enabled'];
        }
        return true;
    }

    public function getBotToken(): ?string
    {
        $settings = $this->getNotificationSettings();
        $token = $settings['telegram_bot_token'] ?? null;
        if (!empty($token)) {
            return $token;
        }
        return config('services.telegram.token');
    }

    public function getChatId(): ?string
    {
        $settings = $this->getNotificationSettings();
        $chatId = $settings['telegram_chat_id'] ?? null;
        if (!empty($chatId)) {
            return $chatId;
        }
        return config('services.telegram.chat_id');
    }

    public function send(string $message): bool
    {
        if (!$this->isEnabled()) {
            Log::info('Telegram notifications are disabled in settings.');
            return false;
        }

        $token = $this->getBotToken();
        $chatId = $this->getChatId();

        if (!$token || !$chatId) {
            Log::warning('Telegram not configured — skipping notification.');
            return false;
        }

        $result = $this->sendRaw($message, $token, $chatId);
        return $result['ok'];
    }

    public function sendRaw(string $message, string $token, string $chatId): array
    {
        try {
            $response = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);

            if ($response->successful()) {
                return ['ok' => true, 'data' => $response->json()];
            }

            $errorMsg = $response->json('description') ?? $response->body();
            Log::error('Telegram notification failed', [
                'status' => $response->status(),
                'error' => $errorMsg,
            ]);

            return ['ok' => false, 'error' => $errorMsg];
        } catch (Throwable $e) {
            Log::error('Telegram request exception', [
                'error' => $e->getMessage(),
            ]);
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    public function sendOrderPaid(Order $order, ?Payment $payment = null): bool
    {
        $order->loadMissing(['items', 'address', 'user']);

        $orderId = $order->id;
        $total = number_format((float) ($payment->amount ?? $order->total), 2);
        $method = strtoupper($payment->method ?? $order->payment_method ?? 'KHQR');
        $paidAt = $payment?->paid_at ?? $order->paid_at ?? now();
        $formattedDate = $paidAt->format('Y-m-d H:i:s');

        // Customer info
        $customerName = htmlspecialchars($order->user?->name ?? $order->address?->full_name ?? 'Customer', ENT_QUOTES, 'UTF-8');
        $customerPhone = htmlspecialchars($order->address?->telephone ?? $order->user?->phone ?? 'N/A', ENT_QUOTES, 'UTF-8');
        $customerEmail = htmlspecialchars($order->user?->email ?? 'N/A', ENT_QUOTES, 'UTF-8');

        // Delivery Address
        $addressParts = [];
        if ($order->address) {
            $addr = $order->address;
            if (!empty($addr->street)) $addressParts[] = $addr->street;
            if (!empty($addr->commune)) $addressParts[] = $addr->commune;
            if (!empty($addr->district)) $addressParts[] = $addr->district;
            if (!empty($addr->city_province)) $addressParts[] = $addr->city_province;
        }
        $formattedAddress = !empty($addressParts)
            ? htmlspecialchars(implode(', ', $addressParts), ENT_QUOTES, 'UTF-8')
            : 'No delivery address';

        // Order items
        $itemsText = '';
        if ($order->items && $order->items->isNotEmpty()) {
            foreach ($order->items as $index => $item) {
                $num = $index + 1;
                $pName = htmlspecialchars($item->product_name ?? 'Product', ENT_QUOTES, 'UTF-8');
                $qty = (int) $item->quantity;
                $unitPrice = number_format((float) $item->price, 2);
                $subtotal = number_format($qty * (float) $item->price, 2);
                $itemsText .= "{$num}. <b>{$pName}</b>\n   • Qty: {$qty} × \${$unitPrice} = <b>\${$subtotal}</b>\n";
            }
        } else {
            $itemsText = "<i>No items recorded</i>\n";
        }

        $lines = [
            "✅ <b>New Paid Order ({$method})</b>",
            "━━━━━━━━━━━━━━━━━━━━",
            "📦 <b>Order ID:</b> #{$orderId}",
            "📅 <b>Date:</b> {$formattedDate}",
            "💵 <b>Payment Method:</b> {$method}",
            "⚡ <b>Payment Status:</b> Paid",
            "",
            "👤 <b>Customer Details:</b>",
            "• <b>Name:</b> {$customerName}",
            "• <b>Phone:</b> {$customerPhone}",
            "• <b>Email:</b> {$customerEmail}",
            "",
            "📍 <b>Delivery Address:</b>",
            "• {$formattedAddress}",
            "",
            "🛍️ <b>Order Items:</b>",
            rtrim($itemsText),
            "━━━━━━━━━━━━━━━━━━━━",
            "💰 <b>Total Amount: \${$total}</b>",
        ];

        return $this->send(implode("\n", $lines));
    }
}
