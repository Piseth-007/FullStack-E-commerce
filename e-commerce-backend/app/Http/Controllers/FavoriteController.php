<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with('product:id,name,slug,price,discount,free_delivery,stock,images')
            ->latest()
            ->get();

        return response()->json([
            'data' => $favorites,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],
        ]);

        $request->user()
            ->favorites()
            ->firstOrCreate([
                'product_id' => $validated['product_id'],
            ]);

        $favorites = $request->user()
            ->favorites()
            ->with('product')
            ->latest()
            ->get();

        return response()->json([
            'data' => $favorites,
        ], 201);
    }

    public function destroy(Request $request, $productId)
    {
        $favorite = $request->user()
            ->favorites()
            ->where('product_id', $productId)
            ->first();

        if (!$favorite) {
            return response()->json([
                'message' => 'Favorite not found.',
            ], 404);
        }

        $favorite->delete();

        $favorites = $request->user()
            ->favorites()
            ->with('product')
            ->latest()
            ->get();

        return response()->json([
            'data' => $favorites,
        ]);
    }
}
