<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SeniorController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\DistributionController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\MedicineCategoryController;
use App\Http\Controllers\Api\MedicineBatchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ReportController;
use App\Models\Supplier;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes below require Sanctum auth (session/cookie auth for SPA).
*/

Route::middleware('auth:sanctum')->group(function () {

    // ---- Auth / Profile ----
    Route::get('/me', [ProfileController::class, 'me']);

    Route::get('/user', function (Request $request) {
        return response()->json(['user' => $request->user()->load('roles')]);
    });

    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::post('/logout', function (Request $request) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    });

    // ---- Dashboard ----
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);
    Route::get('/dashboard/recent-distributions', [DashboardController::class, 'recentDistributions']);

    // ---- Notifications ----
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // ---- Analytics ----
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/analytics/expiring-medicines', [AnalyticsController::class, 'expiringMedicines']);
    Route::get('/analytics/low-stock', [AnalyticsController::class, 'lowStock']);

    // ---- Reports ----
    Route::get('/reports/inventory', [ReportController::class, 'inventory']);
    Route::get('/reports/distributions', [ReportController::class, 'distributions']);
    Route::get('/reports/expiry', [ReportController::class, 'expiry']);
    Route::get('/reports/seniors', [ReportController::class, 'seniors']);
    Route::get('/reports/usage', [ReportController::class, 'usage']);

    // ---- Seniors ----
    Route::apiResource('seniors', SeniorController::class);

    // ---- Staff (Admin only) ----
    Route::middleware('role:super-admin')->group(function () {
        Route::get('/staff', [StaffController::class, 'index']);
        Route::post('/staff', [StaffController::class, 'store']);
        Route::get('/staff/{user}', [StaffController::class, 'show']);
        Route::put('/staff/{user}', [StaffController::class, 'update']);
        Route::delete('/staff/{user}', [StaffController::class, 'destroy']);
        // routes/api.php
        Route::post('/staff/{id}/avatar', [StaffController::class, 'updateAvatar']);
    });

    // ---- Roles & Permissions (Admin only) ----
    Route::middleware('role:super-admin')->group(function () {
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::get('/roles/{role}', [RoleController::class, 'show']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);


        Route::get('/suppliers', function () {
            return Supplier::all(); // Fetch all suppliers
        });
    });

    // ---- Distributions (Admin only) ----
    Route::middleware('role:super-admin')->group(function () {
        Route::post('/distributions', [DistributionController::class, 'store']);
        Route::get('/users/autocomplete-email', [UserController::class, 'autocompleteEmail']);

        // Admin notifications
        Route::post('/notifications', [NotificationController::class, 'store']);
    });

    // ---- Stock Management (Admin only) ----
    Route::middleware('role:super-admin')->post('/batches', [BatchController::class, 'store']);

    // ---- Requests ----
    Route::post('/requests', [RequestController::class, 'store']);
    Route::middleware('role:super-admin')->put('/requests/{id}/review', [RequestController::class, 'review']);

    // ---- Medicines ----
    Route::get('/medicines/expired', [MedicineController::class, 'expired']);
    Route::get('/medicines/outstock', [MedicineController::class, 'outstock']);
    Route::apiResource('medicines', MedicineController::class);

    // ---- Medicine Categories ----
    Route::apiResource('medicine-categories', MedicineCategoryController::class);
});
