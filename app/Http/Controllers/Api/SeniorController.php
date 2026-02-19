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
    // SeniorsController.php

    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $query = User::query()
            ->with(['seniorProfile.bloodType'])
            ->whereHas('seniorProfile') // ensures only seniors
            ->orderByDesc('id');

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $data = $query->paginate(20);

        return response()->json($data);
    }



    public function show($id)
    {
        $user = User::with('seniorProfile')->findOrFail($id);
        return response()->json($user);
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        // 1️⃣ Create User first
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role_id' => 3, // <-- put the correct role_id for senior
            'phone' => $request->contact_no,
            'address' => $request->address,
        ]);

        // 2️⃣ Create Senior Profile linked to that user
        SeniorProfile::create([
            'user_id' => $user->id, // 🔥 THIS IS THE FIX
            'birthdate' => $request->birthdate,
            'sex' => $request->sex,
            'contact_no' => $request->contact_no,
            'barangay' => $request->barangay,
            'address' => $request->address,
            'notes' => $request->notes,

            'weight_kilos' => $request->weight_kilos,
            'height_cm' => $request->height_cm,
            'age' => $request->age,
            'blood_pressure_systolic' => $request->blood_pressure_systolic,
            'blood_pressure_diastolic' => $request->blood_pressure_diastolic,
            'blood_type_id' => $request->blood_type_id,
        ]);

        return response()->json(['message' => 'Senior created successfully']);
    }


    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],

            'birthdate' => ['nullable', 'date'],
            'sex' => ['nullable', 'in:Male,Female'],
            'contact_no' => ['nullable', 'string', 'max:50'],
            'barangay' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $user = User::with('seniorProfile')->findOrFail($id);

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            ...(!empty($data['password']) ? ['password' => Hash::make($data['password'])] : []),
        ]);

        $user->seniorProfile()->updateOrCreate(
            ['user_id' => $user->id],
            collect($data)->only([
                'birthdate',
                'sex',
                'contact_no',
                'barangay',
                'address',
                'notes'
            ])->toArray()
        );

        return response()->json([
            'message' => 'Updated',
            'user' => $user->fresh('seniorProfile')
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // This will automatically delete the senior_profile
        // IF your FK is ON DELETE CASCADE
        $user->delete();

        return response()->json([
            'message' => 'Senior deleted successfully'
        ]);
    }
}
