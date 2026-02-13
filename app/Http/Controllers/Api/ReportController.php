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

class ReportController extends Controller
{
    /**
     * Generate inventory report
     */
    public function inventory(Request $request): JsonResponse
    {
        $medicines = Medicine::with(['category', 'batches'])
            ->withSum('batches', 'quantity')
            ->get()
            ->map(function($medicine) {
                return [
                    'id' => $medicine->id,
                    'generic_name' => $medicine->generic_name,
                    'brand_name' => $medicine->brand_name,
                    'category' => $medicine->category->name ?? 'Uncategorized',
                    'strength' => $medicine->strength,
                    'unit' => $medicine->unit,
                    'total_quantity' => $medicine->batches_sum_quantity ?? 0,
                    'batches_count' => $medicine->batches->count(),
                    'status' => $this->getStockStatus($medicine->batches_sum_quantity ?? 0),
                ];
            });

        return response()->json([
            'report_type' => 'inventory',
            'generated_at' => now()->toIso8601String(),
            'total_medicines' => $medicines->count(),
            'total_stock' => $medicines->sum('total_quantity'),
            'data' => $medicines
        ]);
    }

    /**
     * Generate distribution report
     */
    public function distributions(Request $request): JsonResponse
    {
        $query = Distribution::with(['user', 'medicine'])
            ->orderByDesc('created_at');

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Filter by senior
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by medicine
        if ($request->has('medicine_id')) {
            $query->where('medicine_id', $request->medicine_id);
        }

        $distributions = $query->get()->map(function($dist) {
            return [
                'id' => $dist->id,
                'date' => $dist->created_at->format('Y-m-d'),
                'time' => $dist->created_at->format('H:i:s'),
                'senior_name' => $dist->user->name ?? 'Unknown',
                'senior_email' => $dist->user->email ?? '',
                'medicine' => $dist->medicine->generic_name ?? 'Unknown',
                'brand' => $dist->medicine->brand_name ?? '',
                'quantity' => $dist->quantity,
                'distributed_by' => $dist->distributedBy->name ?? 'System',
            ];
        });

        return response()->json([
            'report_type' => 'distributions',
            'generated_at' => now()->toIso8601String(),
            'filters' => $request->only(['start_date', 'end_date', 'user_id', 'medicine_id']),
            'total_distributions' => $distributions->count(),
            'total_quantity' => $distributions->sum('quantity'),
            'data' => $distributions
        ]);
    }

    /**
     * Generate expiry report
     */
    public function expiry(Request $request): JsonResponse
    {
        $status = $request->query('status', 'all'); // all, expired, expiring

        $query = MedicineBatch::with('medicine')->where('quantity', '>', 0);

        if ($status === 'expired') {
            $query->where('expiry_date', '<', now());
        } elseif ($status === 'expiring') {
            $query->where('expiry_date', '>=', now())
                  ->where('expiry_date', '<=', now()->addDays(30));
        }

        $batches = $query->orderBy('expiry_date')->get()->map(function($batch) {
            return [
                'medicine' => $batch->medicine->generic_name ?? 'Unknown',
                'brand' => $batch->medicine->brand_name ?? '',
                'batch_number' => $batch->batch_number ?? 'N/A',
                'expiry_date' => $batch->expiry_date->format('Y-m-d'),
                'days_until_expiry' => now()->diffInDays($batch->expiry_date, false),
                'quantity' => $batch->quantity,
                'status' => $batch->expiry_date < now() ? 'expired' : ($batch->expiry_date <= now()->addDays(30) ? 'expiring_soon' : 'valid'),
            ];
        });

        return response()->json([
            'report_type' => 'expiry',
            'generated_at' => now()->toIso8601String(),
            'status_filter' => $status,
            'total_batches' => $batches->count(),
            'total_quantity' => $batches->sum('quantity'),
            'data' => $batches
        ]);
    }

    /**
     * Generate senior citizens report
     */
    public function seniors(Request $request): JsonResponse
    {
        $seniors = User::whereHas('roles', fn($q) => $q->where('name', 'senior_citizen'))
            ->with(['distributions' => function($q) {
                $q->with('medicine:id,generic_name,brand_name');
            }])
            ->get()
            ->map(function($senior) {
                return [
                    'id' => $senior->id,
                    'name' => $senior->name,
                    'email' => $senior->email,
                    'registered_date' => $senior->created_at->format('Y-m-d'),
                    'total_distributions' => $senior->distributions->count(),
                    'last_distribution' => $senior->distributions->sortByDesc('created_at')->first()?->created_at->format('Y-m-d'),
                    'medicines_received' => $senior->distributions->pluck('medicine.generic_name')->unique()->values(),
                ];
            });

        return response()->json([
            'report_type' => 'seniors',
            'generated_at' => now()->toIso8601String(),
            'total_seniors' => $seniors->count(),
            'data' => $seniors
        ]);
    }

    /**
     * Generate usage statistics report
     */
    public function usage(Request $request): JsonResponse
    {
        $period = $request->query('period', 'month'); // week, month, year

        $startDate = match($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };

        $medicineUsage = Distribution::select('medicine_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('COUNT(*) as distribution_count'))
            ->where('created_at', '>=', $startDate)
            ->with('medicine:id,generic_name,brand_name,category_id')
            ->groupBy('medicine_id')
            ->orderByDesc('total_quantity')
            ->get()
            ->map(function($item) {
                return [
                    'medicine' => $item->medicine->generic_name ?? 'Unknown',
                    'brand' => $item->medicine->brand_name ?? '',
                    'total_quantity' => $item->total_quantity,
                    'distribution_count' => $item->distribution_count,
                    'average_per_distribution' => round($item->total_quantity / $item->distribution_count, 2),
                ];
            });

        return response()->json([
            'report_type' => 'usage',
            'generated_at' => now()->toIso8601String(),
            'period' => $period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
            'total_medicines' => $medicineUsage->count(),
            'total_distributed' => $medicineUsage->sum('total_quantity'),
            'data' => $medicineUsage
        ]);
    }

    /**
     * Get stock status helper
     */
    private function getStockStatus(int $quantity): string
    {
        if ($quantity === 0) return 'out_of_stock';
        if ($quantity <= 10) return 'low_stock';
        if ($quantity <= 50) return 'medium_stock';
        return 'good_stock';
    }
}
