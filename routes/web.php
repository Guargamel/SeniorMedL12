<?php

use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

// Serve the SPA for all non-API routes
Route::view('/{any}', 'app')->where('any', '^(?!api).*$');
