<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class BackupController extends Controller
{
    public function index(): JsonResponse
    {
        // This is a stub. If you use spatie/laravel-backup, you can list files from storage.
        return response()->json(['message' => 'Backups endpoint ready', 'data' => []]);
    }

    public function run(Request $request): JsonResponse
    {
        // WARNING: running backups from HTTP can be expensive. Protect with permissions if you enable this.
        // Artisan::call('backup:run');
        return response()->json(['message' => 'Backup triggered (stub).']);
    }
}
