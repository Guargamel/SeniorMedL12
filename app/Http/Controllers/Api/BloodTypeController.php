<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodType;

class BloodTypeController extends Controller
{
    public function index()
    {
        return response()->json(BloodType::orderBy('type')->get());
    }
}
