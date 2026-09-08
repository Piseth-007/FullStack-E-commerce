<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|max:4096',
        ]);

        $existing = $product->images ?? [];

        foreach ($request->file('images') as $file) {
            $result = cloudinary()->upload($file->getRealPath(), [
                'folder' => 'products',
            ]);

            $existing[] = [
                'url' => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
                'is_primary' => count($existing) === 0,
            ];
        }

        $product->update(['images' => $existing]);

        return response()->json($product->fresh());
    }

    public function destroy(Request $request, Product $product)
    {
        $request->validate(['public_id' => 'required|string']);

        $images = collect($product->images)
            ->reject(fn($img) => $img['public_id'] === $request->public_id)
            ->values()
            ->all();

        cloudinary()->destroy($request->public_id);

        $product->update(['images' => $images]);

        return response()->json($product->fresh());
    }

    public function setPrimary(Request $request, Product $product)
    {
        $request->validate(['public_id' => 'required|string']);

        $images = collect($product->images)->map(function ($img) use ($request) {
            $img['is_primary'] = $img['public_id'] === $request->public_id;
            return $img;
        })->all();

        $product->update(['images' => $images]);

        return response()->json($product->fresh());
    }
}
