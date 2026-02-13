<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserProfileController extends Controller
{
    /**
     * Get user profile by ID (for viewing other users)
     */
    public function show($id): JsonResponse
    {
        $user = User::with(['roles', 'seniorProfile', 'distributions', 'distributionsGiven'])
            ->findOrFail($id);

        $profile = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar_url,
            'initials' => $user->initials,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'role' => $user->roles->first()?->name ?? 'user',
            'role_display' => $user->role_name,
            'roles' => $user->roles,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'email_verified_at' => $user->email_verified_at,
        ];

        // Add senior profile if exists
        if ($user->seniorProfile) {
            $profile['senior_profile'] = $user->seniorProfile;
        }

        // Add statistics
        $profile['statistics'] = [
            'distributions_received' => $user->distributions()->count(),
            'distributions_given' => $user->distributionsGiven()->count(),
            'last_distribution' => $user->distributions()->latest()->first()?->created_at,
            'member_since' => $user->created_at->diffForHumans(),
        ];

        return response()->json($profile);
    }

    /**
     * Update user profile
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Check authorization
        if (auth()->id() !== $user->id && !auth()->user()->hasRole('super-admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'max:5120'], // 5MB max
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(['roles'])
        ]);
    }

    /**
     * Upload avatar only
     */
    public function uploadAvatar(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Check authorization
        if (auth()->id() !== $user->id && !auth()->user()->hasRole('super-admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
        ]);

        // Delete old avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => $user->avatar_url
        ]);
    }

    /**
     * Delete avatar
     */
    public function deleteAvatar($id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Check authorization
        if (auth()->id() !== $user->id && !auth()->user()->hasRole('super-admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete avatar file
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json(['message' => 'Avatar deleted successfully']);
    }

    /**
     * Get user's activity log
     */
    public function activity($id): JsonResponse
    {
        $user = User::findOrFail($id);

        $activities = [];

        // Get distributions (as recipient)
        $distributions = $user->distributions()
            ->with('medicine:id,generic_name,brand_name')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function($dist) {
                return [
                    'type' => 'distribution_received',
                    'date' => $dist->created_at,
                    'description' => "Received {$dist->quantity} units of {$dist->medicine->generic_name}",
                    'data' => $dist
                ];
            });

        $activities = array_merge($activities, $distributions->toArray());

        // Sort by date
        usort($activities, function($a, $b) {
            return $b['date'] <=> $a['date'];
        });

        return response()->json([
            'user_id' => $user->id,
            'activities' => array_slice($activities, 0, 20)
        ]);
    }

    /**
     * Get all users (for admin)
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles')->orderBy('name');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        $users = $query->paginate(20);

        return response()->json($users);
    }
}
