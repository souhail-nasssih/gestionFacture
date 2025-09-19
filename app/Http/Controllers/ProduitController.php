<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Produit::query();
        $searchTerm = $request->input('search');

        // Recherche
        if ($searchTerm) {
            $searchTerm = '%' . $searchTerm . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('nom', 'like', $searchTerm)
                  ->orWhere('reference', 'like', $searchTerm)
                  ->orWhere('description', 'like', $searchTerm)
                  ->orWhere('unite', 'like', $searchTerm);
            });
        }

        // Paginer les produits
        $produits = $query->orderBy('created_at', 'desc')
                         ->paginate(10)
                         ->withQueryString();

        // Ajouter la QMUP calculée dynamiquement pour chaque produit
        $produits->getCollection()->transform(function ($produit) {
            $produit->qmup = $produit->calculerQMUP();
            return $produit;
        });

        return inertia('Produits/Produits', [
            'produits' => $produits,
            'filters' => [
                'search' => $request->input('search'),
            ],
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
            'reference' => 'required|string|max:50|unique:produits,reference',
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unite' => 'required|string',
        ]);

        Produit::create($request->all());

        // Redirect to index instead of back
        return redirect()->route('produits.index')->with('success', 'Produit créé avec succès.');
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
        $request->validate([
            'reference' => 'required|string|max:50|unique:produits,reference,'.$produit->id,
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unite' => 'required|string',
        ]);

        $produit->update($request->all());

        // Redirect to index instead of back
        return redirect()->route('produits.index')->with('success', 'Produit mis à jour avec succès.');
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produit $produit)
    {
        $produit->delete();

        // Redirect to index instead of back
        return redirect()->route('produits.index')->with('success', 'Produit supprimé avec succès.');
    }

    public function historique($id)
    {
        $produit = Produit::with([
            'historiqueAchats.bonLivraison.fournisseur'
        ])->findOrFail($id);
        // dd($produit->historiqueAchats);
        return inertia('Produits/Historique', [
            'produit' => $produit,
            'historique' => $produit->historiqueAchats,
        ]);
    }

    /**
     * Calcule et retourne la QMUP (Quantité Moyenne Unitaire Pondérée) pour un produit.
     * Calcul dynamique basé sur l'historique des achats.
     */
    public function qmup($id)
    {
        $produit = Produit::findOrFail($id);

        // Calculer la QMUP dynamiquement
        $qmup = $produit->calculerQMUP();

        return response()->json([
            'produit_id' => $produit->id,
            'produit_nom' => $produit->nom,
            'qmup' => round($qmup, 2), // Arrondir à 2 décimales
            'message' => $qmup > 0 ? 'QMUP calculée avec succès' : 'Aucun achat trouvé pour ce produit'
        ]);
    }

    /**
     * Initialise le prix d'achat pour tous les produits basé sur leur dernier achat.
     * Utile pour corriger les prix d'achat existants.
     */
    public function initializePrixAchat()
    {
        $produits = Produit::all();
        $updated = 0;

        foreach ($produits as $produit) {
            $produit->updatePrixAchatFromLatestPurchase();
            $updated++;
        }

        return response()->json([
            'message' => "Prix d'achat initialisé pour {$updated} produits",
            'updated_count' => $updated
        ]);
    }


}
