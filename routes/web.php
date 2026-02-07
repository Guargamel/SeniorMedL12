<?php

use Illuminate\Support\Facades\Route;

require __DIR__ . '/auth.php';

// Serve the SPA for all routes
Route::view('/{any}', 'app')->where('any', '.*');
