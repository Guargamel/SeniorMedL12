<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $query = Product::query()
            ->with(['purchase'])
            ->orderByDesc('id');

        if ($q !== '') {
            $query->where('description', 'like', "%{$q}%")
                  ->orWhereHas('purchase', fn($p) => $p->where('product', 'like', "%{$q}%"));
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'product' => ['required', 'integer'], // purchase id
            'price' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $product = Product::create([
            'purchase_id' => $data['product'],
            'price' => $data['price'],
            'discount' => $data['discount'] ?? 0,
            'description' => $data['description'],
        ]);

        return response()->json(['message' => 'Product created', 'product' => $product->load('purchase')], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'product' => ['required', 'integer'], // purchase id
            'price' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $product->update([
            'purchase_id' => $data['product'],
            'price' => $data['price'],
            'discount' => $data['discount'] ?? 0,
            'description' => $data['description'],
        ]);

        return response()->json(['message' => 'Product updated', 'product' => $product->load('purchase')]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    public function expired(Request $request): JsonResponse
    {
        // If you track expiry on purchases, you can get expired inventory via the purchase relation.
        $rows = Product::query()
            ->with(['purchase'])
            ->whereHas('purchase', function ($q) {
                $q->whereNotNull('expiry_date')->whereDate('expiry_date', '<', now()->toDateString());
            })
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json(['data' => $rows]);
    }

    public function outstock(Request $request): JsonResponse
    {
        $threshold = (int) $request->query('threshold', 1);

        $rows = Product::query()
            ->with(['purchase'])
            ->whereHas('purchase', function ($q) use ($threshold) {
                $q->where('quantity', '<=', $threshold);
            })
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json(['data' => $rows]);
    }
}
