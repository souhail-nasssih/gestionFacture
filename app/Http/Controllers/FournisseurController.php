<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Récupérer tous les fournisseurs
        $fournisseurs = Fournisseur::paginate(10);

        // Return with flash messages
        return inertia('Fournisseur/Index', [
            'fournisseurs' => $fournisseurs,
            'flash' => session()->get('flash') // Explicitly pass flash messages
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
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:fournisseurs,telephone',
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:fournisseurs,email',
            'delai_paiement' => 'required|integer|min:0',
        ]);

        Fournisseur::create($request->all());

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Fournisseur $fournisseur)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Fournisseur $fournisseur)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Fournisseur $fournisseur)
    {
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:fournisseurs,telephone,' . $fournisseur->getKey(),
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:fournisseurs,email,' . $fournisseur->getKey(),
            'delai_paiement' => 'required|integer|min:0',
        ]);

        $fournisseur->update($request->all());

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fournisseur $fournisseur)
    {
        // Supprimer le fournisseur
        $fournisseur->delete();
        // Rediriger vers la page index
        return redirect()->route('fournisseurs.index')->with('success', 'Fournisseur supprimé avec succès.');
    }
}
