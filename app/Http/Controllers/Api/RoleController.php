<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Avoid withCount('users') here: it can throw if the role/user linkage isn't ready yet.
        $roles = Role::query()
            ->with('permissions:id,name')
            ->select(['id', 'name', 'guard_name', 'created_at', 'updated_at'])
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $roles]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $role = Role::create(['name' => $request->input('name')]);

        if ($request->filled('permissions')) {
            $perms = Permission::query()->whereIn('name', $request->input('permissions', []))->get();
            $role->syncPermissions($perms);
        }

        return response()->json(['message' => 'Role created', 'role' => $role->load('permissions')], 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json(['role' => $role->load('permissions')]);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'permissions' => ['array'],
            'permissions.*' => ['string'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $role->update(['name' => $request->input('name')]);

        if ($request->has('permissions')) {
            $perms = Permission::query()->whereIn('name', $request->input('permissions', []))->get();
            $role->syncPermissions($perms);
        }

        return response()->json(['message' => 'Role updated', 'role' => $role->load('permissions')]);
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();
        return response()->json(['message' => 'Role deleted']);
    }
}
