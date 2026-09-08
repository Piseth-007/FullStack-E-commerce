<?php

namespace App\Http\Controllers;

use App\Models\SkinType;
use Illuminate\Http\Request;

class SkinTypeController extends Controller
{
    public function index()
    {
        return response()->json(
            SkinType::withCount('products')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:skin_types,name',
            'description' => 'nullable|string|max:500',
        ]);

        $skinType = SkinType::create($validated);

        return response()->json([
            'message' => 'Skin type created successfully',
            'data' => $skinType,
        ], 201);
    }

    public function show(SkinType $skinType)
    {
        return response()->json([
            'data' => $skinType->load('products'),
        ]);
    }

    public function update(
        Request $request,
        SkinType $skinType
    ) {
        $validated = $request->validate([
            'name' =>
            'required|string|max:100|unique:skin_types,name,' .
                $skinType->id,

            'description' => 'nullable|string|max:500',
        ]);

        $skinType->update($validated);

        return response()->json([
            'message' => 'Skin type updated successfully',
            'data' => $skinType,
        ]);
    }

    public function destroy(SkinType $skinType)
    {
        $skinType->delete();

        return response()->json([
            'message' => 'Skin type deleted successfully',
        ]);
    }
}
