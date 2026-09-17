<?php

namespace App\Http\Controllers;

use App\Rules\RealEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function uploadProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|mimes:jpeg,png,webp,jpg|max:5120',
        ]);

        $user = $request->user();

        try {
            if ($user->profile_image_public_id) {
                try {
                    cloudinary()->destroy($user->profile_image_public_id);
                } catch (\Throwable $e) {
                    // Ignore failure if old image was already deleted or Cloudinary had an issue
                }
            }

            $result = cloudinary()->upload($request->file('profile_image')->getRealPath(), [
                'folder' => 'profile-images',
            ]);

            $user->update([
                'profile_image' => $result->getSecurePath(),
                'profile_image_public_id' => $result->getPublicId(),
            ]);

            return response()->json([
                'profile_image' => $user->profile_image,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Unable to upload photo: ' . ($e->getMessage() ?: 'Cloudinary service unavailable'),
            ], 500);
        }
    }


    public function removeProfileImage(Request $request)
    {
        $user = $request->user();

        if ($user->profile_image_public_id) {
            try {
                cloudinary()->destroy($user->profile_image_public_id);
            } catch (\Throwable $e) {
                // Ignore failure if already removed from Cloudinary
            }
        }

        $user->update([
            'profile_image' => null,
            'profile_image_public_id' => null,
        ]);

        return response()->json([
            'profile_image' => null,
        ]);
    }


    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $emailRules = ['required', 'string', 'max:255', 'unique:users,email,' . $user->id];

        // Only enforce DNS/disposable verification if the email is actually changed
        if ($request->filled('email') && strtolower(trim($request->email)) !== strtolower(trim($user->email))) {
            $emailRules[] = new RealEmail();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => $emailRules,
            'phone' => 'nullable|string|max:30',
        ]);

        $user->update($validated);

        return response()->json($user->fresh());
    }


    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }
}
