<?php

namespace App\Http\Controllers;

use App\Models\Reglement;
use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Arr;

class ReglementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $type = $request->get('type', 'client');

        if ($type === 'fournisseur') {
            $factures = FactureFournisseur::with(['fournisseur'])
                ->get()
                ->map(function ($f) {
                    $f->montant_regle = $f->reglements()->sum('montant_paye');
                    $f->reste_a_payer = max(0, $f->montant_total - $f->montant_regle);
                    return $f;
                })
                ->filter(fn($f) => $f->reste_a_payer > 0)
                ->values();
        } else {
            $type = 'client';
            $factures = FactureClient::with(['client'])
                ->get()
                ->map(function ($f) {
                    $f->montant_regle = $f->reglements()->sum('montant_paye');
                    $f->reste_a_payer = max(0, $f->montant_total - $f->montant_regle);
                    return $f;
                })
                ->filter(fn($f) => $f->reste_a_payer > 0)
                ->values();
        }

        return Inertia::render('Reglements/Index', [
            'type' => $type,
            'factures' => $factures,
            'modesPaiement' => ['espèces', 'chèque', 'virement'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'facture_id' => 'required|integer',
            'type' => 'required|in:client,fournisseur',
            'montant_paye' => 'required|numeric|min:0.01',
            'type_reglement' => 'required|in:espèces,chèque,virement',
            'date_reglement' => 'required|date',
            'date_reglement_at' => 'nullable|date',
            'banque_nom' => 'nullable|string',
            'reference_paiement' => 'nullable|string',
            'iban_rib' => 'nullable|string',
            'numero_cheque' => 'nullable|string',
        ]);

        // Mode-specific requirements
        $mode = $validated['type_reglement'];
        if ($mode === 'chèque') {
            $request->validate([
                'numero_cheque' => 'required|string',
                'banque_nom' => 'required|string',
            ]);
        }
        if ($mode === 'virement') {
            $request->validate([
                'banque_nom' => 'required|string',
                'iban_rib' => 'required|string',
                'reference_paiement' => 'required|string',
            ]);
        }

        if ($validated['type'] === 'fournisseur') {
            $facture = FactureFournisseur::findOrFail($validated['facture_id']);
        } else {
            $facture = FactureClient::findOrFail($validated['facture_id']);
        }

        $montantRegle = ($facture->reglements()->sum('montant_paye'));
        $reste = max(0, $facture->montant_total - $montantRegle);

        if ($validated['montant_paye'] > $reste) {
            return back()->withErrors(['montant_paye' => 'Le montant dépasse le solde restant.'])->withInput();
        }

        // Build infos_reglement JSON according to mode
        $infos = [];
        if ($mode === 'espèces') {
            $infos = [];
        } elseif ($mode === 'chèque') {
            $infos = Arr::only($validated, ['numero_cheque','banque_nom']);
        } elseif ($mode === 'virement') {
            $infos = Arr::only($validated, ['banque_nom','iban_rib','reference_paiement']);
        }

        $payload = Arr::only($validated, [
            'facture_id','type','montant_paye','type_reglement','date_reglement','date_reglement_at'
        ]);
        $payload['infos_reglement'] = $infos;
        $reglement = Reglement::create($payload);

        // Mettre à jour le statut de la facture si nécessaire
        $nouveauRegle = $montantRegle + $validated['montant_paye'];
        $resteApres = max(0, $facture->montant_total - $nouveauRegle);

        if ($resteApres <= 0) {
            // payée
            $facture->statut_paiement = 'payee';
        } else {
            // en attente
            $facture->statut_paiement = 'en_attente';
        }
        $facture->save();

        return redirect()->route('reglements.index', ['type' => $validated['type']])
            ->with('success', 'Règlement enregistré.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Reglement $reglement)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reglement $reglement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reglement $reglement)
    {
        $validated = $request->validate([
            'montant_paye' => 'required|numeric|min:0.01',
            'type_reglement' => 'required|in:espèces,chèque,virement',
            'date_reglement' => 'required|date',
            'date_reglement_at' => 'nullable|date',
            'banque_nom' => 'nullable|string',
            'reference_paiement' => 'nullable|string',
            'iban_rib' => 'nullable|string',
            'numero_cheque' => 'nullable|string',
        ]);

        $mode = $validated['type_reglement'];
        if ($mode === 'chèque') {
            $request->validate([
                'numero_cheque' => 'required|string',
                'banque_nom' => 'required|string',
            ]);
        }
        if ($mode === 'virement') {
            $request->validate([
                'banque_nom' => 'required|string',
                'iban_rib' => 'required|string',
                'reference_paiement' => 'required|string',
            ]);
        }

        // Charger la facture liée en fonction du type
        if ($reglement->type === 'fournisseur') {
            $facture = \App\Models\FactureFournisseur::findOrFail($reglement->facture_id);
        } else {
            $facture = \App\Models\FactureClient::findOrFail($reglement->facture_id);
        }

        // Vérifier dépassement: total réglé - ancien + nouveau <= montant_total
        $totalRegleSansCeluiCi = $facture->reglements()->where('id', '!=', $reglement->id)->sum('montant_paye');
        $resteMax = max(0, $facture->montant_total - $totalRegleSansCeluiCi);
        if ($validated['montant_paye'] > $resteMax) {
            return back()->withErrors(['montant_paye' => 'Le montant dépasse le solde restant.'])->withInput();
        }

        // Reconstituer infos_reglement
        $infos = [];
        if ($mode === 'chèque') {
            $infos = \Illuminate\Support\Arr::only($validated, ['numero_cheque','banque_nom']);
        } elseif ($mode === 'virement') {
            $infos = \Illuminate\Support\Arr::only($validated, ['banque_nom','iban_rib','reference_paiement']);
        }

        $reglement->update([
            'montant_paye' => $validated['montant_paye'],
            'type_reglement' => $validated['type_reglement'],
            'date_reglement' => $validated['date_reglement'],
            'date_reglement_at' => $validated['date_reglement_at'] ?? $reglement->date_reglement_at,
            'infos_reglement' => $infos,
        ]);

        // Mettre à jour le statut de la facture
        $montantRegle = $facture->reglements()->sum('montant_paye');
        $resteApres = max(0, $facture->montant_total - $montantRegle);
        $facture->statut_paiement = $resteApres <= 0 ? 'payee' : 'en_attente';
        $facture->save();

        return back()->with('success', 'Règlement mis à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reglement $reglement)
    {
        // Charger facture avant suppression pour recalcul
        if ($reglement->type === 'fournisseur') {
            $facture = \App\Models\FactureFournisseur::find($reglement->facture_id);
        } else {
            $facture = \App\Models\FactureClient::find($reglement->facture_id);
        }

        $reglement->delete();

        if ($facture) {
            $montantRegle = $facture->reglements()->sum('montant_paye');
            $resteApres = max(0, $facture->montant_total - $montantRegle);
            $facture->statut_paiement = $resteApres <= 0 ? 'payee' : 'en_attente';
            $facture->save();
        }

        return back()->with('success', 'Règlement supprimé.');
    }

    public function byFacture(string $type, int $id)
    {
        $query = Reglement::query()->where('type', $type)->where('facture_id', $id)
            ->orderBy('date_reglement', 'desc');
        return response()->json($query->get());
    }
}
