<?php

namespace App\Http\Controllers;

use App\Models\BLFournisseur;
use App\Models\BLFournisseurDetail;
use App\Models\Fournisseur;
use App\Models\Produit;
use DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BLFournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $blFournisseurs = BLFournisseur::with('fournisseur', 'details.produit')->orderBy('created_at', 'desc')->paginate(10);
        return inertia('BLFournisseurs/Index', [
            'blFournisseurs' => $blFournisseurs,
            'fournisseurs' => Fournisseur::all(),
            'produits' => Produit::all(),
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
        DB::beginTransaction();

        try {
            // Validation des données avec messages personnalisés
            $validated = $request->validate([
                'fournisseur_id' => 'required|exists:fournisseurs,id',
                'date_bl' => 'required|date',
                'numero_bl' => 'required|string|unique:b_l_fournisseurs,numero_bl',
                'details' => 'required|array|min:1',
                'details.*.produit_id' => 'required|exists:produits,id',
                'details.*.quantite' => 'required|integer|min:1',
                'details.*.prix_unitaire' => 'required|numeric|min:0',
            ], [
                'fournisseur_id.required' => 'Le fournisseur est obligatoire.',
                'fournisseur_id.exists' => 'Le fournisseur sélectionné n\'existe pas.',
                'date_bl.required' => 'La date BL est obligatoire.',
                'date_bl.date' => 'La date BL doit être une date valide.',
                'numero_bl.required' => 'Le numéro BL est obligatoire.',
                'numero_bl.unique' => 'Ce numéro BL existe déjà. Veuillez choisir un autre numéro.',
                'details.required' => 'Au moins un produit doit être ajouté.',
                'details.min' => 'Au moins un produit doit être ajouté.',
                'details.*.produit_id.required' => 'Le produit est obligatoire.',
                'details.*.produit_id.exists' => 'Le produit sélectionné n\'existe pas.',
                'details.*.quantite.required' => 'La quantité est obligatoire.',
                'details.*.quantite.integer' => 'La quantité doit être un nombre entier.',
                'details.*.quantite.min' => 'La quantité doit être supérieure à 0.',
                'details.*.prix_unitaire.required' => 'Le prix unitaire est obligatoire.',
                'details.*.prix_unitaire.numeric' => 'Le prix unitaire doit être un nombre.',
                'details.*.prix_unitaire.min' => 'Le prix unitaire doit être supérieur à 0.',
            ]);

            // Validation supplémentaire pour les détails
            if (empty($validated['details'])) {
                throw new \Exception('Au moins un produit doit être ajouté.');
            }

            // Vérifier qu'il n'y a pas de produits en double
            $produitIds = collect($validated['details'])->pluck('produit_id');
            if ($produitIds->duplicates()->count() > 0) {
                throw new \Exception('Un même produit ne peut pas être ajouté plusieurs fois.');
            }

            // Création du BL Fournisseur
            $blFournisseur = BLFournisseur::create([
                'fournisseur_id' => $validated['fournisseur_id'],
                'date_bl' => $validated['date_bl'],
                'numero_bl' => $validated['numero_bl'],
            ]);

            // Création des détails avec l'ID du BL
            $detailsCreated = [];
            foreach ($validated['details'] as $index => $detail) {
                $detailCreated = BLFournisseurDetail::create([
                    'b_l_fournisseur_id' => $blFournisseur->id,
                    'produit_id' => $detail['produit_id'],
                    'quantite' => $detail['quantite'],
                    'prix_unitaire' => $detail['prix_unitaire'],
                    'montant_bl' => $detail['quantite'] * $detail['prix_unitaire'],
                ]);
                $detailsCreated[] = $detailCreated;
            }

            DB::commit();

            // Log pour le débogage
            \Log::info('BL Fournisseur créé', [
                'bl_id' => $blFournisseur->id,
                'numero_bl' => $blFournisseur->numero_bl,
                'nb_details' => count($detailsCreated),
                'total_montant' => collect($detailsCreated)->sum('montant_bl')
            ]);

            return redirect()->route('bl-fournisseurs.index')->with('success', 'BL créé avec succès - ' . count($detailsCreated) . ' produit(s) ajouté(s)');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            throw $e; // Laisser Inertia gérer les erreurs de validation
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors de la création du BL Fournisseur', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            return back()->withErrors(['general' => 'Erreur: ' . $e->getMessage()]);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(BLFournisseur $bLFournisseur)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BLFournisseur $bLFournisseur)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */










    public function update(Request $request, BLFournisseur $bl_fournisseur)
    {
        // dd($request->all());
        DB::beginTransaction();

        try {
            // Validation des données avec messages personnalisés
            $validated = $request->validate([
                'fournisseur_id' => 'required|exists:fournisseurs,id',
                'date_bl' => 'required|date',
                'numero_bl' => [
                    'required',
                    'string',
                    Rule::unique('b_l_fournisseurs', 'numero_bl')->ignore($bl_fournisseur->id, 'id'),
                ],
                'details' => 'required|array|min:1',
                'details.*.produit_id' => 'required|exists:produits,id',
                'details.*.quantite' => 'required|integer|min:1',
                'details.*.prix_unitaire' => 'required|numeric|min:0',
            ], [
                'fournisseur_id.required' => 'Le fournisseur est obligatoire.',
                'fournisseur_id.exists' => 'Le fournisseur sélectionné n\'existe pas.',
                'date_bl.required' => 'La date BL est obligatoire.',
                'date_bl.date' => 'La date BL doit être une date valide.',
                'numero_bl.required' => 'Le numéro BL est obligatoire.',
                'numero_bl.unique' => 'Ce numéro BL existe déjà. Veuillez choisir un autre numéro.',
                'details.required' => 'Au moins un produit doit être ajouté.',
                'details.min' => 'Au moins un produit doit être ajouté.',
                'details.*.produit_id.required' => 'Le produit est obligatoire.',
                'details.*.produit_id.exists' => 'Le produit sélectionné n\'existe pas.',
                'details.*.quantite.required' => 'La quantité est obligatoire.',
                'details.*.quantite.integer' => 'La quantité doit être un nombre entier.',
                'details.*.quantite.min' => 'La quantité doit être supérieure à 0.',
                'details.*.prix_unitaire.required' => 'Le prix unitaire est obligatoire.',
                'details.*.prix_unitaire.numeric' => 'Le prix unitaire doit être un nombre.',
                'details.*.prix_unitaire.min' => 'Le prix unitaire doit être supérieur à 0.',
            ]);

            // Vérifier qu'il n'y a pas de produits en double
            $produitIds = collect($validated['details'])->pluck('produit_id');
            if ($produitIds->duplicates()->count() > 0) {
                throw new \Exception('Un même produit ne peut pas être ajouté plusieurs fois.');
            }

            // Update du BL Fournisseur
            $bl_fournisseur->update([
                'fournisseur_id' => $validated['fournisseur_id'],
                'date_bl' => $validated['date_bl'],
                'numero_bl' => $validated['numero_bl'],
            ]);

            // Supprimer les anciens détails
            $bl_fournisseur->details()->delete();

            // Ajouter les nouveaux détails
            $detailsCreated = [];
            foreach ($validated['details'] as $detail) {
                $detailCreated = BLFournisseurDetail::create([
                    'b_l_fournisseur_id' => $bl_fournisseur->id,
                    'produit_id' => $detail['produit_id'],
                    'quantite' => $detail['quantite'],
                    'prix_unitaire' => $detail['prix_unitaire'],
                    'montant_bl' => $detail['quantite'] * $detail['prix_unitaire'],
                ]);
                $detailsCreated[] = $detailCreated;
            }

            DB::commit();

            \Log::info('BL Fournisseur mis à jour', [
                'bl_id' => $bl_fournisseur->id,
                'numero_bl' => $bl_fournisseur->numero_bl,
                'nb_details' => count($detailsCreated),
                'total_montant' => collect($detailsCreated)->sum('montant_bl')
            ]);

            return redirect()->route('bl-fournisseurs.index')
                ->with('success', 'BL mis à jour avec succès - ' . count($detailsCreated) . ' produit(s) ajouté(s)');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            throw $e; // Laisser Inertia ou Laravel gérer les erreurs de validation
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors de la mise à jour du BL Fournisseur', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            return back()->withErrors(['general' => 'Erreur: ' . $e->getMessage()]);
        }
    }







    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BLFournisseur $bl_fournisseur)
    {
        DB::beginTransaction();

        try {
            // Supprimer d'abord les détails liés
            $bl_fournisseur->details()->delete();

            // Supprimer le BL Fournisseur
            $bl_fournisseur->delete();

            DB::commit();

            \Log::info('BL Fournisseur supprimé', [
                'bl_id' => $bl_fournisseur->id,
                'numero_bl' => $bl_fournisseur->numero_bl
            ]);

            return redirect()->route('bl-fournisseurs.index')
                ->with('success', 'BL supprimé avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Erreur lors de la suppression du BL Fournisseur', [
                'error' => $e->getMessage(),
                'bl_id' => $bl_fournisseur->id
            ]);

            return back()->withErrors(['general' => 'Erreur: ' . $e->getMessage()]);
        }
    }

}
