<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use App\Models\Supplier;

use App\Http\Controllers\Api\{
    DeviceTokenController,
    NotificationController,
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
    AnalyticsController,
    ReportController,
    BloodTypeController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| - Web SPA: cookie/session auth via Sanctum
| - Mobile: Bearer token auth via Sanctum
|   (same middleware: auth:sanctum, just different client behavior)
*/

/**
 * ============================================================
 * MOBILE AUTH (TOKEN-BASED)
 * ============================================================
 * Flutter will call /api/mobile/login and receive a token.
 * Then it must send: Authorization: Bearer {token}
 */
Route::post('/mobile/login', function (Request $request) {
    $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
        'device_name' => ['nullable', 'string', 'max:100'], // optional but nice
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // (Optional) revoke previous tokens for "single device login" behavior:
    // $user->tokens()->delete();

    $deviceName = $request->input('device_name', 'mobile');

    $token = $user->createToken($deviceName)->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user->load('roles'),
    ]);
});

// Mobile logout: revoke current token
Route::post('/mobile/logout', function (Request $request) {
    $token = $request->user()?->currentAccessToken();
    if ($token) $token->delete();

    return response()->json(['message' => 'Token revoked']);
})->middleware('auth:sanctum');


/**
 * ============================================================
 * PROTECTED ROUTES (WEB + MOBILE)
 * ============================================================
 * Web: cookie auth
 * Mobile: bearer token auth
 */
Route::middleware('auth:sanctum')->group(function () {

    // Everyone logged in
    Route::get('/me', [ProfileController::class, 'me']);
    // Register/update FCM device token for push notifications
    Route::post('/device-token', [DeviceTokenController::class, 'store']);

    // Notifications for the logged-in user (senior citizen)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/user', fn(Request $request) => response()->json([
        'user' => $request->user()->load('roles')
    ]));

    // PUT for JSON; POST for multipart/avatar upload (browsers can't PUT multipart)
    Route::match(['put','post'], '/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Web SPA logout (session/cookie)
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

    // Seniors (and staff/admin) - medicine requests
    Route::middleware('role:senior-citizen|super-admin|staff')->group(function () {
        Route::prefix('medicine-requests')->group(function () {
            Route::get('/', [MedicineRequestController::class, 'index']);
            Route::post('/', [MedicineRequestController::class, 'store']);

            Route::get('/{id}', [MedicineRequestController::class, 'show'])->whereNumber('id');
            Route::delete('/{id}', [MedicineRequestController::class, 'destroy'])->whereNumber('id');
        });
    });

    // Staff + Admin
    Route::middleware('role:super-admin|staff')->group(function () {

        Route::prefix('dashboard')->group(function () {
            Route::get('/summary', [DashboardController::class, 'summary']);
            Route::get('/alerts', [DashboardController::class, 'alerts']);
            Route::get('/recent-distributions', [DashboardController::class, 'recentDistributions']);
        });

        Route::get('/medicine-requests/all', [MedicineRequestController::class, 'index']);

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
            Route::get('/{id}', [MedicineBatchController::class, 'show']);
            Route::put('/{id}', [MedicineBatchController::class, 'update']);
            Route::delete('/{id}', [MedicineBatchController::class, 'destroy']);
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

    // Everyone logged in can view blood types
    Route::get('/blood-types', [BloodTypeController::class, 'index']);
});
