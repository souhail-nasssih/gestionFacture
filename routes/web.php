<?php

use App\Http\Controllers\BLClientController;
use App\Http\Controllers\BLFournisseurController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EcheancierController;
use App\Http\Controllers\FactureClientController;
use App\Http\Controllers\FactureFournisseurController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
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

// Route pour récupérer les données d'une facture
Route::get('/echeancier/facture/{id}', [EcheancierController::class, 'getFacture'])
    ->name('echeancier.getFacture')
    ->middleware(['auth']);

// Factures Clients Routes
Route::resource(('facture-clients'), FactureClientController::class)->names([
    'index' => 'facture-clients.index',
    'create' => 'facture-clients.create',
    'store' => 'facture-clients.store',
    'show' => 'facture-clients.show',
    'edit' => 'facture-clients.edit',
    'update' => 'facture-clients.update',
    'destroy' => 'facture-clients.destroy',
])->middleware(['auth']);


// BL Clients Routes
Route::resource('bl-clients', BLClientController::class)->middleware(['auth']);

// Route pour l'impression des BL clients
Route::get('/bl-clients/{blClient}/print', [BLClientController::class, 'print'])
    ->name('bl-clients.print')
    ->middleware(['auth']);

// Route pour l'impression des BL fournisseurs
Route::get('/bl-fournisseurs/{blFournisseur}/print', [BLFournisseurController::class, 'print'])
    ->name('bl-fournisseurs.print')
    ->middleware(['auth']);

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/trash', [TrashController::class, 'index'])->name('trash.index');

    // Routes de restauration
    Route::post('/trash/restore-bl/{id}', [TrashController::class, 'restoreBL'])->name('trash.restore-bl');
    Route::post('/trash/restore-bl-fournisseur/{id}', [TrashController::class, 'restoreBLFournisseur'])->name('trash.restore-bl-fournisseur');
    Route::post('/trash/restore-facture/{id}', [TrashController::class, 'restoreFacture'])->name('trash.restore-facture');
    Route::post('/trash/restore-facture-fournisseur/{id}', [TrashController::class, 'restoreFactureFournisseur'])->name('trash.restore-facture-fournisseur');
    Route::post('/trash/restore-client/{id}', [TrashController::class, 'restoreClient'])->name('trash.restore-client');
    Route::post('/trash/restore-fournisseur/{id}', [TrashController::class, 'restoreFournisseur'])->name('trash.restore-fournisseur');
    Route::post('/trash/restore-produit/{id}', [TrashController::class, 'restoreProduit'])->name('trash.restore-produit');
    Route::post('/trash/restore-reglement/{id}', [TrashController::class, 'restoreReglement'])->name('trash.restore-reglement');

    // Routes de suppression définitive
    Route::delete('/trash/force-delete-bl/{id}', [TrashController::class, 'forceDeleteBL'])->name('trash.force-delete-bl');
    Route::delete('/trash/force-delete-bl-fournisseur/{id}', [TrashController::class, 'forceDeleteBLFournisseur'])->name('trash.force-delete-bl-fournisseur');
    Route::delete('/trash/force-delete-facture/{id}', [TrashController::class, 'forceDeleteFacture'])->name('trash.force-delete-facture');
    Route::delete('/trash/force-delete-facture-fournisseur/{id}', [TrashController::class, 'forceDeleteFactureFournisseur'])->name('trash.force-delete-facture-fournisseur');
    Route::delete('/trash/force-delete-client/{id}', [TrashController::class, 'forceDeleteClient'])->name('trash.force-delete-client');
    Route::delete('/trash/force-delete-fournisseur/{id}', [TrashController::class, 'forceDeleteFournisseur'])->name('trash.force-delete-fournisseur');
    Route::delete('/trash/force-delete-produit/{id}', [TrashController::class, 'forceDeleteProduit'])->name('trash.force-delete-produit');
    Route::delete('/trash/force-delete-reglement/{id}', [TrashController::class, 'forceDeleteReglement'])->name('trash.force-delete-reglement');

    // Route pour vider la poubelle
        Route::post('/trash/empty', [TrashController::class, 'emptyTrash'])->name('trash.empty');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

Route::get('/echeancier', [\App\Http\Controllers\EcheancierController::class, 'index'])->name('echeancier.index')->middleware(['auth', 'verified']);
Route::get('/echeancier/facture/{id}', [\App\Http\Controllers\EcheancierController::class, 'getFacture'])->name('echeancier.getFacture')->middleware(['auth', 'verified']);

Route::get('/reglements', [\App\Http\Controllers\ReglementController::class, 'index'])->name('reglements.index')->middleware(['auth', 'verified']);
Route::post('/reglements', [\App\Http\Controllers\ReglementController::class, 'store'])->name('reglements.store')->middleware(['auth', 'verified']);
Route::put('/reglements/{reglement}', [\App\Http\Controllers\ReglementController::class, 'update'])->name('reglements.update')->middleware(['auth', 'verified']);
Route::delete('/reglements/{reglement}', [\App\Http\Controllers\ReglementController::class, 'destroy'])->name('reglements.destroy')->middleware(['auth', 'verified']);
Route::get('/reglements/{type}/{id}', [\App\Http\Controllers\ReglementController::class, 'byFacture'])->name('reglements.byFacture')->middleware(['auth', 'verified']);

Route::get('/produits/{id}/historique', [ProduitController::class, 'historique'])
    ->name('produits.historique');

Route::get('/produits/{id}/qmup', [ProduitController::class, 'qmup'])
    ->name('produits.qmup')
    ->middleware(['auth']);

Route::post('/produits/initialize-prix-achat', [ProduitController::class, 'initializePrixAchat'])
    ->name('produits.initialize-prix-achat')
    ->middleware(['auth']);

// Routes pour le détail client
Route::get('/clients/{id}/detail', [ClientController::class, 'detail'])
    ->name('clients.detail')
    ->middleware(['auth']);



