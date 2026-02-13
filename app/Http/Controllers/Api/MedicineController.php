<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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
        $validated = $request->validate([
            'generic_name' => ['required', 'string', 'max:255'],
            'brand_name'   => ['nullable', 'string', 'max:255'],
            'dosage_form'  => ['nullable', 'string', 'max:255'],
            'strength'     => ['nullable', 'string', 'max:255'],
            'category_id'  => ['nullable', 'integer', 'exists:medicine_categories,id'],
            'unit'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'is_active'    => ['nullable', 'boolean'],
            'picture'      => ['nullable', 'image', 'max:5120'], // 5MB
        ]);

        // Handle upload (optional)
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

        $validated = $request->validate([
            'generic_name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand_name'   => ['nullable', 'string', 'max:255'],
            'dosage_form'  => ['nullable', 'string', 'max:255'],
            'strength'     => ['nullable', 'string', 'max:255'],
            'category_id'  => ['nullable', 'integer', 'exists:medicine_categories,id'],
            'unit'         => ['nullable', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'is_active'    => ['nullable', 'boolean'],
            'picture'      => ['nullable', 'image', 'max:5120'],
        ]);

        // Replace picture if new one is uploaded
        if ($request->hasFile('picture')) {
            if ($medicine->picture) {
                Storage::disk('public')->delete($medicine->picture);
            }
            $path = $request->file('picture')->store('medicines', 'public');
            $validated['picture'] = $path;
        }

        $medicine->update($validated);

        return response()->json($medicine);
    }

    // app/Http/Controllers/Api/MedicineController.php
    public function updateStock(Request $request, $medicineId)
    {
        $medicine = Medicine::findOrFail($medicineId);

        // Validate the request
        $request->validate([
            'stock_quantity' => 'required|integer|min:0', // Ensure quantity is a positive integer
        ]);

        // Update stock quantity
        $medicine->stock_quantity = $request->input('stock_quantity');
        $medicine->save();

        return response()->json(['message' => 'Stock quantity updated successfully', 'medicine' => $medicine]);
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

    /**
     * GET /api/medicines/outstock
     * Out of stock = total remaining across batches <= 0
     */
    public function outstock()
    {
        $items = Medicine::query()
            ->with('category:id,name')
            ->withSum('batches as quantity', 'quantity')
            ->having('quantity', '<=', 0)
            ->orderByDesc('id')
            ->get();

        return response()->json($items);
    }

    /**
     * GET /api/medicines/expired
     * Expired = has at least one batch with expiry_date < today AND qty_remaining > 0
     * (so it actually matters)
     */
    public function expired()
    {
        $today = now()->toDateString();

        $items = Medicine::query()
            ->with('category:id,name')
            ->whereHas('batches', function ($q) use ($today) {
                $q->whereDate('expiry_date', '<', $today)
                    ->where('quantity', '>', 0);
            })
            ->withSum('batches as quantity', 'quantity')
            ->orderByDesc('id')
            ->get();

        return response()->json($items);
    }
}
