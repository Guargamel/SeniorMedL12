<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // These queries assume you have these tables/models:
        // - categories
        // - products (or purchases) with expiry_date
        // - users
        // - sales with created_at + total_price
        //
        // If your schema differs, adjust the table/column names.

        $today = now()->startOfDay();

        $todaySales = DB::table('sales')
            ->where('created_at', '>=', $today)
            ->sum('total_price');

        $totalCategories = DB::table('categories')->count();

        $totalExpiredProducts = DB::table('purchases')
            ->whereNotNull('expiry_date')
            ->whereDate('expiry_date', '<', now()->toDateString())
            ->count();

        $totalUsers = DB::table('users')->count();

        $recentSales = DB::table('sales')
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                return [
                    'medicine' => $row->medicine ?? $row->product_name ?? $row->product ?? 'N/A',
                    'quantity' => $row->quantity ?? 0,
                    'total_price' => $row->total_price ?? 0,
                    'date' => optional($row->created_at)->format('Y-m-d H:i:s') ?? (string) ($row->created_at ?? ''),
                ];
            });

        return response()->json([
            'stats' => [
                'today_sales' => $todaySales,
                'total_categories' => $totalCategories,
                'total_expired_products' => $totalExpiredProducts,
                'total_users' => $totalUsers,
                'user_name' => $user?->name ?? '',
                'currency' => '₱',
            ],
            'recent_sales' => $recentSales,
        ]);
    }
}
