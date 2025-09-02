<?php

use App\Http\Controllers\BLClientController;
use App\Http\Controllers\BLFournisseurController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\FactureClientController;
use App\Http\Controllers\FactureFournisseurController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


// la route les ressources des produits
Route::resource(('produits'), ProduitController::class)->names([
    'index' => 'produits.index',
    'create' => 'produits.create',
    'store' => 'produits.store',
    'show' => 'produits.show',
    'edit' => 'produits.edit',
    'update' => 'produits.update',
    'destroy' => 'produits.destroy',
])->middleware(['auth']);

// la route les ressources des fournisseurs
Route::resource(('fournisseurs'), FournisseurController::class)->names([
    'index' => 'fournisseurs.index',
    'create' => 'fournisseurs.create',
    'store' => 'fournisseurs.store',
    'show' => 'fournisseurs.show',
    'edit' => 'fournisseurs.edit',
    'update' => 'fournisseurs.update',
    'destroy' => 'fournisseurs.destroy',
])->middleware(['auth']);

// la route les ressources des clients
Route::resource(('clients'), ClientController::class)->names([
    'index' => 'clients.index',
    'create' => 'clients.create',
    'store' => 'clients.store',
    'show' => 'clients.show',
    'edit' => 'clients.edit',
    'update' => 'clients.update',
    'destroy' => 'clients.destroy',
])->middleware(['auth']);


// la route les ressources des bons de livraison des fournisseurs
Route::resource(('bl-fournisseurs'), BLFournisseurController::class)->names([
    'index' => 'bl-fournisseurs.index',
    'create' => 'bl-fournisseurs.create',
    'store' => 'bl-fournisseurs.store',
    'show' => 'bl-fournisseurs.show',
    'edit' => 'bl-fournisseurs.edit',
    'update' => 'bl-fournisseurs.update',
    'destroy' => 'bl-fournisseurs.destroy',
])->middleware(['auth']);

// la route les ressources des factures des fournisseurs
Route::resource(('facture-fournisseurs'), FactureFournisseurController::class)->names([
    'index' => 'facture-fournisseurs.index',
    'create' => 'facture-fournisseurs.create',
    'store' => 'facture-fournisseurs.store',
    'show' => 'facture-fournisseurs.show',
    'edit' => 'facture-fournisseurs.edit',
    'update' => 'facture-fournisseurs.update',
    'destroy' => 'facture-fournisseurs.destroy',
])->middleware(['auth']);


Route::get('/bl-fournisseurs/{fournisseur}', [FactureFournisseurController::class, 'getBLByFournisseur'])->name('api.bl-fournisseurs.by-fournisseur');

// Route pour l'impression des factures fournisseurs
Route::get('/facture-fournisseurs/{factureFournisseur}/print', [FactureFournisseurController::class, 'print'])
    ->name('facture-fournisseurs.print')
    ->middleware(['auth']);

// Route pour l'impression des factures clients
Route::get('/facture-clients/{factureClient}/print', [FactureClientController::class, 'print'])
    ->name('facture-clients.print')
    ->middleware(['auth']);


// BL Clients Routes
Route::resource('bl-clients', BLClientController::class)->middleware(['auth']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
