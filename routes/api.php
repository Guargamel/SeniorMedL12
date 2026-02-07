<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// IMPORTANT: all SPA JSON endpoints go here
Route::middleware('auth:sanctum')->group(function () {

    // Current user (used by Header/Profile/etc.)
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    /* =======================
       LOOKUPS
    ======================= */
    Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
    Route::get('/suppliers',  [\App\Http\Controllers\Api\SupplierController::class, 'index']);
    Route::get('/roles',      [\App\Http\Controllers\Api\RoleController::class, 'index']);
    Route::get('/permissions', [\App\Http\Controllers\Api\PermissionController::class, 'index']);

    /* =======================
       DASHBOARD
    ======================= */
    Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);

    /* =======================
       PRODUCTS
    ======================= */
    Route::get('/products/expired',  [\App\Http\Controllers\Api\ProductController::class, 'expired']);
    Route::get('/products/outstock', [\App\Http\Controllers\Api\ProductController::class, 'outstock']);
    Route::apiResource('/products',  \App\Http\Controllers\Api\ProductController::class);

    /* =======================
       PURCHASES
    ======================= */
    Route::post('/purchases/report', [\App\Http\Controllers\Api\PurchaseController::class, 'report']);
    Route::apiResource('/purchases', \App\Http\Controllers\Api\PurchaseController::class);

    /* =======================
       SALES
    ======================= */
    Route::post('/sales/report', [\App\Http\Controllers\Api\SaleController::class, 'report']);
    Route::apiResource('/sales', \App\Http\Controllers\Api\SaleController::class);

    /* =======================
       USERS
    ======================= */
    Route::apiResource('/users', \App\Http\Controllers\Api\UserController::class);

    /* =======================
       PROFILE
    ======================= */
    Route::put('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::put('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);

    /* =======================
       ACCESS CONTROL
    ======================= */
    Route::apiResource('/roles', \App\Http\Controllers\Api\RoleController::class)->except(['show']);
});
