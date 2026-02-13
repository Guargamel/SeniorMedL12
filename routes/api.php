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
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes below require Sanctum auth (session/cookie auth for SPA).
*/

Route::middleware('auth:sanctum')->group(function () {

    // ---- Auth / Profile ----
    // Primary "who am I" endpoint for your app
    Route::get('/me', [ProfileController::class, 'me']);

    // Compatibility alias (so frontend checks like /api/user work)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::put('/profile', [ProfileController::class, 'update']); // multipart (avatar)
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // API logout (recommended; avoids /logout web-route confusion)
    Route::post('/logout', function (Request $request) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    });

    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);
    Route::get('/dashboard/recent-distributions', [DashboardController::class, 'recentDistributions']);

    // Seniors (admin creates account + profile)
    Route::middleware('role:super-admin')->group(function () {
        Route::get('/seniors', [SeniorController::class, 'index']);
        Route::post('/seniors', [SeniorController::class, 'store']);
    });


    // Stock (record stock = create batch)
    Route::middleware('role:super-admin')->post('/batches', [BatchController::class, 'store']);

    // Requests (common users create; admin reviews)
    Route::post('/requests', [RequestController::class, 'store']); // common user
    Route::middleware('role:super-admin')->put('/requests/{id}/review', [RequestController::class, 'review']);

    // Distributions (admin dispense)
    Route::middleware('role:super-admin')->post('/distributions', [DistributionController::class, 'store']);

    Route::middleware('role:super-admin')->group(function () {
        // Roles & permissions
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::get('/roles/{role}', [RoleController::class, 'show']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

        Route::get('/permissions', [PermissionController::class, 'index']);


        Route::middleware(['auth:sanctum', 'role:super-admin'])->group(function () {
            Route::get('/staff', [StaffController::class, 'index']);
            Route::post('/staff', [StaffController::class, 'store']);
            Route::get('/staff/{user}', [StaffController::class, 'show']);
            Route::put('/staff/{user}', [StaffController::class, 'update']);
            Route::delete('/staff/{user}', [StaffController::class, 'destroy']);
            Route::get('/me', [ProfileController::class, 'me']);
        });

        Route::post('/distributions', [DistributionController::class, 'store']);
        Route::get('/users/autocomplete-email', [UserController::class, 'autocompleteEmail']);
    });


    Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
        return $request->user();
    });

    Route::get('/medicines/expired', [MedicineController::class, 'expired']);
    Route::get('/medicines/outstock', [MedicineController::class, 'outstock']);
    Route::apiResource('medicines', MedicineController::class);


    // Categories CRUD
    Route::apiResource('medicine-categories', MedicineCategoryController::class);

    // Medicines CRUD
    Route::apiResource('medicines', MedicineController::class);

    // Extra lists used by the sidebar pages (optional but recommended)
    Route::get('/medicines/expired', [MedicineController::class, 'expired']);
    Route::get('/medicines/outstock', [MedicineController::class, 'outstock']);


    Route::apiResource('seniors', SeniorController::class);
});
