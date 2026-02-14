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
        // Eager load the 'medicine' relationship (assuming a relationship exists)
        $batches = MedicineBatch::with('medicine', 'supplier')->get(); // Or you could use `select` if 'medicine_type' is a column in the batch table
        return response()->json($batches);
    }

    // Create a new batch
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'batch_no' => 'required|string',
            'quantity' => 'required|integer',
            'expiry_date' => 'required|date',
            'cost' => 'required|numeric',
            'supplier' => 'required|string',
        ]);

        $batch = MedicineBatch::create($validatedData);

        return response()->json($batch, 201);
    }

    // Fetch a specific batch by ID
    public function show($id)
    {
        $batch = MedicineBatch::find($id);

        if (!$batch) {
            return response()->json(['message' => 'Batch not found'], 404);
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
