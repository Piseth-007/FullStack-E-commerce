<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
            ],
        ]);

        $email = strtolower(trim($validated['email']));

        $subscriber = Subscriber::where('email', $email)->first();

        if ($subscriber) {
            if (!$subscriber->is_active) {
                $subscriber->update(['is_active' => true]);

                return response()->json([
                    'message' => 'Welcome back! You have re-subscribed to new product alerts.',
                    'subscribed' => true,
                ]);
            }

            return response()->json([
                'message' => "You're already on our list to receive product updates.",
                'already_subscribed' => true,
                'subscribed' => true,
            ]);
        }

        Subscriber::create([
            'email' => $email,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Thank you for subscribing! You will receive alerts when new products arrive.',
            'subscribed' => true,
        ], 201);
    }

    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email|max:255',
        ]);

        $email = strtolower(trim($validated['email']));

        Subscriber::where('email', $email)->update(['is_active' => false]);

        return response()->json([
            'message' => 'You have been unsubscribed from product alerts.',
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = Subscriber::query()->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('email', 'like', "%{$search}%");
        }

        $subscribers = $query->paginate(20);

        return response()->json([
            'subscribers' => $subscribers,
            'total_active' => Subscriber::where('is_active', true)->count(),
        ]);
    }
}
