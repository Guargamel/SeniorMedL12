<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    // GET /api/medicines
    public function index()
    {
        $medicines = Medicine::with('category')
            ->withSum(['batches as available_quantity' => function ($query) {
                $query->where('expiry_date', '>=', now())
                    ->where('qty_remaining', '>', 0);
            }], 'qty_remaining')
            ->get();

        return response()->json($medicines);
    }

    // GET /api/medicines/{id}
    public function show($id)
    {
        $medicine = Medicine::with('category', 'batches')->findOrFail($id);
        return response()->json($medicine);
    }

    // POST /api/medicines
    public function store(Request $request)
    {
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'dosage_form' => 'required|string',
            'strength' => 'required|string',
            'category_id' => 'nullable|exists:medicine_categories,id',
            'unit' => 'required|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $medicine = Medicine::create($validated);

        return response()->json($medicine, 201);
    }

    // PUT /api/medicines/{id}
    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);

        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'dosage_form' => 'required|string',
            'strength' => 'required|string',
            'category_id' => 'nullable|exists:medicine_categories,id',
            'unit' => 'required|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $medicine->update($validated);

        return response()->json($medicine);
    }

    // DELETE /api/medicines/{id}
    public function destroy($id)
    {
        $medicine = Medicine::findOrFail($id);
        $medicine->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
