<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $query = User::query()
            ->with('roles')
            ->whereHas('roles', fn($r) => $r->whereIn('name', ['staff', 'super-admin']));

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        return $query->orderBy('name')->paginate(10);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', 'string'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);

        if ($request->filled('role')) {
            $role = Role::query()->where('name', $request->input('role'))->first();
            if ($role) $user->syncRoles([$role]);
        }

        return response()->json(['message' => 'User created', 'user' => $user->load('roles')], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['user' => $user->load('roles')]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'string'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $payload = [
            'name' => $request->input('name'),
            'email' => $request->input('email'),
        ];

        if ($request->filled('password')) {
            $payload['password'] = Hash::make($request->input('password'));
        }

        $user->update($payload);

        if ($request->has('role')) {
            if ($request->filled('role')) {
                $role = Role::query()->where('name', $request->input('role'))->first();
                if ($role) $user->syncRoles([$role]);
            } else {
                $user->syncRoles([]);
            }
        }

        return response()->json(['message' => 'User updated', 'user' => $user->load('roles')]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    // app/Http/Controllers/Api/UserController.php
    public function autocompleteEmail(Request $request)
    {
        $email = $request->query('email'); // Get the search query parameter

        // Fetch users that match the given email prefix (using LIKE query)
        $users = User::where('email', 'like', "%$email%")
            ->limit(5) // Limit to 5 results for performance
            ->get(['id', 'name', 'email']); // Only return id, name, and email

        return response()->json($users);
    }
}
