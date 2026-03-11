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
    $now = now();

    $medicines = Medicine::with('batches')
        ->get()
        ->map(function ($medicine) use ($now) {

            $validBatches   = $medicine->batches->filter(
                fn($b) => $b->expiry_date >= $now && $b->quantity > 0
            );
            $expiredBatches = $medicine->batches->filter(
                fn($b) => $b->expiry_date < $now
            );

            $medicine->quantity        = $validBatches->sum('quantity');
            $medicine->expiry_date     = $validBatches->min('expiry_date');
            $medicine->is_expired      = $medicine->batches->isNotEmpty()
                && $expiredBatches->count() === $medicine->batches->count();
            $medicine->is_low_stock    = $medicine->quantity > 0 && $medicine->quantity < 10;
            $medicine->is_out_of_stock = $medicine->quantity === 0;
            $medicine->is_ok           = !$medicine->is_expired
                && !$medicine->is_low_stock
                && !$medicine->is_out_of_stock;

            return $medicine;
        });

    return response()->json($medicines);
}

    public function show($id)
{
    $item = Medicine::with(['category:id,name', 'batches'])->findOrFail($id);

    $item->quantity = $item->batches
        ->filter(fn($b) => $b->expiry_date >= now() && $b->quantity > 0)
        ->sum('quantity');

    return response()->json($item);
}

    public function store(Request $request)
    {
        $request->merge(['is_active' => $request->input('is_active') ? 1 : 0]);

        $validated = $request->validate([
            'generic_name' => ['required', 'string', 'max:255'],
            'brand_name'   => ['nullable', 'string', 'max:255'],
            'dosage_form'  => ['nullable', 'string', 'max:255'],
            'strength'     => ['nullable', 'string', 'max:255'],
            'category_id'  => ['nullable', 'integer', 'exists:medicine_categories,id'],
            'unit'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'is_active'    => ['required', 'boolean'],
            'picture'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('picture')) {
            $path = $request->file('picture')->store('medicines', 'public');
            $validated['picture'] = $path;
        }

        $medicine = Medicine::create($validated);
        return response()->json($medicine, 201);
    }

    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);
        $request->merge(['is_active' => $request->input('is_active') ? 1 : 0]);

        $validated = $request->validate([
            'generic_name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand_name'   => ['nullable', 'string', 'max:255'],
            'dosage_form'  => ['nullable', 'string', 'max:255'],
            'strength'     => ['nullable', 'string', 'max:255'],
            'category_id'  => ['nullable', 'integer', 'exists:medicine_categories,id'],
            'unit'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'is_active'    => ['nullable', 'boolean'],
            'picture'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('picture')) {
            // Delete old picture from storage before saving new one
            if ($medicine->picture && Storage::disk('public')->exists($medicine->picture)) {
                Storage::disk('public')->delete($medicine->picture);
            }
            $path = $request->file('picture')->store('medicines', 'public');
            $validated['picture'] = $path;
        }

        $medicine->update($validated);
        return response()->json($medicine);
    }

    public function destroy($id)
    {
        try {
            $medicine = Medicine::findOrFail($id);

            // Delete medicine picture from storage
            if ($medicine->picture && Storage::disk('public')->exists($medicine->picture)) {
                Storage::disk('public')->delete($medicine->picture);
            }

            $medicine->delete();
            return response()->json(['message' => 'Medicine deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete medicine: ' . $e->getMessage()], 500);
        }
    }
}
