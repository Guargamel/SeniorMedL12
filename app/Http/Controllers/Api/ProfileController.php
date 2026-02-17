<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        // Frontend expects either {user:{...}} or user directly; we keep {user:...}
        return response()->json(['user' => $request->user()->load('roles')]);
    }

    /**
     * Update the authenticated user's profile
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    // app/Http/Controllers/Api/ProfileController.php

    // app/Http/Controllers/Api/ProfileController.php

    public function update(Request $request)
    {
        // Validate input data
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        // Get the currently authenticated user
        $user = auth()->user();

        // Update user fields
        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Store the avatar in the 'avatars' folder, and make it publicly accessible
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        // Save the updated user data
        $user->save();

        // Return the updated user data, including the avatar
        return response()->json(['user' => $user]);
    }



    /**
     * Update the authenticated user's password
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        // Validate the password update request
        $v = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        // Check if the current password matches
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        // Update the password
        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }
}
