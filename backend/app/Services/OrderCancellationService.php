<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderCancellationService
{

    public function cancelPendingOrder(Order $order): bool
    {
        return DB::transaction(function () use ($order) {
            $order = Order::query()
                ->with('items')
                ->lockForUpdate()
                ->findOrFail($order->id);

            if ($order->status !== 'pending') {
                return false;
            }

            // Restore reserved product stock
            foreach ($order->items as $item) {
                Product::whereKey($item->product_id)->increment('stock', $item->quantity);
            }

            // Ensure the user's cart contains the products from this order
            $cart = Cart::firstOrCreate(['user_id' => $order->user_id]);
            foreach ($order->items as $item) {
                $exists = $cart->items()
                    ->where('product_id', $item->product_id)
                    ->exists();

                if (!$exists) {
                    $cart->items()->create([
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                    ]);
                }
            }

            // Mark order as cancelled so records remain coherent
            $order->update([
                'status' => 'cancelled',
            ]);

            return true;
        });
    }
}
