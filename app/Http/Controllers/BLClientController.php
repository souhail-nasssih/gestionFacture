<?php

namespace App\Http\Controllers;

use App\Models\BLClient;
use App\Models\Client;
use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BLClientController extends Controller
{
    public function index()
    {
        $bl_clients = BLClient::with(['client', 'details.produit'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('BLClients/Index', [
            'blClients' => $bl_clients,
            'clients' => Client::all(),
            'produits' => Produit::where('stock', '>', 0)->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('BLClients/Create', [
            'clients' => Client::all(),
            'produits' => Produit::where('stock', '>', 0)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'numero_bl' => 'required|string|unique:bl_clients,numero_bl',
            'date_bl' => 'required|date',
            'client_id' => 'required|exists:clients,id',
            'details' => 'required|array|min:1',
            'details.*.produit_id' => 'required|exists:produits,id',
            'details.*.quantite' => 'required|integer|min:1',
            'details.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $data = $request->only(['numero_bl', 'date_bl', 'client_id', 'notes']);
            if (empty($data['numero_bl'])) {
                unset($data['numero_bl']);
            }
            $bl_client = BLClient::create($data);

            foreach ($request->details as $detail) {
                $produit = Produit::find($detail['produit_id']);

                // Check stock availability
                if ($produit->stock < $detail['quantite']) {
                    throw new \Exception("Stock insuffisant pour le produit: {$produit->nom}. Stock disponible: {$produit->stock}");
                }

                $bl_client->details()->create([
                    'produit_id' => $detail['produit_id'],
                    'quantite' => $detail['quantite'],
                    'prix_unitaire' => $detail['prix_unitaire'],
                ]);
                // Diminuer le stock du produit
                $produit->decrement('stock', $detail['quantite']);
            }

            DB::commit();

            return redirect()->route('bl-clients.index')
                ->with('success', 'BL Client créé avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', $e->getMessage())
                ->withInput();
        }
    }

    public function show(BLClient $bl_client)
    {
        $bl_client->load(['client', 'details.produit']);

        return Inertia::render('BLClients/Show', [
            'blClient' => $bl_client,
        ]);
    }

    public function edit(BLClient $bl_client)
    {
        $bl_client->load(['details.produit']);

        return Inertia::render('BLClients/Edit', [
            'blClient' => $bl_client,
            'clients' => Client::all(),
            'produits' => Produit::where('stock', '>', 0)->get(),
        ]);
    }

   public function update(Request $request, BLClient $bl_client)
{
    $validator = Validator::make($request->all(), [
        'numero_bl' => 'required|string|unique:bl_clients,numero_bl,' . $bl_client->id,
        'date_bl' => 'required|date',
        'client_id' => 'required|exists:clients,id',
        'details' => 'required|array|min:1',
        'details.*.produit_id' => 'required|exists:produits,id',
        'details.*.quantite' => 'required|integer|min:1',
        'details.*.prix_unitaire' => 'required|numeric|min:0',
    ]);

    if ($validator->fails()) {
        return redirect()->back()
            ->withErrors($validator)
            ->withInput();
    }

    try {
        DB::beginTransaction();

        // Mettre à jour les informations de base du BL
        $bl_client->update($request->only([
            'numero_bl', 'date_bl', 'client_id', 'notes'
        ]));

        // Récupérer les anciens détails
        $oldDetails = $bl_client->details;

        // Calculer les ajustements de stock nécessaires
        $stockAdjustments = [];

        // 1. Restaurer le stock des anciens produits (on va les supprimer)
        foreach ($oldDetails as $oldDetail) {
            $produitId = $oldDetail->produit_id;
            if (!isset($stockAdjustments[$produitId])) {
                $stockAdjustments[$produitId] = 0;
            }
            $stockAdjustments[$produitId] += $oldDetail->quantite; // On ajoute car on restaure le stock
        }

        // 2. Réserver le stock pour les nouveaux produits (on va les ajouter)
        foreach ($request->details as $detail) {
            $produitId = $detail['produit_id'];
            if (!isset($stockAdjustments[$produitId])) {
                $stockAdjustments[$produitId] = 0;
            }
            $stockAdjustments[$produitId] -= $detail['quantite']; // On soustrait car on va utiliser le stock

            // Vérifier immédiatement si le stock est suffisant
            $produit = Produit::find($produitId);
            $currentStock = $produit->stock;
            $adjustedStock = $currentStock + $stockAdjustments[$produitId];

            if ($adjustedStock < 0) {
                throw new \Exception("Stock insuffisant pour le produit: {$produit->nom}. Stock disponible: {$currentStock}, Quantité demandée: {$detail['quantite']}");
            }
        }

        // 3. Appliquer les ajustements de stock
        foreach ($stockAdjustments as $produitId => $adjustment) {
            $produit = Produit::find($produitId);
            if ($produit) {
                if ($adjustment > 0) {
                    $produit->increment('stock', $adjustment);
                } elseif ($adjustment < 0) {
                    $produit->decrement('stock', abs($adjustment));
                }
            }
        }

        // 4. Supprimer les anciens détails
        $bl_client->details()->delete();

        // 5. Créer les nouveaux détails
        foreach ($request->details as $detail) {
            $bl_client->details()->create([
                'produit_id' => $detail['produit_id'],
                'quantite' => $detail['quantite'],
                'prix_unitaire' => $detail['prix_unitaire'],
            ]);
        }

        DB::commit();

        return redirect()->route('bl-clients.index')
            ->with('success', 'BL Client modifié avec succès');

    } catch (\Exception $e) {
        DB::rollBack();
        return redirect()->back()
            ->with('error', $e->getMessage())
            ->withInput();
    }
}

    public function destroy(BLClient $bl_client)
    {
        try {
            DB::beginTransaction();
// dd($bl_client);

            $bl_client->details()->delete();
            $bl_client->delete();

            DB::commit();
            // Return a proper Inertia response
            return redirect()->route('bl-clients.index')
                ->with('success', 'BL Client supprimé avec succès');

        } catch (\Exception $e) {
            DB::rollBack();

            // Return JSON error response for Inertia
            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'Delete failed'
            ], 500);
        }
    }
}
