<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Rules\RealEmail;
use App\Services\TelegramService;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    public function publicStore()
    {
        return response()->json([
            'data' => Setting::getGroup('store'),
        ]);
    }

    public function index()
    {
        $payment = Setting::getGroup('payment');

        $paymentSettings = [
            'bakong_account_id' => $payment['bakong_account_id'] ?? config('services.bakong.account_id') ?? '',
            'bakong_developer_token' => $payment['bakong_developer_token'] ?? config('services.bakong.token') ?? '',
            'bakong_merchant_name' => $payment['bakong_merchant_name'] ?? config('services.bakong.merchant_name') ?? '',
            'bakong_merchant_city' => $payment['bakong_merchant_city'] ?? config('services.bakong.merchant_city') ?? '',
        ];

        return response()->json([
            'data' => [
                'store' => Setting::getGroup('store'),
                'payment' => $paymentSettings,
                'notifications' => Setting::getGroup('notifications'),
            ],
        ]);
    }

    public function updateStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'contact_email' => ['nullable', 'string', 'max:255', new RealEmail()],
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'logo' => 'nullable|image|max:5120',
            'remove_logo' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $data = $validator->validated();
        $current = Setting::getGroup('store');

        if ($request->hasFile('logo')) {
            $cloudinary = new Cloudinary();
            $upload = $cloudinary->uploadApi()->upload($request->file('logo')->getRealPath(), [
                'folder' => 'botaniq/store',
            ]);
            $data['logo'] = [
                'url' => $upload['secure_url'],
                'public_id' => $upload['public_id'],
            ];
        } elseif ($request->boolean('remove_logo')) {
            $data['logo'] = null;
        } else {
            $data['logo'] = $current['logo'] ?? null;
        }

        unset($data['remove_logo']);

        return response()->json(['data' => Setting::putGroup('store', $data)]);
    }


    public function updatePayment(Request $request)
    {
        $input = array_map(function ($value) {
            return is_string($value) ? trim($value) : $value;
        }, $request->all());

        $validator = Validator::make($input, [
            'bakong_account_id' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[^@\s]+@[^@\s]+$/',
            ],
            'bakong_developer_token' => 'nullable|string|max:4096',
            'bakong_merchant_name' => 'nullable|string|max:255',
            'bakong_merchant_city' => 'nullable|string|max:255',
        ], [
            'bakong_account_id.regex' => 'The Bakong account ID must be in the format username@bank (e.g. your_name@wing or your_name@bkrt).',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $saved = Setting::putGroup('payment', $validator->validated());

        return response()->json(['data' => $saved]);
    }

    public function updateNotifications(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_enabled' => 'required|boolean',
            'telegram_enabled' => 'required|boolean',
            'telegram_bot_token' => 'nullable|string|max:255',
            'telegram_chat_id' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        return response()->json(['data' => Setting::putGroup('notifications', $validator->validated())]);
    }

    public function testTelegram(Request $request, TelegramService $telegram)
    {
        $validator = Validator::make($request->all(), [
            'telegram_bot_token' => 'nullable|string|max:255',
            'telegram_chat_id' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $token = $request->input('telegram_bot_token') ?: $telegram->getBotToken();
        $chatId = $request->input('telegram_chat_id') ?: $telegram->getChatId();

        if (!$token || !$chatId) {
            return response()->json([
                'message' => 'Please provide both Telegram bot token and chat ID to test.',
            ], 422);
        }

        $result = $telegram->sendRaw(
            "🔔 <b>Telegram Notification Test</b>\n\nYour Telegram bot configuration is working successfully!",
            $token,
            $chatId
        );

        if (!$result['ok']) {
            return response()->json([
                'message' => 'Telegram test failed: ' . ($result['error'] ?? 'Unknown error'),
            ], 400);
        }

        return response()->json([
            'message' => 'Test notification sent to Telegram successfully!',
        ]);
    }
}
