<?php

use Illuminate\Support\Facades\Route;

require __DIR__ . '/auth.php';

// Serve the SPA for all non-API routes
// Route::view('/{any}', 'app')->where('any', '^(?!api).*$');

Route::get('/dashboard', function () {
    return view('app'); // or whatever blade loads your React SPA (often resources/views/app.blade.php)
})->name('dashboard');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
