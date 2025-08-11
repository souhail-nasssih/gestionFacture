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
        //inettia de retour
        return inertia('Fournisseur/Index', [
            'fournisseurs' => $fournisseurs,
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
        // Ajouter la validation des données
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:fournisseurs,telephone',
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:fournisseurs,email',
        ]);
        // Créer le fournisseur
        Fournisseur::create($request->all());
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Fournisseur créé avec succès.');
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
        //
        // Ajouter la validation des données
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:fournisseurs,telephone,' . $fournisseur->getKey(),
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:fournisseurs,email,' . $fournisseur->getKey(),
        ]);
        // Mettre à jour le fournisseur
        $fournisseur->update($request->all());
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Fournisseur mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fournisseur $fournisseur)
    {
        //
        // Supprimer le fournisseur
        $fournisseur->delete();
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Fournisseur supprimé avec succès.');
    }
}
