<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Rules\RealEmail;
use Google\Client as GoogleClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'max:255', 'unique:users', new RealEmail()],
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'login successfully'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update the authenticated user's name, email, and phone.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'max:255', 'unique:users,email,' . $user->id, new RealEmail()],
            'phone' => 'nullable|string|max:30',
        ]);

        $user->update($validated);

        return response()->json($user->fresh());
    }

    /**
     * Update the authenticated user's password.
     * Requires the current password to be re-entered.
     */
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

    /**
     * Log in (or register) a user via a Google ID token.
     * Frontend sends the id_token obtained from Google Identity Services.
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        $clientId = config('services.google.client_id');
        if (!$clientId) {
            return response()->json([
                'message' => 'Google Client ID is not configured on the server. Please check .env file.',
            ], 500);
        }

        try {
            $client = new GoogleClient(['client_id' => $clientId]);
            $payload = $client->verifyIdToken($request->id_token);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to verify Google token: ' . $e->getMessage(),
            ], 401);
        }

        if (!$payload) {
            return response()->json(['message' => 'Invalid Google token'], 401);
        }

        if (empty($payload['email_verified'])) {
            return response()->json(['message' => 'Google email is not verified'], 401);
        }

        $user = User::where('email', $payload['email'])->first();

        if (!$user) {
            $user = User::create([
                'name' => $payload['name'] ?? $payload['email'],
                'email' => $payload['email'],
                'password' => Hash::make(Str::random(32)), // unusable password, Google-only login
                'email_verified_at' => now(),
                'profile_image' => $payload['picture'] ?? null,
            ]);
        } else {
            $dirty = false;
            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
                $dirty = true;
            }
            if (!$user->profile_image && !empty($payload['picture'])) {
                $user->profile_image = $payload['picture'];
                $dirty = true;
            }
            if ($dirty) {
                $user->save();
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'login successfully'
        ]);
    }
}
