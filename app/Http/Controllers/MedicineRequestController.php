<?php

use App\Models\MedicineRequest;
use Illuminate\Http\Request;

class MedicineRequestController extends Controller
{
    public function store(Request $request)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id', // Ensure the medicine exists in the 'medicines' table
            'quantity' => 'required|integer|min:1', // Validate the quantity
            'reason' => 'nullable|string|max:255', // Optional reason field
        ]);

        // Create the medicine request
        try {
            $medicineRequest = MedicineRequest::create([
                'medicine_id' => $validated['medicine_id'],
                'quantity' => $validated['quantity'],
                'reason' => $validated['reason'] ?? null,  // If the reason is not provided, it's set to null
                'status' => 'pending',  // Default status is 'pending'
            ]);

            return response()->json(['message' => 'Medicine request submitted successfully!'], 200);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error($e->getMessage());
            return response()->json(['error' => 'Failed to create request', 'message' => $e->getMessage()], 500);
        }
    }
}
