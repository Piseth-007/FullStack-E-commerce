<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{

    public function index(Request $request, $productId)
    {
        return response()->json(
            Review::where('product_id', $productId)
                ->with('user:id,name,profile_image')
                ->latest()
                ->get()
        );
    }


    public function adminIndex(Request $request)
    {
        $query = Review::with(['user:id,name', 'product:id,name'])->latest();

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        return response()->json($query->paginate(15));
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_item_id' => 'required|exists:order_items,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:2000',
        ]);

        $orderItem = OrderItem::with('order')->findOrFail($validated['order_item_id']);

        if ($orderItem->order->user_id !== $request->user()->id) {
            abort(403, 'You can only review items you purchased');
        }

        if (!in_array($orderItem->order->status, ['paid', 'shipped', 'completed'])) {
            return response()->json([
                'message' => 'You can only review items from completed orders',
            ], 422);
        }

        $existing = Review::where('user_id', $request->user()->id)
            ->where('order_item_id', $orderItem->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already reviewed this item'], 422);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $orderItem->product_id,
            'order_item_id' => $orderItem->id,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json($review, 201);
    }


    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review->update($validated);

        return response()->json($review);
    }


    public function destroy(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted']);
    }


    public function reviewable(Request $request)
    {
        $items = OrderItem::whereHas('order', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id)
                ->whereIn('status', ['paid', 'shipped', 'completed']);
        })
            ->whereDoesntHave('review')
            ->with('product')
            ->get();

        return response()->json($items);
    }
}
