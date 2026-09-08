<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{

    public function index(Request $request)
    {
        $cart = $request->user()->cart()->with('items.product')->first();

        if (!$cart) {
            $cart = $request->user()->cart()->create();
            $cart->setRelation('items', collect());
        }

        return response()->json($cart);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->stock < $validated['quantity']) {
            return response()->json(['message' => 'Not enough stock available'], 422);
        }

        $cart = $request->user()->cart()->firstOrCreate([]);

        $item = $cart->items()->where('product_id', $product->id)->first();

        if ($item) {
            $item->update(['quantity' => $item->quantity + $validated['quantity']]);
        } else {
            $item = $cart->items()->create($validated);
        }

        return response()->json($cart->load('items.product'), 201);
    }

    public function update(Request $request, $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $request->user()->cart;
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $item = $cart->items()->with('product')->findOrFail($itemId);

        if (!$item->product) {
            return response()->json(['message' => 'Product no longer exists'], 404);
        }

        if ($item->product->stock < $validated['quantity']) {
            return response()->json(['message' => 'Not enough stock available'], 422);
        }

        $item->update($validated);

        return response()->json($cart->refresh()->load('items.product'));
    }

    public function destroy(Request $request, $itemId)
    {
        $cart = $request->user()->cart;
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cart->items()->findOrFail($itemId)->delete();

        return response()->json($cart->refresh()->load('items.product'));
    }


    public function clear(Request $request)
    {
        $cart = $request->user()->cart;
        $cart?->items()->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
}
