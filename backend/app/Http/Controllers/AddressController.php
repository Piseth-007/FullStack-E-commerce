<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->addresses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->addressRules());
        if (! empty($validated['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($validated);

        return response()->json($address, 201);
    }

    public function show(Request $request, Address $address)
    {
        $this->authorizeOwnership($request, $address);

        return response()->json($address);
    }

    public function update(Request $request, Address $address)
    {
        $this->authorizeOwnership($request, $address);

        $validated = $request->validate($this->addressRules());

        if (! empty($validated['is_default'])) {
            $request->user()->addresses()
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json($address);
    }

    public function destroy(Request $request, Address $address)
    {
        $this->authorizeOwnership($request, $address);

        $wasDefault = (bool) $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $nextAddress = $request->user()->addresses()->first();
            if ($nextAddress) {
                $nextAddress->update(['is_default' => true]);
            }
        }

        return response()->json(['message' => 'Address deleted']);
    }

    private function authorizeOwnership(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Forbidden');
        }
    }

    private function addressRules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'telephone' => 'required|string|max:30',
            'city_province' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'commune' => 'required|string|max:100',
            'street' => 'nullable|string|max:255',
            'label' => 'nullable|string|max:100',
            'is_default' => 'sometimes|boolean',
        ];
    }
}
