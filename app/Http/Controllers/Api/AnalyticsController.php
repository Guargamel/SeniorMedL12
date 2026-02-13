<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Distribution;
use App\Models\User;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get dashboard analytics
     */
    public function dashboard(): JsonResponse
    {
        $data = [
            'overview' => $this->getOverview(),
            'distributions' => $this->getDistributionStats(),
            'medicines' => $this->getMedicineStats(),
            'trends' => $this->getTrends(),
        ];

        return response()->json($data);
    }

    /**
     * Get overview statistics
     */
    private function getOverview(): array
    {
        return [
            'total_medicines' => Medicine::count(),
            'total_seniors' => User::whereHas('roles', fn($q) => $q->where('name', 'senior_citizen'))->count(),
            'total_staff' => User::whereHas('roles', fn($q) => $q->whereIn('name', ['staff', 'super-admin']))->count(),
            'total_distributions' => Distribution::count(),
            'total_stock_value' => Medicine::withSum('batches', 'quantity')->get()->sum('batches_sum_quantity'),
            'low_stock_count' => Medicine::withSum('batches', 'quantity')
                ->having('batches_sum_quantity', '<=', 10)
                ->count(),
            'expired_count' => Medicine::whereHas('batches', function($q) {
                $q->where('expiry_date', '<', now())
                  ->where('quantity', '>', 0);
            })->count(),
        ];
    }

    /**
     * Get distribution statistics
     */
    private function getDistributionStats(): array
    {
        $thisMonth = Distribution::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $lastMonth = Distribution::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        return [
            'this_month' => $thisMonth,
            'last_month' => $lastMonth,
            'change_percentage' => $lastMonth > 0 ? (($thisMonth - $lastMonth) / $lastMonth) * 100 : 0,
            'total_quantity' => Distribution::sum('quantity'),
            'top_recipients' => $this->getTopRecipients(),
        ];
    }

    /**
     * Get medicine statistics
     */
    private function getMedicineStats(): array
    {
        return [
            'by_category' => Medicine::select('category_id', DB::raw('count(*) as count'))
                ->groupBy('category_id')
                ->with('category:id,name')
                ->get()
                ->map(function($item) {
                    return [
                        'category' => $item->category->name ?? 'Uncategorized',
                        'count' => $item->count
                    ];
                }),
            'most_distributed' => $this->getMostDistributedMedicines(),
            'low_stock' => Medicine::withSum('batches', 'quantity')
                ->having('batches_sum_quantity', '<=', 10)
                ->with('category:id,name')
                ->limit(10)
                ->get(),
        ];
    }

    /**
     * Get trends data (last 30 days)
     */
    private function getTrends(): array
    {
        $distributions = Distribution::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(quantity) as total_quantity')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'distributions' => $distributions,
        ];
    }

    /**
     * Get top recipients
     */
    private function getTopRecipients(int $limit = 10): array
    {
        return Distribution::select('user_id', DB::raw('count(*) as distribution_count'))
            ->with('user:id,name,email')
            ->groupBy('user_id')
            ->orderByDesc('distribution_count')
            ->limit($limit)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->user->name ?? 'Unknown',
                    'email' => $item->user->email ?? '',
                    'count' => $item->distribution_count
                ];
            })
            ->toArray();
    }

    /**
     * Get most distributed medicines
     */
    private function getMostDistributedMedicines(int $limit = 10): array
    {
        return Distribution::select('medicine_id', DB::raw('count(*) as distribution_count'), DB::raw('sum(quantity) as total_quantity'))
            ->with('medicine:id,generic_name,brand_name')
            ->groupBy('medicine_id')
            ->orderByDesc('distribution_count')
            ->limit($limit)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->medicine->generic_name ?? 'Unknown',
                    'brand' => $item->medicine->brand_name ?? '',
                    'distribution_count' => $item->distribution_count,
                    'total_quantity' => $item->total_quantity
                ];
            })
            ->toArray();
    }

    /**
     * Get expiring medicines alert
     */
    public function expiringMedicines(Request $request): JsonResponse
    {
        $days = $request->query('days', 30); // Default 30 days

        $expiring = MedicineBatch::where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>=', now())
            ->where('quantity', '>', 0)
            ->with('medicine:id,generic_name,brand_name')
            ->orderBy('expiry_date')
            ->get();

        return response()->json($expiring);
    }

    /**
     * Get low stock medicines
     */
    public function lowStock(Request $request): JsonResponse
    {
        $threshold = $request->query('threshold', 10);

        $lowStock = Medicine::withSum('batches', 'quantity')
            ->having('batches_sum_quantity', '<=', $threshold)
            ->with('category:id,name')
            ->get();

        return response()->json($lowStock);
    }
}
