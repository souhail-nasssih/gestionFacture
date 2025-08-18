<?php

namespace App\Http\Controllers;

use App\Models\BLFournisseur;
use App\Models\FactureFournisseur;
use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FactureFournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('Facture/Index', [
            'facturesFournisseurs' => FactureFournisseur::with(['fournisseur', 'bonsLivraison'])->paginate(10),
            'fournisseurs' => Fournisseur::all(),
            'blFournisseurs' => BLFournisseur::with(['details', 'fournisseur'])->get(),
        ]);
    }
    public function getBLByFournisseur(Fournisseur $fournisseur)
    {
        // Récupère tous les BLs du fournisseur (même ceux déjà associés à une facture)
        return response()->json(
            BLFournisseur::with(['details', 'fournisseur'])
                ->where('fournisseur_id', $fournisseur->id)
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
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FactureFournisseur $factureFournisseur)
    {
        //
    }
}
