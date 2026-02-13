<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicineCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MedicineCategoryController extends Controller
{
    /**
     * Get all medicine categories
     */
    public function index(): JsonResponse
    {
        $categories = MedicineCategory::query()
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($categories);
    }

    /**
     * Get a single category
     */
    public function show($id): JsonResponse
    {
        $category = MedicineCategory::findOrFail($id);
        return response()->json($category);
    }

    /**
     * Create a new category
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:medicine_categories,name'],
            'description' => ['nullable', 'string'],
        ]);

        $category = MedicineCategory::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category
        ], 201);
    }

    /**
     * Update an existing category
     */
    public function update(Request $request, $id): JsonResponse
    {
        $category = MedicineCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:medicine_categories,name,' . $id],
            'description' => ['nullable', 'string'],
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category
        ]);
    }

    /**
     * Delete a category
     */
    public function destroy($id): JsonResponse
    {
        $category = MedicineCategory::findOrFail($id);
        
        // Check if category is being used by any medicines
        if ($category->medicines()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category that is in use by medicines'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
