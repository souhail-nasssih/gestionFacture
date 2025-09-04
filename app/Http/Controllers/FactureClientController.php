<?php

namespace App\Http\Controllers;

use App\Models\BLClient;
use App\Models\Client;
use App\Models\FactureClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FactureClientController extends Controller
{
    public function index()
    {
        $facturesClients = FactureClient::with([
            'client',
            'bonsLivraison.details.produit'
        ])->orderBy('created_at', 'desc')->paginate(10);

        $clients = Client::all();

        $blClients = BLClient::with(['details.produit', 'client'])->get();

        return inertia('Facture/IndexClients', [
            'facturesClients' => $facturesClients,
            'clients' => $clients,
            'blClients' => $blClients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'numero_facture' => 'required|string|unique:facture_clients,numero_facture',
            'date_facture' => 'required|date',
            'montant_total' => 'required|numeric',
            'blClients' => 'required|array|min:1',
            'blClients.*' => 'exists:bl_clients,id',
        ]);

        $facture = FactureClient::create([
            'client_id' => $validated['client_id'],
            'numero_facture' => $validated['numero_facture'],
            'date_facture' => $validated['date_facture'],
            'montant_total' => $validated['montant_total'],
        ]);

        DB::table('bl_clients')
            ->whereIn('id', $validated['blClients'])
            ->update(['facture_client_id' => $facture->id]);

        return redirect()->route('facture-clients.index')
            ->with('success', 'Facture client créée avec succès.');
    }

    public function update(Request $request, FactureClient $factureClient)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'numero_facture' => 'required|string|unique:facture_clients,numero_facture,' . $factureClient->id,
            'date_facture' => 'required|date',
            'montant_total' => 'required|numeric',
            'blClients' => 'required|array|min:1',
            'blClients.*' => 'exists:bl_clients,id',
            'bls_to_remove' => 'sometimes|array',
            'bls_to_remove.*' => 'exists:bl_clients,id',
        ]);

        $factureClient->update([
            'client_id' => $validated['client_id'],
            'numero_facture' => $validated['numero_facture'],
            'date_facture' => $validated['date_facture'],
            'montant_total' => $validated['montant_total'],
        ]);

        if (!empty($validated['bls_to_remove'])) {
            DB::table('bl_clients')
                ->whereIn('id', $validated['bls_to_remove'])
                ->update(['facture_client_id' => null]);
        }

        $currentBLs = DB::table('bl_clients')
            ->where('facture_client_id', $factureClient->id)
            ->pluck('id')
            ->toArray();

        $blsToAdd = array_diff($validated['blClients'], $currentBLs);

        if (!empty($blsToAdd)) {
            DB::table('bl_clients')
                ->whereIn('id', $blsToAdd)
                ->update(['facture_client_id' => $factureClient->id]);
        }

        return redirect()->route('facture-clients.index')
            ->with('success', 'Facture client modifiée avec succès.');
    }

    public function destroy(FactureClient $factureClient)
    {
        DB::table('bl_clients')
            ->where('facture_client_id', $factureClient->id)
            ->update(['facture_client_id' => null]);

        $factureClient->delete();

        return back()->with('success', 'Facture client supprimée avec succès.');
    }

    public function print(FactureClient $factureClient)
    {
        $facture = $factureClient->load([
            'client',
            'bonsLivraison.details.produit'
        ]);

        return view('factures.print-client', compact('facture'));
    }
}
