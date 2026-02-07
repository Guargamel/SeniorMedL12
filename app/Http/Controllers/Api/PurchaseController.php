<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Purchase;

class PurchaseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $query = Purchase::query()
            ->with(['category', 'supplier'])
            ->orderByDesc('id');

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('product', 'like', "%{$q}%")
                    ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('supplier', fn($s) => $s->where('name', 'like', "%{$q}%"));
            });
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'product' => ['required', 'string', 'max:255'],
            'category' => ['required', 'integer'],
            'supplier' => ['required', 'integer'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'expiry_date' => ['required', 'date'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        // Map SPA field names to DB columns if your schema uses *_id.
        $payload = [
            'product' => $data['product'],
            'category_id' => $data['category'],
            'supplier_id' => $data['supplier'],
            'cost_price' => $data['cost_price'],
            'quantity' => $data['quantity'],
            'expiry_date' => $data['expiry_date'],
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('purchases', 'public');
            $payload['image_path'] = $path;
        }

        $purchase = Purchase::create($payload);

        return response()->json([
            'message' => 'Purchase created',
            'purchase' => $purchase->load(['category', 'supplier']),
        ], 201);
    }

    public function update(Request $request, Purchase $purchase): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'product' => ['required', 'string', 'max:255'],
            'category' => ['required', 'integer'],
            'supplier' => ['required', 'integer'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'expiry_date' => ['required', 'date'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $payload = [
            'product' => $data['product'],
            'category_id' => $data['category'],
            'supplier_id' => $data['supplier'],
            'cost_price' => $data['cost_price'],
            'quantity' => $data['quantity'],
            'expiry_date' => $data['expiry_date'],
        ];

        if ($request->hasFile('image')) {
            if ($purchase->image_path) {
                Storage::disk('public')->delete($purchase->image_path);
            }
            $path = $request->file('image')->store('purchases', 'public');
            $payload['image_path'] = $path;
        }

        $purchase->update($payload);

        return response()->json([
            'message' => 'Purchase updated',
            'purchase' => $purchase->load(['category', 'supplier']),
        ]);
    }

    public function destroy(Purchase $purchase): JsonResponse
    {
        if ($purchase->image_path) {
            Storage::disk('public')->delete($purchase->image_path);
        }
        $purchase->delete();
        return response()->json(['message' => 'Purchase deleted']);
    }

    public function report(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);
        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $query = Purchase::query()->with(['category', 'supplier'])->orderByDesc('id');

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->input('to'));
        }

        return response()->json(['data' => $query->get()]);
    }
}
