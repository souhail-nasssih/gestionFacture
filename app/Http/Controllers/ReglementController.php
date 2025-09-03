<?php

namespace App\Http\Controllers;

use App\Models\Reglement;
use App\Models\FactureClient;
use Illuminate\Http\Request;

class ReglementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reglements = Reglement::with('facture')->orderBy('date_reglement', 'desc')->paginate(20);
        return response()->json($reglements);
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
            'facture_id' => 'required|exists:facture_clients,id',
            'montant' => 'required|numeric|min:0.01',
            'mode_paiement' => 'required|string',
            'numero_reglement' => 'nullable|string',
            'date_reglement' => 'required|date',
            'type' => 'required|in:client,fournisseur',
        ]);
        $reglement = Reglement::create($validated);
        return response()->json($reglement, 201);
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
            'montant' => 'required|numeric|min:0.01',
            'mode_paiement' => 'required|string',
            'numero_reglement' => 'nullable|string',
            'date_reglement' => 'required|date',
        ]);
        $reglement->update($validated);
        return response()->json($reglement);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reglement $reglement)
    {
        $reglement->delete();
        return response()->json(['success' => true]);
    }
}
