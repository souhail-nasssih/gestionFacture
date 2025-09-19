<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $fillable = [
        'reference',
        'nom',
        'description',
        'prix_achat',
        'prix_vente',
        'stock',
        'seuil_alerte',
        'unite'
    ];
    protected $casts = [
        'prix_achat' => 'float',
        'prix_vente' => 'float',
        'stock' => 'integer',
    ];

    public function blFournisseurDetails()
    {
        return $this->hasMany(BLFournisseurDetail::class);
    }

    /**
     * Relation avec les détails de BL client (ventes).
     */
    public function blClientDetails()
    {
        return $this->hasMany(BLClientDetail::class);
    }

    /**
     * Scope pour produits en stock bas (si tu veux lister les produits critiques).
     */
    public function scopeStockBas($query)
    {
        return $query->whereColumn('stock', '<=', 'seuil_alerte');
    }

    public function historiqueAchats()
    {
        return $this->hasMany(BLFournisseurDetail::class, 'produit_id', 'id')
            ->with(['bonLivraison.fournisseur']);
    }

    /**
     * Calcule la QMUP (Quantité Moyenne Unitaire Pondérée) basée sur l'historique des achats.
     * Calcul dynamique sans stockage en base de données.
     *
     * @return float
     */
    public function calculerQMUP()
    {
        // Récupérer tous les détails d'achat pour ce produit
        $achats = $this->blFournisseurDetails;

        // Si aucun achat, retourner 0
        if ($achats->isEmpty()) {
            return 0;
        }

        $sommeQuantitesPrix = 0;
        $sommeQuantites = 0;

        foreach ($achats as $achat) {
            $quantite = $achat->quantite;
            $prixUnitaire = $achat->prix_unitaire;

            $sommeQuantitesPrix += $quantite * $prixUnitaire;
            $sommeQuantites += $quantite;
        }

        // Éviter la division par zéro
        if ($sommeQuantites == 0) {
            return 0;
        }

        // QMUP = (somme des quantités achetées × prix d'achat) ÷ (somme des quantités achetées)
        return $sommeQuantitesPrix / $sommeQuantites;
    }

    /**
     * Met à jour le prix d'achat avec le prix unitaire du dernier achat.
     *
     * @return void
     */
    public function updatePrixAchatFromLatestPurchase()
    {
        $latestPurchase = $this->blFournisseurDetails()
            ->join('b_l_fournisseurs', 'b_l_fournisseur_details.b_l_fournisseur_id', '=', 'b_l_fournisseurs.id')
            ->orderBy('b_l_fournisseurs.date_bl', 'desc')
            ->orderBy('b_l_fournisseur_details.id', 'desc')
            ->first();

        if ($latestPurchase) {
            $this->update(['prix_achat' => $latestPurchase->prix_unitaire]);
        } else {
            // Aucun achat, mettre le prix d'achat à 0
            $this->update(['prix_achat' => 0]);
        }
    }

}
