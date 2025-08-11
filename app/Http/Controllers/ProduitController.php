<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Paginer les produits par 10 (modifiable)
        $produits = Produit::paginate(10);

        // Retourner avec Inertia
        return inertia('Produits/Produits', [
            'produits' => $produits,
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
        // ajouter la validation des données
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unite' => 'required|string',
        ]);
        // Créer le produit
        Produit::create($request->all());
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Produit créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Produit $produit)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Produit $produit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Produit $produit)
    {
        //
        // ajouter la validation des données
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unite' => 'required|string',
        ]);
        // Mettre à jour le produit
        $produit->update($request->all());
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Produit mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produit $produit)
    {
        // Supprimer le produit
        $produit->delete();
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Produit supprimé avec succès.');
    }
}
