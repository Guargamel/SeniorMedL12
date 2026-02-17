<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Distribution;
use Illuminate\Support\Facades\DB;

class DistributionController extends Controller
{
    public function store(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email', // Ensure the email exists in the users table
            'medicine_id' => 'required|exists:medicines,id', // Ensure the medicine exists in the medicines table
            'quantity' => 'required|integer|min:1', // Ensure the quantity is a positive integer
        ]);

        // Begin a database transaction to ensure stock update and distribution creation happen together
        DB::beginTransaction();

        try {
            // Get the medicine record
            $medicine = Medicine::findOrFail($request->input('medicine_id'));

            // Calculate the total available stock by summing the quantity from all batches
            $totalStock = DB::table('medicine_batches')
                ->where('medicine_id', $request->input('medicine_id'))
                ->sum('quantity');  // Sum of all batches for the selected medicine

            // Check if there is enough stock
            if ($totalStock < $request->input('quantity')) {
                return response()->json(['message' => 'Not enough stock'], 400);
            }

            // Find batches to distribute the stock
            $quantityRemaining = $request->input('quantity');
            $batches = MedicineBatch::where('medicine_id', $request->input('medicine_id'))
                ->where('quantity', '>', 0)  // Ensure batches with stock are considered
                ->orderBy('expiry_date')  // Optional: prioritize batches based on expiry date (first in, first out)
                ->get();

            foreach ($batches as $batch) {
                if ($quantityRemaining <= 0) break;

                if ($batch->quantity >= $quantityRemaining) {
                    // If the batch has enough stock to fulfill the request
                    $batch->quantity -= $quantityRemaining;
                    $batch->save();  // Save the updated batch stock
                    $quantityRemaining = 0;  // All stock has been distributed
                } else {
                    // If the batch doesn't have enough stock to fulfill the request, use the whole batch
                    $quantityRemaining -= $batch->quantity;
                    $batch->quantity = 0;  // Set the batch quantity to 0
                    $batch->save();  // Save the updated batch stock
                }
            }

            // After reducing the stock, create the distribution record
            $user = User::where('email', $request->input('email'))->firstOrFail();

            // Create a new distribution record
            $distribution = Distribution::create([
                'user_id' => $user->id,
                'medicine_id' => $medicine->id,
                'quantity' => $request->input('quantity'),
                'distribution_date' => now(),
            ]);

            // Commit the transaction
            DB::commit();

            return response()->json(['message' => 'Stock distributed successfully', 'distribution' => $distribution]);
        } catch (\Exception $e) {
            // Rollback in case of any error
            DB::rollback();
            return response()->json(['message' => 'Failed to distribute stock', 'error' => $e->getMessage()], 500);
        }
    }
}
