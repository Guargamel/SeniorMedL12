<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SeniorController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\DistributionController;

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

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});
