<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BLFournisseurDetail extends Model
{
    use HasFactory;

    protected $table = 'b_l_fournisseur_details';

    protected $fillable = [
        'b_l_fournisseur_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'montant_bl', // attention convention snake_case pour DB
    ];

    /**
     * Bon de livraison parent
     */
    public function bonLivraison()
    {
        return $this->belongsTo(BLFournisseur::class, 'b_l_fournisseur_id', 'id');
    }


    /**
     * Produit lié à la ligne
     */
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Vérifie si cet achat était le plus récent pour le produit.
     *
     * @return bool
     */
    public function wasLatestPurchase()
    {
        $latestPurchase = $this->produit->blFournisseurDetails()
            ->join('b_l_fournisseurs', 'b_l_fournisseur_details.b_l_fournisseur_id', '=', 'b_l_fournisseurs.id')
            ->orderBy('b_l_fournisseurs.date_bl', 'desc')
            ->orderBy('b_l_fournisseur_details.id', 'desc')
            ->first();

        return $latestPurchase && $latestPurchase->id === $this->id;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($detail) {
            $detail->montant_bl = $detail->quantite * $detail->prix_unitaire;
        });

        static::created(function ($detail) {
            $produit = $detail->produit;
            if ($produit) {
                $produit->increment('stock', $detail->quantite);

                // Mettre à jour le prix d'achat avec le prix unitaire du nouvel achat
                $produit->update(['prix_achat' => $detail->prix_unitaire]);
            }
        });

        static::updated(function ($detail) {
            $oldQuantite = $detail->getOriginal('quantite');
            $newQuantite = $detail->quantite;
            $difference = $newQuantite - $oldQuantite; // positive increases stock, negative decreases

            $produit = $detail->produit;
            if ($produit && $difference !== 0) {
                if ($difference > 0) {
                    $produit->increment('stock', $difference);
                } else {
                    $produit->decrement('stock', abs($difference));
                }
            }

            // Si le prix unitaire a changé, mettre à jour le prix d'achat
            if ($produit && $detail->isDirty('prix_unitaire')) {
                $produit->update(['prix_achat' => $detail->prix_unitaire]);
            }
        });

        static::deleting(function ($detail) {
            $produit = $detail->produit;
            if ($produit) {
                // Vérifier si l'achat à supprimer est le plus récent
                $wasLatestPurchase = $detail->wasLatestPurchase();

                // Stocker cette information pour l'utiliser après suppression
                $detail->was_latest_purchase = $wasLatestPurchase;
            }
        });

        static::deleted(function ($detail) {
            $produit = $detail->produit;
            if ($produit) {
                // Deleting a supplier BL detail should remove the previously added stock
                $produit->decrement('stock', $detail->quantite);

                // Si l'achat supprimé était le plus récent, recalculer le prix d'achat
                if (isset($detail->was_latest_purchase) && $detail->was_latest_purchase) {
                    $produit->updatePrixAchatFromLatestPurchase();
                }
            }
        });
    }
}
