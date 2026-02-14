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
        // Include category name + computed "quantity" (sum of batch quantities)
        $items = Medicine::query()
            ->with('category:id,name')
            ->withSum('batches as quantity', 'quantity')
            ->orderByDesc('id')
            ->get();

        return response()->json($items);
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
        $medicine = Medicine::findOrFail($id);

        if ($medicine->picture) {
            Storage::disk('public')->delete($medicine->picture);
        }

        $medicine->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
