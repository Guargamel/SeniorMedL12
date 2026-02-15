<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicineController extends Controller
{
    public function index()
    {
        $medicines = Medicine::with('batches') // Eager load the related medicine batches
            ->get()
            ->map(function ($medicine) {
                // Calculate the total quantity for this medicine by summing all related batches
                $medicine->quantity = $medicine->batches->sum('quantity');

                // Get the earliest expiry date from the batches (you can change this logic if needed)
                $earliestExpiry = $medicine->batches->min('expiry_date');
                $medicine->expiry_date = $earliestExpiry; // Assign the earliest expiry date to the medicine

                // Check if any batch is expired
                $medicine->is_expired = $medicine->batches->some(function ($batch) {
                    return $batch->expiry_date < now(); // Check if any batch has expired
                });

                // Check if the stock is low (define low stock threshold, e.g., 10 units)
                $medicine->is_low_stock = $medicine->quantity < 10;

                // Determine if the medicine is OK (not expired and sufficient stock)
                $medicine->is_ok = !$medicine->is_expired && !$medicine->is_low_stock;

                return $medicine;
            });

        return response()->json($medicines);
    }

    public function show($id)
    {
        $item = Medicine::query()
            ->with('category:id,name')
            ->withSum('batches as quantity', 'quantity')
            ->findOrFail($id);

        return response()->json($item);
    }

    public function store(Request $request)
    {
        // Force is_active to be 1 or 0 explicitly.
        $request->merge([
            'is_active' => $request->input('is_active') ? 1 : 0,  // Ensure is_active is 1 or 0
        ]);

        // Validate incoming data, including the is_active field
        $validated = $request->validate([
            'generic_name' => ['required', 'string', 'max:255'],
            'brand_name'   => ['nullable', 'string', 'max:255'],
            'dosage_form'  => ['nullable', 'string', 'max:255'],
            'strength'     => ['nullable', 'string', 'max:255'],
            'category_id'  => ['nullable', 'integer', 'exists:medicine_categories,id'],
            'unit'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'is_active'    => ['required', 'boolean'],  // Validate that is_active is true/false
            'picture'      => ['nullable', 'image', 'max:5120'], // Max 5MB for the picture
        ]);

        // Handle the picture upload (if any)
        if ($request->hasFile('picture')) {
            $path = $request->file('picture')->store('medicines', 'public');
            $validated['picture'] = $path;
        }

        // Create the medicine record
        $medicine = Medicine::create($validated);

        return response()->json($medicine, 201);
    }


    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);

        // Force is_active to be 1 or 0 explicitly
        $request->merge([
            'is_active' => $request->input('is_active') ? 1 : 0,  // Ensure is_active is 1 or 0
        ]);

        // Validate the incoming data, including the is_active field
        $validated = $request->validate([
            'generic_name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand_name'   => ['nullable', 'string', 'max:255'],
            'dosage_form'  => ['nullable', 'string', 'max:255'],
            'strength'     => ['nullable', 'string', 'max:255'],
            'category_id'  => ['nullable', 'integer', 'exists:medicine_categories,id'],
            'unit'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'is_active'    => ['nullable', 'boolean'],  // Validate that is_active is true/false
            'picture'      => ['nullable', 'image', 'max:5120'],
        ]);

        // Handle the picture upload if a new one is provided
        if ($request->hasFile('picture')) {
            if ($medicine->picture) {
                Storage::disk('public')->delete($medicine->picture); // Delete old picture
            }
            $path = $request->file('picture')->store('medicines', 'public');
            $validated['picture'] = $path;
        }

        // Update the medicine record with the validated data
        $medicine->update($validated);

        return response()->json($medicine);
    }

    public function destroy($id)
    {
        try {
            // Find the medicine by ID and delete it
            $medicine = Medicine::findOrFail($id);
            $medicine->delete();

            return response()->json(['message' => 'Medicine deleted successfully'], 200);
        } catch (\Exception $e) {
            // Return a response if something goes wrong
            return response()->json(['error' => 'Failed to delete medicine'], 500);
        }
    }
}
