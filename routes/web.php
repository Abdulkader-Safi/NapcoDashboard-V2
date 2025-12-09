<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\KeywordController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UploadDataController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Route::get('campaign', function () {
    //     return Inertia::render('campaign');
    // })->name('campaign');

    Route::get('/campaign', [CampaignController::class, 'index'])->name('campaign.index');
    Route::get('/campaign/upload', [CampaignController::class, 'upload'])->name('campaign.upload'); // GET page
    Route::post('/campaign/store', [CampaignController::class, 'store'])->name('campaign.store'); // POST upload

    Route::get('/products', [ProductController::class, 'index'])->name('product.index');
    Route::get('/keywords', [KeywordController::class, 'index'])->name('keywords.index');
  
});

require __DIR__ . '/settings.php';
