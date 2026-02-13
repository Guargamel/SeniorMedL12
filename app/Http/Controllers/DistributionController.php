<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Distribution;
use App\Models\User;
use App\Models\Medicine;

class DistributionController extends Controller
{
    // app/Http/Controllers/Api/DistributionController.php
    // app/Http/Controllers/Api/DistributionController.php
    public function distribute(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email', // Allow users to search by email
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // Find the user by email (can be any user, not just seniors)
        $user = User::where('email', $request->input('email'))->firstOrFail();
        $medicine = Medicine::findOrFail($request->input('medicine_id'));

        // Check if there is enough stock
        if ($medicine->stock_quantity < $request->input('quantity')) {
            return response()->json(['message' => 'Not enough stock'], 400);
        }

        // Reduce stock in the medicine table
        $medicine->stock_quantity -= $request->input('quantity');
        $medicine->save();

        // Create the distribution record
        $distribution = Distribution::create([
            'user_id' => $user->id,
            'medicine_id' => $medicine->id,
            'quantity' => $request->input('quantity'),
            'distribution_date' => now(),
        ]);

        // Optional: Send notification (if needed)
        // $user->notify(new DistributionNotification($distribution));

        return response()->json(['message' => 'Stock distributed successfully', 'distribution' => $distribution]);
    }
}
