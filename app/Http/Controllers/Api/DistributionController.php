<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Distribution;
use App\Models\User;
use App\Models\Medicine;

class DistributionController extends Controller
{
    public function store(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',  // Ensure the email exists in the users table
            'medicine_id' => 'required|exists:medicines,id', // Ensure the medicine exists in the medicines table
            'quantity' => 'required|integer|min:1',  // Ensure the quantity is a positive integer
        ]);

        // Get the medicine record
        $medicine = Medicine::findOrFail($request->input('medicine_id'));

        // Check if there is enough stock
        if ($medicine->stock_quantity < $request->input('quantity')) {
            return response()->json(['message' => 'Not enough stock'], 400);  // If not enough stock, return error
        }

        // Reduce the stock from the medicine's stock_quantity
        $medicine->stock_quantity -= $request->input('quantity');
        $medicine->save(); // Save the updated stock_quantity

        // Get the user using the email
        $user = User::where('email', $request->input('email'))->firstOrFail();

        // Create a new distribution record
        $distribution = Distribution::create([
            'user_id' => $user->id,
            'medicine_id' => $medicine->id,
            'quantity' => $request->input('quantity'),
            'distribution_date' => now(),
        ]);

        return response()->json(['message' => 'Stock distributed successfully', 'distribution' => $distribution]);
    }
}
