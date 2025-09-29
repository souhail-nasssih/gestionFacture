<?php

namespace App\Http\Controllers;

use App\Models\BLFournisseur;
use App\Models\FactureFournisseur;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FactureFournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $facturesFournisseurs = FactureFournisseur::with([
            'fournisseur',
            'bonsLivraison.details.produit'
        ])->orderBy('created_at', 'desc')->paginate(10);

        $fournisseurs = Fournisseur::all();

        $blFournisseurs = BLFournisseur::with(['details.produit', 'fournisseur'])->get();

        // Generate the next numero_facture for pre-filling the form
        $nextNumeroFacture = FactureFournisseur::generateNumeroFacture();

        // Debug lisible (relations incluses)
        // dd($facturesFournisseurs->toArray());

        return inertia('Facture/Index', [
            'facturesFournisseurs' => $facturesFournisseurs,
            'fournisseurs' => $fournisseurs,
            'blFournisseurs' => $blFournisseurs,
            'nextNumeroFacture' => $nextNumeroFacture,
        ]);
    }


    public function getBLByFournisseur(Fournisseur $fournisseur)
    {
        // Récupère uniquement les BLs du fournisseur non associés à une facture
        return response()->json(
            BLFournisseur::with(['details', 'fournisseur'])
                ->where('fournisseur_id', $fournisseur->id)
                ->whereNull('facture_fournisseur_id')
                ->get()
        );
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
        // Validation des données
        $validated = $request->validate([
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'numero_facture' => 'nullable|string', // Made optional - will be auto-generated if not provided
            'date_facture' => 'required|date',
            'date_echeance' => 'nullable|date',
            'montant_total' => 'required|numeric',
            'blFournisseurs' => 'required|array|min:1',
            'blFournisseurs.*' => 'exists:b_l_fournisseurs,id',
        ]);

        // Création de la facture
        $fournisseur = Fournisseur::findOrFail($validated['fournisseur_id']);
        $delai = (int)($fournisseur->delai_paiement ?? 0);
        $dateEcheance = \Carbon\Carbon::parse($validated['date_facture'])->addDays($delai)->toDateString();

        $factureData = [
            'fournisseur_id' => $validated['fournisseur_id'],
            'date_facture' => $validated['date_facture'],
            'date_echeance' => $dateEcheance,
            'montant_total' => $validated['montant_total'],
            // statut_paiement par défaut : 'en_attente'
        ];

        // Only include numero_facture if provided (otherwise it will be auto-generated)
        if (!empty($validated['numero_facture'])) {
            $factureData['numero_facture'] = $validated['numero_facture'];
        }

        $facture = FactureFournisseur::create($factureData);

        // Association des BL sélectionnés à la facture (update en masse)
        \DB::table('b_l_fournisseurs')
            ->whereIn('id', $validated['blFournisseurs'])
            ->update(['facture_fournisseur_id' => $facture->id]);

        return redirect()->route('facture-fournisseurs.index')
            ->with('success', 'Facture fournisseur créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FactureFournisseur $factureFournisseur)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FactureFournisseur $factureFournisseur)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FactureFournisseur $factureFournisseur)
    {
        $validated = $request->validate([
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'numero_facture' => 'nullable|string', // Made optional - validation handled in model
            'date_facture' => 'required|date',
            'montant_total' => 'required|numeric',
            'blFournisseurs' => 'required|array|min:1',
            'blFournisseurs.*' => 'exists:b_l_fournisseurs,id',
            'bls_to_remove' => 'sometimes|array',
            'bls_to_remove.*' => 'exists:b_l_fournisseurs,id',
        ]);

        // Update the facture
        $fournisseur = Fournisseur::findOrFail($validated['fournisseur_id']);
        $delai = (int)($fournisseur->delai_paiement ?? 0);
        $dateEcheance = \Carbon\Carbon::parse($validated['date_facture'])->addDays($delai)->toDateString();

        $updateData = [
            'fournisseur_id' => $validated['fournisseur_id'],
            'date_facture' => $validated['date_facture'],
            'date_echeance' => $dateEcheance,
            'montant_total' => $validated['montant_total'],
        ];

        // Only update numero_facture if provided
        if (!empty($validated['numero_facture'])) {
            $updateData['numero_facture'] = $validated['numero_facture'];
        }

        $factureFournisseur->update($updateData);

        // Handle BLs to remove (disassociate only the ones marked for removal)
        if (!empty($validated['bls_to_remove'])) {
            DB::table('b_l_fournisseurs')
                ->whereIn('id', $validated['bls_to_remove'])
                ->update(['facture_fournisseur_id' => null]);
        }

        // Get current BLs associated with this facture
        $currentBLs = DB::table('b_l_fournisseurs')
            ->where('facture_fournisseur_id', $factureFournisseur->id)
            ->pluck('id')
            ->toArray();

        // Identify BLs that need to be added (are in the new list but not currently associated)
        $blsToAdd = array_diff($validated['blFournisseurs'], $currentBLs);

        // Associate new BLs (only the ones that aren't already associated)
        if (!empty($blsToAdd)) {
            DB::table('b_l_fournisseurs')
                ->whereIn('id', $blsToAdd)
                ->update(['facture_fournisseur_id' => $factureFournisseur->id]);
        }

        return redirect()->route('facture-fournisseurs.index')
            ->with('success', 'Facture fournisseur modifiée avec succès.');
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FactureFournisseur $factureFournisseur)
    {
        // First, disassociate all BLs from this facture
        DB::table('b_l_fournisseurs')
            ->where('facture_fournisseur_id', $factureFournisseur->id)
            ->update(['facture_fournisseur_id' => null]);

        // Then delete the facture
        $factureFournisseur->delete();

        return back()->with('success', 'Facture fournisseur supprimée avec succès.');
    }

    public function print(FactureFournisseur $factureFournisseur)
    {
        $facture = FactureFournisseur::select('id', 'fournisseur_id', 'numero_facture', 'date_facture', 'montant_total', 'created_at')
            ->with([
                'fournisseur:id,nom',
                'bonsLivraison' => function ($q) {
                    $q->select('id', 'numero_bl', 'date_bl', 'fournisseur_id', 'facture_fournisseur_id')
                      ->with(['details' => function ($qd) {
                          $qd->select('id', 'b_l_fournisseur_id', 'produit_id', 'quantite', 'prix_unitaire')
                             ->with(['produit:id,nom']);
                      }]);
                }
            ])
            ->findOrFail($factureFournisseur->id);

        return view('factures.print-new', compact('facture'));
    }


}
