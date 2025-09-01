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

        // Debug lisible (relations incluses)
        // dd($facturesFournisseurs->toArray());

        return inertia('Facture/Index', [
            'facturesFournisseurs' => $facturesFournisseurs,
            'fournisseurs' => $fournisseurs,
            'blFournisseurs' => $blFournisseurs,
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
            'numero_facture' => 'required|string|unique:facture_fournisseurs,numero_facture',
            'date_facture' => 'required|date',
            'montant_total' => 'required|numeric',
            'blFournisseurs' => 'required|array|min:1',
            'blFournisseurs.*' => 'exists:b_l_fournisseurs,id',
        ]);

        // Création de la facture
        $facture = FactureFournisseur::create([
            'fournisseur_id' => $validated['fournisseur_id'],
            'numero_facture' => $validated['numero_facture'],
            'date_facture' => $validated['date_facture'],
            'montant_total' => $validated['montant_total'],
            // statut_paiement par défaut : 'en_attente'
        ]);

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
public function update(Request $request, FactureFournisseur $factureFournisseur)
    {
        $validated = $request->validate([
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'numero_facture' => 'required|string|unique:facture_fournisseurs,numero_facture,' . $factureFournisseur->id,
            'date_facture' => 'required|date',
            'montant_total' => 'required|numeric',
            'blFournisseurs' => 'required|array|min:1',
            'blFournisseurs.*' => 'exists:b_l_fournisseurs,id',
            'bls_to_remove' => 'sometimes|array',
            'bls_to_remove.*' => 'exists:b_l_fournisseurs,id',
        ]);

        // Update the facture
        $factureFournisseur->update([
            'fournisseur_id' => $validated['fournisseur_id'],
            'numero_facture' => $validated['numero_facture'],
            'date_facture' => $validated['date_facture'],
            'montant_total' => $validated['montant_total'],
        ]);

        // Handle BLs to remove (disassociate them from this facture)
        if (!empty($validated['bls_to_remove'])) {
            DB::table('b_l_fournisseurs')
                ->whereIn('id', $validated['bls_to_remove'])
                ->update(['facture_fournisseur_id' => null]);
        }

        // First, remove all current associations
        DB::table('b_l_fournisseurs')
            ->where('facture_fournisseur_id', $factureFournisseur->id)
            ->update(['facture_fournisseur_id' => null]);

        // Then associate the new BLs
        DB::table('b_l_fournisseurs')
            ->whereIn('id', $validated['blFournisseurs'])
            ->update(['facture_fournisseur_id' => $factureFournisseur->id]);

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




}
