<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Models\Sale;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $query = Sale::query()
            ->with(['product'])
            ->orderByDesc('id');

        if ($q !== '') {
            $query->whereHas('product', fn($p) => $p->where('description', 'like', "%{$q}%"));
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'product' => ['required', 'integer'], // product id
            'quantity' => ['required', 'integer', 'min:1'],
            'total_price' => ['required', 'numeric', 'min:0'],
            'customer' => ['nullable', 'string', 'max:255'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $sale = Sale::create([
            'product_id' => $data['product'],
            'quantity' => $data['quantity'],
            'total_price' => $data['total_price'],
            'customer' => $data['customer'] ?? null,
        ]);

        return response()->json(['message' => 'Sale created', 'sale' => $sale->load('product')], 201);
    }

    public function update(Request $request, Sale $sale): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'product' => ['required', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
            'total_price' => ['required', 'numeric', 'min:0'],
            'customer' => ['nullable', 'string', 'max:255'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $sale->update([
            'product_id' => $data['product'],
            'quantity' => $data['quantity'],
            'total_price' => $data['total_price'],
            'customer' => $data['customer'] ?? null,
        ]);

        return response()->json(['message' => 'Sale updated', 'sale' => $sale->load('product')]);
    }

    public function destroy(Sale $sale): JsonResponse
    {
        $sale->delete();
        return response()->json(['message' => 'Sale deleted']);
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

        $query = Sale::query()->with('product')->orderByDesc('id');

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->input('to'));
        }

        return response()->json(['data' => $query->get()]);
    }
}
