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
    MedicineRequestController,
    NotificationController,
    AnalyticsController,
    ReportController,
    BloodTypeController
};

use App\Models\Supplier;

/*
|---------------------------------------------------------------------------
| API Routes
|---------------------------------------------------------------------------
| All routes below require Sanctum auth (session/cookie auth for SPA).
*/

Route::middleware('auth:sanctum')->group(function () {

    // Everyone logged in
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

    // Everyone logged in can view medicines (READ ONLY)
    Route::get('/medicines', [MedicineController::class, 'index']);
    Route::get('/medicines/expired', [MedicineController::class, 'expired']);
    Route::get('/medicines/outstock', [MedicineController::class, 'outstock']);
    Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);

    // Seniors only
    Route::middleware('role:senior-citizen')->group(function () {
        Route::prefix('medicine-requests')->group(function () {
            Route::get('/', [MedicineRequestController::class, 'index']);     // their own
            Route::post('/', [MedicineRequestController::class, 'store']);    // create
            Route::get('/{id}', [MedicineRequestController::class, 'show']);  // must enforce ownership
            Route::delete('/{id}', [MedicineRequestController::class, 'destroy']); // own pending
        });
    });

    // Staff + Admin
    Route::middleware('role:super-admin|staff')->group(function () {

        Route::prefix('dashboard')->group(function () {
            Route::get('/summary', [DashboardController::class, 'summary']);
            Route::get('/alerts', [DashboardController::class, 'alerts']);
            Route::get('/recent-distributions', [DashboardController::class, 'recentDistributions']);
        });

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });

        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
            Route::get('/expiring-medicines', [AnalyticsController::class, 'expiringMedicines']);
            Route::get('/low-stock', [AnalyticsController::class, 'lowStock']);
        });

        Route::prefix('reports')->group(function () {
            Route::get('/inventory', [ReportController::class, 'inventory']);
            Route::get('/distributions', [ReportController::class, 'distributions']);
            Route::get('/expiry', [ReportController::class, 'expiry']);
            Route::get('/seniors', [ReportController::class, 'seniors']);
            Route::get('/usage', [ReportController::class, 'usage']);
        });

        Route::get('/suppliers', fn() => Supplier::all());

        Route::prefix('distributions')->group(function () {
            Route::post('/', [DistributionController::class, 'store']);
            Route::post('/notifications', [NotificationController::class, 'store']);
        });

        Route::prefix('medicine-requests')->group(function () {
            Route::get('/pending-count', [MedicineRequestController::class, 'pendingCount']);
            Route::put('/{id}/review', [MedicineRequestController::class, 'review']);
        });

        Route::prefix('medicine-batches')->group(function () {
            Route::get('/', [MedicineBatchController::class, 'index']);
            Route::post('/create', [MedicineBatchController::class, 'store']);
            Route::get('/{id}', [MedicineBatchController::class, 'show']); // protect this too
        });

        Route::apiResource('medicine-categories', MedicineCategoryController::class);

        // Seniors management should NOT be open to seniors
        Route::apiResource('seniors', SeniorController::class);
    });

    // Super-admin only
    Route::middleware('role:super-admin')->group(function () {
        Route::prefix('staff')->group(function () {
            Route::get('/', [StaffController::class, 'index']);
            Route::post('/', [StaffController::class, 'store']);
            Route::get('/{user}', [StaffController::class, 'show']);
            Route::put('/{user}', [StaffController::class, 'update']);
            Route::delete('/{user}', [StaffController::class, 'destroy']);
            Route::post('/{id}/avatar', [StaffController::class, 'updateAvatar']);
        });

        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index']);
            Route::post('/', [RoleController::class, 'store']);
            Route::get('/{role}', [RoleController::class, 'show']);
            Route::put('/{role}', [RoleController::class, 'update']);
            Route::delete('/{role}', [RoleController::class, 'destroy']);
        });

        // Only super-admin can delete medicines
        Route::delete('/medicines/{id}', [MedicineController::class, 'destroy']);
    });

    Route::get('/blood-types', [BloodTypeController::class, 'index']);
});
