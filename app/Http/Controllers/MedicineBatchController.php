<?php

use App\Http\Controllers\Controller;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;

class MedicineBatchController extends Controller
{
    public function store(Request $request)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'batch_no' => 'required|string',
            'expiry_date' => 'required|date|after:today',
            'quantity' => 'required|integer|min:1',
            'cost' => 'required|numeric|min:0',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        // Create the new batch
        $batch = MedicineBatch::create([
            'medicine_id' => $validated['medicine_id'],
            'batch_no' => $validated['batch_no'],
            'expiry_date' => $validated['expiry_date'],
            'quantity' => $validated['quantity'],
            'received_at' => now(),
            'supplier_id' => $validated['supplier_id'],
            'cost' => $validated['cost'],
        ]);

        // Eager load the medicine relationship for the newly created batch
        $batchWithMedicine = MedicineBatch::with('medicine')->find($batch->id);

        return response()->json([
            'message' => 'Batch added successfully',
            'batch' => $batchWithMedicine, // Return the batch along with its associated medicine
        ], 201);
    }
}
