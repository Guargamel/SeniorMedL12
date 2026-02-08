<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Models\Sale;
use App\Models\Product;

class SaleController extends Controller
{
    /**
     * Dropdown options used by the React sales form.
     * Returns: { products: [{id,label}] }
     */
    public function formOptions(): JsonResponse
    {
        $products = Product::query()
            ->with('purchase:id,product')
            ->orderByDesc('id')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'label' => $p->purchase?->product ?? ($p->description ?: ('Product #' . $p->id)),
            ]);

        return response()->json(['products' => $products]);
    }

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
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $product = Product::query()->find($data['product']);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $unit = (float) $product->price - (float) $product->discount;
        if ($unit < 0) $unit = 0;
        $total = round($unit * (int) $data['quantity'], 2);

        $sale = Sale::create([
            'product_id' => $data['product'],
            'quantity' => $data['quantity'],
            'total_price' => $total,
        ]);

        return response()->json(['message' => 'Sale created', 'sale' => $sale->load('product')], 201);
    }

    public function update(Request $request, Sale $sale): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'product' => ['required', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $product = Product::query()->find($data['product']);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $unit = (float) $product->price - (float) $product->discount;
        if ($unit < 0) $unit = 0;
        $total = round($unit * (int) $data['quantity'], 2);

        $sale->update([
            'product_id' => $data['product'],
            'quantity' => $data['quantity'],
            'total_price' => $total,
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
