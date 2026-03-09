<?php

namespace App\Http\Controllers\Api;

use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MedicineBatchController extends Controller
{
    public function index()
    {
        $batches = MedicineBatch::with(['supplier', 'medicine'])->get();
        return response()->json($batches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'batch_no'    => 'required|string',
            'quantity'    => 'required|integer',
            'expiry_date' => 'required|date',
            'supplier_id' => 'required|exists:suppliers,id',
            'cost'        => 'required|numeric',
        ]);

        $medicineBatch = MedicineBatch::create($validated);
        return response()->json($medicineBatch, 201);
    }

    public function show($id)
    {
        $batch = MedicineBatch::with('medicine', 'supplier')->find($id);
        if (!$batch) {
            return response()->json(['error' => 'Medicine batch not found'], 404);
        }
        return response()->json($batch);
    }

    public function update(Request $request, $id)
    {
        $batch = MedicineBatch::find($id);
        if (!$batch) {
            return response()->json(['message' => 'Batch not found'], 404);
        }

        $validatedData = $request->validate([
            'batch_no'    => 'sometimes|required|string',
            'quantity'    => 'sometimes|required|integer',
            'expiry_date' => 'sometimes|required|date',
            'cost'        => 'sometimes|required|numeric',
            'supplier'    => 'sometimes|required|string',
        ]);

        $batch->update($validatedData);
        return response()->json($batch);
    }

    // Batches have no associated files — straightforward delete
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
