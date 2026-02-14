<?php

// app/Http/Controllers/Api/NotificationController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index()
    {
        // Fetch medicines that are near expiry (within 30 days)
        $expiringMedicines = Medicine::where('expiry_date', '<', Carbon::now()->addDays(30))
            ->where('expiry_date', '>', Carbon::now())
            ->get();

        // Fetch medicines that are low on stock (e.g., less than 10 units)
        $lowStockMedicines = Medicine::where('quantity', '<', 10)->get();

        // Combine both datasets into a single response
        return response()->json([
            'expiring_medicines' => $expiringMedicines,
            'low_stock_medicines' => $lowStockMedicines,
        ]);
    }
}
