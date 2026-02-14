<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\{
    RoleController,
    StaffController,
    ProfileController,
    DashboardController,
    SeniorController,
    DistributionController,
    MedicineController,
    MedicineCategoryController,
    MedicineBatchController,
    NotificationController,
    AnalyticsController,
    ReportController
};

use App\Models\Supplier;

/*
|---------------------------------------------------------------------------
| API Routes
|---------------------------------------------------------------------------
| All routes below require Sanctum auth (session/cookie auth for SPA).
*/

Route::middleware('auth:sanctum')->group(function () {
    // ---- Auth / Profile ----
    Route::get('/me', [ProfileController::class, 'me']);
    Route::get('/user', fn(Request $request) => response()->json(['user' => $request->user()->load('roles')]));
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/logout', function (Request $request) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out']);
    });

    // ---- Dashboard ----
    Route::prefix('dashboard')->group(function () {
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/alerts', [DashboardController::class, 'alerts']);
        Route::get('/recent-distributions', [DashboardController::class, 'recentDistributions']);
    });

    // ---- Notifications ----
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    // ---- Analytics ----
    Route::prefix('analytics')->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('/expiring-medicines', [AnalyticsController::class, 'expiringMedicines']);
        Route::get('/low-stock', [AnalyticsController::class, 'lowStock']);
    });

    // ---- Reports ----
    Route::prefix('reports')->group(function () {
        Route::get('/inventory', [ReportController::class, 'inventory']);
        Route::get('/distributions', [ReportController::class, 'distributions']);
        Route::get('/expiry', [ReportController::class, 'expiry']);
        Route::get('/seniors', [ReportController::class, 'seniors']);
        Route::get('/usage', [ReportController::class, 'usage']);
    });

    // ---- Seniors ----
    Route::apiResource('seniors', SeniorController::class);

    // ---- Staff (Admin only) ----
    Route::middleware('role:super-admin')->prefix('staff')->group(function () {
        Route::get('/', [StaffController::class, 'index']);
        Route::post('/', [StaffController::class, 'store']);
        Route::get('/{user}', [StaffController::class, 'show']);
        Route::put('/{user}', [StaffController::class, 'update']);
        Route::delete('/{user}', [StaffController::class, 'destroy']);
        Route::post('/{id}/avatar', [StaffController::class, 'updateAvatar']);
    });

    // ---- Roles & Permissions (Admin only) ----
    Route::middleware('role:super-admin')->prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('/{role}', [RoleController::class, 'show']);
        Route::put('/{role}', [RoleController::class, 'update']);
        Route::delete('/{role}', [RoleController::class, 'destroy']);
    });


    // ---- Suppliers (Admin only) ----
    Route::middleware('role:super-admin')->get('/suppliers', fn() => Supplier::all());

    // ---- Distributions (Admin only) ----
    Route::middleware('role:super-admin')->prefix('distributions')->group(function () {
        Route::post('/', [DistributionController::class, 'store']);
        Route::post('/notifications', [NotificationController::class, 'store']);
    });

    // ---- Medicines ----
    Route::prefix('medicines')->group(function () {
        // Allow all authenticated users to see medicines
        Route::get('/', [MedicineController::class, 'index']); // Show all medicines
        Route::get('/{medicine}', [MedicineController::class, 'show']); // Show specific medicine
        Route::get('/expired', [MedicineController::class, 'expired']);
        Route::get('/outstock', [MedicineController::class, 'outstock']);
        Route::apiResource('/', MedicineController::class);
    });

    // ---- Medicine Categories ----
    Route::apiResource('medicine-categories', MedicineCategoryController::class);

    // ---- Medicine Batches ----
    Route::middleware('role:super-admin|staff')->prefix('medicine-batches')->group(function () {
        Route::get('/', [MedicineBatchController::class, 'index']);
        Route::post('/create', [MedicineBatchController::class, 'store']);
    });
});
