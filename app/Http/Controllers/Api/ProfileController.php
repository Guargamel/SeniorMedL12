<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        // update ONLY text fields
        $user->name = $request->name;
        $user->email = $request->email;

        // update avatar ONLY if a file was uploaded
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public'); // avatars/xxxx.jpg
            $user->avatar = $path;
        }

        $user->save();

        return response()->json(['user' => $user->load('roles')]);
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
