<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Store or update the FCM device token for the authenticated user.
     * Called by Flutter immediately after login.
     */
    public function store(Request $request)
    {
        $request->validate([
            'fcm_token' => ['required', 'string', 'max:500'],
        ]);

        $request->user()->update([
            'fcm_token' => $request->fcm_token,
        ]);

        return response()->json(['message' => 'Device token saved']);
    }
}
