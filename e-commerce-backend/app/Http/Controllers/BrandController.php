<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::all());
    }

    public function show(Brand $brand)
    {
        return response()->json($brand->load('products'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $brand = Brand::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return response()->json($brand, 201);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $brand->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return response()->json($brand);
    }

    public function destroy(Brand $brand)
    {
        if ($brand->logo_public_id) {
            cloudinary()->destroy($brand->logo_public_id);
        }

        $brand->delete();

        return response()->json(['message' => 'Brand deleted']);
    }

    // Optional: upload/replace brand logo
    public function uploadLogo(Request $request, Brand $brand)
    {
        $request->validate([
            'logo' => 'required|image|max:2048',
        ]);

        if ($brand->logo_public_id) {
            cloudinary()->destroy($brand->logo_public_id);
        }

        $result = cloudinary()->upload($request->file('logo')->getRealPath(), [
            'folder' => 'brands',
        ]);

        $brand->update([
            'logo_url' => $result->getSecurePath(),
            'logo_public_id' => $result->getPublicId(),
        ]);

        return response()->json($brand);
    }
}
