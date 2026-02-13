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
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'avatar' => ['nullable', 'image', 'max:4096'], // Ensure avatar is an image with max size 4MB
            'role' => ['nullable', 'string'], // Role change should be handled separately
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        // Update name and email
        $user->name = $request->input('name');
        $user->email = $request->input('email');

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if (!empty($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar in the public directory
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        // Handle role update (only super-admins can change roles)
        if ($request->filled('role') && $user->hasRole('super-admin')) {
            $role = Role::findByName($request->input('role'));
            if ($role) {
                $user->syncRoles([$role]); // Sync the new role
            }
        }

        return response()->json(['message' => 'Profile updated', 'user' => $user->load('roles')]);
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
