<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\SeniorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/summary
     */
    public function summary(Request $request)
    {
        // Seniors = number of senior_profiles rows
        $totalSeniors = SeniorProfile::count();

        // App users = total users
        $appUsers = User::count();

        // Medicines = total medicines
        $medicines = Medicine::count();

        // If you implement a distributions table later, update this.
        // For now we derive "today distributions" from fulfilled requests (if any).
        $todayDistributions = DB::table('medicine_requests')
            ->where('status', 'fulfilled')
            ->whereDate('updated_at', now()->toDateString())
            ->count();

        return response()->json([
            'totalSeniors' => (int) $totalSeniors,
            'appUsers' => (int) $appUsers,
            'medicines' => (int) $medicines,
            'todayDistributions' => (int) $todayDistributions,
        ]);
    }

    /**
     * GET /api/dashboard/alerts
     * Returns a list of critical alerts.
     */
    public function alerts(Request $request)
    {
        $today = now()->toDateString();

        // Expired batches that still have stock
        $expiredCount = DB::table('medicine_batches')
            ->whereDate('expiry_date', '<', $today)
            ->where('quantity', '>', 0)
            ->count();

        // Out of stock medicines = sum of all batch quantities <= 0 (or no batches)
        $outOfStockCount = DB::table('medicines')
            ->leftJoin('medicine_batches', 'medicine_batches.medicine_id', '=', 'medicines.id')
            ->select('medicines.id')
            ->groupBy('medicines.id')
            ->havingRaw('COALESCE(SUM(medicine_batches.quantity), 0) <= 0')
            ->count();

        $alerts = [];

        if ($expiredCount > 0) {
            $alerts[] = [
                'id' => 'expired',
                'icon' => '⏰',
                'title' => 'Expired stock found',
                'message' => $expiredCount . ' batch(es) are expired and still have quantity in stock.',
            ];
        }

        if ($outOfStockCount > 0) {
            $alerts[] = [
                'id' => 'outstock',
                'icon' => '📉',
                'title' => 'Out of stock medicines',
                'message' => $outOfStockCount . ' medicine(s) are currently out of stock.',
            ];
        }

        return response()->json($alerts);
    }

    public function recentDistributions(Request $request)
    {
        $rows = DB::table('medicine_requests as mr')
            ->join('users as u', 'u.id', '=', 'mr.user_id')
            ->join('medicines as m', 'm.id', '=', 'mr.medicine_id')
            ->whereIn('mr.status', ['fulfilled', 'approved'])
            ->orderByDesc('mr.updated_at')
            ->limit(10)
            ->get([
                'mr.id as id',
                DB::raw("DATE_FORMAT(mr.updated_at, '%Y-%m-%d %H:%i') as time"),
                'u.name as name',
                DB::raw("CONCAT(m.generic_name, IF(m.brand_name IS NULL OR m.brand_name = '', '', CONCAT(' (', m.brand_name, ')'))) as medicine"),
                'mr.quantity as quantity',  // Changed from 'qty_requested' to 'quantity'
            ]);

        return response()->json($rows);
    }
}
