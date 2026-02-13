<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $query = User::query()
            ->with('roles')
            ->whereHas('roles', function ($r) {
                $r->whereIn('name', ['staff', 'super-admin']);
            })
            ->orderByDesc('id');

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:staff,super-admin'], // ✅ only staff roles
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);

        $role = Role::query()
            ->where('name', $request->input('role'))
            ->where('guard_name', 'web')
            ->first();

        if ($role) $user->syncRoles([$role]);

        return response()->json(['message' => 'Staff created', 'user' => $user->load('roles')], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (!$user->hasAnyRole(['staff', 'super-admin'])) {
            return response()->json(['message' => 'Not a staff account'], 404);
        }

        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'in:staff,super-admin'],
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

        $role = Role::query()
            ->where('name', $request->input('role'))
            ->where('guard_name', 'web')
            ->first();

        if ($role) $user->syncRoles([$role]);

        return response()->json(['message' => 'Staff updated', 'user' => $user->load('roles')]);
    }

    public function destroy(User $user): JsonResponse
    {
        if (!$user->hasAnyRole(['staff', 'super-admin'])) {
            return response()->json(['message' => 'Not a staff account'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'Staff deleted']);
    }

    public function show($id)
    {
        // Find the staff by their ID
        $staff = User::find($id);

        // Check if the staff member was found
        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        // Return the staff member as a JSON response
        return response()->json($staff);
    }
}
