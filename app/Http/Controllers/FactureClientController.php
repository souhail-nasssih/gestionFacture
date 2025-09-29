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

        // Generate the next numero_facture for pre-filling the form
        $nextNumeroFacture = FactureClient::generateNumeroFacture();

        return inertia('Facture/IndexClients', [
            'facturesClients' => $facturesClients,
            'clients' => $clients,
            'blClients' => $blClients,
            'nextNumeroFacture' => $nextNumeroFacture,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'numero_facture' => 'nullable|string', // Made optional - will be auto-generated if not provided
            'date_facture' => 'required|date',
            'date_echeance' => 'nullable|date',
            'montant_total' => 'required|numeric',
            'blClients' => 'required|array|min:1',
            'blClients.*' => 'exists:bl_clients,id',
        ]);

        // Calculate due date based on client's payment terms
        $client = Client::findOrFail($validated['client_id']);
        $delai = (int)($client->delai_paiement ?? 0);
        $dateEcheance = \Carbon\Carbon::parse($validated['date_facture'])->addDays($delai)->toDateString();

        $factureData = [
            'client_id' => $validated['client_id'],
            'date_facture' => $validated['date_facture'],
            'date_echeance' => $dateEcheance,
            'montant_total' => $validated['montant_total'],
        ];

        // Only include numero_facture if provided (otherwise it will be auto-generated)
        if (!empty($validated['numero_facture'])) {
            $factureData['numero_facture'] = $validated['numero_facture'];
        }

        $facture = FactureClient::create($factureData);

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
            'numero_facture' => 'nullable|string', // Made optional - validation handled in model
            'date_facture' => 'required|date',
            'montant_total' => 'required|numeric',
            'blClients' => 'required|array|min:1',
            'blClients.*' => 'exists:bl_clients,id',
            'bls_to_remove' => 'sometimes|array',
            'bls_to_remove.*' => 'exists:bl_clients,id',
        ]);

        $updateData = [
            'client_id' => $validated['client_id'],
            'date_facture' => $validated['date_facture'],
            'date_echeance' => \Carbon\Carbon::parse($validated['date_facture'])
                ->addDays((int)(Client::find($validated['client_id'])->delai_paiement ?? 0))
                ->toDateString(),
            'montant_total' => $validated['montant_total'],
        ];

        // Only update numero_facture if provided
        if (!empty($validated['numero_facture'])) {
            $updateData['numero_facture'] = $validated['numero_facture'];
        }

        $factureClient->update($updateData);

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
        $facture = FactureClient::select('id', 'client_id', 'numero_facture', 'date_facture', 'montant_total', 'created_at')
            ->with([
                'client:id,nom',
                'bonsLivraison' => function ($q) {
                    $q->select('id', 'numero_bl', 'date_bl', 'client_id', 'facture_client_id')
                      ->with(['details' => function ($qd) {
                          $qd->select('id', 'bl_client_id', 'produit_id', 'quantite', 'prix_unitaire')
                             ->with(['produit:id,nom']);
                      }]);
                }
            ])
            ->findOrFail($factureClient->id);

        return view('factures.print-client', compact('facture'));
    }
}
