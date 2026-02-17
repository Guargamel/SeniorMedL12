<?php

namespace App\Http\Controllers\Api;

use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MedicineBatchController extends Controller
{
    // Fetch all medicine batches
    public function index()
    {
        // Eager load the supplier relationship (and any other relationships you need)
        $batches = MedicineBatch::with(['supplier', 'medicine'])->get();
        return response()->json($batches);
    }

    // Create a new batch
    public function store(Request $request)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id', // Ensure this is an ID reference
            'batch_no' => 'required|string',
            'quantity' => 'required|integer',
            'expiry_date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'cost' => 'required|numeric',
        ]);

        // Create the new medicine batch
        $medicineBatch = MedicineBatch::create([
            'medicine_id' => $validated['medicine_id'],
            'batch_no' => $validated['batch_no'],
            'quantity' => $validated['quantity'],
            'expiry_date' => $validated['expiry_date'],
            'supplier_id' => $validated['supplier_id'],
            'cost' => $validated['cost'],
        ]);

        return response()->json($medicineBatch, 201); // Return the created batch with status code 201
    }


    // Fetch a specific batch by ID
    public function show($id)
    {
        // Eager load the medicine relationship
        $batch = MedicineBatch::with('medicine', 'supplier')->find($id);

        if (!$batch) {
            return response()->json(['error' => 'Medicine batch not found'], 404);
        }

        return response()->json($batch);
    }


    // Update a specific batch
    public function update(Request $request, $id)
    {
        $batch = MedicineBatch::find($id);

        if (!$batch) {
            return response()->json(['message' => 'Batch not found'], 404);
        }

        $validatedData = $request->validate([
            'batch_no' => 'sometimes|required|string',
            'quantity' => 'sometimes|required|integer',
            'expiry_date' => 'sometimes|required|date',
            'cost' => 'sometimes|required|numeric',
            'supplier' => 'sometimes|required|string',
        ]);

        $batch->update($validatedData);

        return response()->json($batch);
    }

    // Delete a specific batch
    public function destroy($id)
    {
        $batch = MedicineBatch::find($id);

        if (!$batch) {
            return response()->json(['message' => 'Batch not found'], 404);
        }

        $batch->delete();

        return response()->json(['message' => 'Batch deleted successfully']);
    }
}
