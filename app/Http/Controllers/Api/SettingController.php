<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        // If you have a settings table, return it. Otherwise return empty.
        $rows = DB::table('settings')->get()->keyBy('key')->map(fn($r) => $r->value);
        return response()->json(['data' => $rows]);
    }

    public function update(Request $request): JsonResponse
    {
        // Expect: { key: "...", value: "..." } or a whole object of key/value pairs.
        if ($request->has(['key', 'value'])) {
            DB::table('settings')->updateOrInsert(
                ['key' => $request->input('key')],
                ['value' => (string) $request->input('value')]
            );
            return response()->json(['message' => 'Setting updated']);
        }

        $data = $request->all();
        if (!is_array($data)) {
            return response()->json(['message' => 'Invalid payload'], 422);
        }

        foreach ($data as $key => $value) {
            DB::table('settings')->updateOrInsert(['key' => (string) $key], ['value' => (string) $value]);
        }

        return response()->json(['message' => 'Settings updated']);
    }
}
