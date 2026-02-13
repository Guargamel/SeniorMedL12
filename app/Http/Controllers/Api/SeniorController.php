<?php

// app/Http/Controllers/Api/SeniorController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SeniorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SeniorController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string)$request->query('q', ''));

        $users = User::query()
            ->role('senior_citizen')
            ->with('seniorProfile')
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('name', 'like', "%$q%")
                        ->orWhere('email', 'like', "%$q%");
                });
            })
            ->orderBy('name')
            ->paginate(15);

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],

            // senior fields (optional)
            'birthdate' => ['nullable', 'date'],
            'sex' => ['nullable', 'in:Male,Female'],
            'contact_no' => ['nullable', 'string', 'max:50'],
            'barangay' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $user->assignRole('senior_citizen'); // automatically assign "senior_citizen" role

            SeniorProfile::create([
                'user_id' => $user->id,
                'birthdate' => $data['birthdate'] ?? null,
                'sex' => $data['sex'] ?? null,
                'contact_no' => $data['contact_no'] ?? null,
                'barangay' => $data['barangay'] ?? null,
                'address' => $data['address'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            return response()->json(['message' => 'Senior registered', 'user' => $user], 201);
        });
    }
}
