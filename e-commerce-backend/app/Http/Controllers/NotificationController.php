<?php

namespace App\Http\Controllers;

use App\Models\AdminNotificationView;
use App\Models\Contact;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function counts(Request $request)
    {
        $views = AdminNotificationView::where('user_id', $request->user()->id)
            ->pluck('viewed_at', 'section');

        $ordersQuery = Order::whereIn('status', ['pending', 'paid']);
        if ($viewed = $views['orders'] ?? null) {
            $ordersQuery->where('created_at', '>', $viewed);
        }

        $contactsQuery = Contact::whereNull('read_at');
        if ($viewed = $views['contacts'] ?? null) {
            $contactsQuery->where('created_at', '>', $viewed);
        }

        $reviewsQuery = Review::query();
        if ($viewed = $views['reviews'] ?? null) {
            $reviewsQuery->where('created_at', '>', $viewed);
        } else {
            $reviewsQuery->whereRaw('1 = 0');
        }

        return response()->json([
            'data' => [
                'orders' => $ordersQuery->count(),
                'contacts' => $contactsQuery->count(),
                'reviews' => $reviewsQuery->count(),
            ],
        ]);
    }

    public function markViewed(Request $request, string $section)
    {
        AdminNotificationView::updateOrCreate(
            ['user_id' => $request->user()->id, 'section' => $section],
            ['viewed_at' => now()]
        );

        return response()->json(['message' => 'ok']);
    }
}
