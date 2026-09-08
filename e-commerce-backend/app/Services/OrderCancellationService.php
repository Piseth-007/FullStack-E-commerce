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

            $cart = Cart::firstOrCreate(['user_id' => $order->user_id]);

            foreach ($order->items as $item) {
                $cartItem = $cart->items()
                    ->where('product_id', $item->product_id)
                    ->lockForUpdate()
                    ->first();

                if ($cartItem) {
                    $cartItem->increment('quantity', $item->quantity);
                } else {
                    $cart->items()->create([
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                    ]);
                }

                Product::whereKey($item->product_id)->increment('stock', $item->quantity);
            }

            // An unpaid checkout is only a temporary reservation.  Once the
            // payment is cancelled or expires, restore its stock/cart and
            // remove the draft order instead of retaining a cancellation.
            $order->delete();

            return true;
        });
    }
}
