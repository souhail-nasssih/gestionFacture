<?php

namespace App\Http\Controllers;

use App\Models\BLClient;
use App\Models\Client;
use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

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
            'numero_bl' => 'nullable|string|unique:bl_clients,numero_bl',
            'numero_bc' => 'nullable|string',
            'description' => 'nullable|string',
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

            $data = $request->only(['numero_bl', 'numero_bc', 'description', 'date_bl', 'client_id', 'notes']);
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
        'numero_bl' => 'nullable|string|unique:bl_clients,numero_bl,' . $bl_client->id,
        'numero_bc' => 'nullable|string',
        'description' => 'nullable|string',
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

        $bl_client->update($request->only([
            'numero_bl', 'numero_bc', 'description', 'date_bl', 'client_id', 'notes'
        ]));

        $oldDetails = $bl_client->details->keyBy('produit_id');
        $newDetails = collect($request->details)->keyBy('produit_id');

        // Update or create details
        foreach ($newDetails as $produit_id => $detail) {
            $existing = $oldDetails->get($produit_id);
            if ($existing) {
                // Update if changed
                if (
                    $existing->quantite != $detail['quantite'] ||
                    $existing->prix_unitaire != $detail['prix_unitaire']
                ) {
                    $existing->update([
                        'quantite' => $detail['quantite'],
                        'prix_unitaire' => $detail['prix_unitaire'],
                    ]);
                }
            } else {
                // Create new detail
                $bl_client->details()->create([
                    'produit_id' => $detail['produit_id'],
                    'quantite' => $detail['quantite'],
                    'prix_unitaire' => $detail['prix_unitaire'],
                ]);
            }
        }

        // Delete removed details
        $toDelete = $oldDetails->keys()->diff($newDetails->keys());
        if ($toDelete->count()) {
            $bl_client->details()->whereIn('produit_id', $toDelete)->delete();
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

            // Delete each detail individually to trigger model events (restores stock)
            $bl_client->details->each->delete();

            // Delete the BL itself
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

    public function print(BLClient $blClient)
    {
        $blClient->load(['client', 'details.produit']);

        $pdf = Pdf::loadView('pdf.bl_client', [
            'blClient' => $blClient
        ]);

        $pdf->setPaper('A4', 'portrait');

        return $pdf->stream('BL-' . $blClient->numero_bl . '.pdf');
    }
}
