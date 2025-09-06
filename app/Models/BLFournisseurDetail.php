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
        });

        static::deleted(function ($detail) {
            $produit = $detail->produit;
            if ($produit) {
                // Deleting a supplier BL detail should remove the previously added stock
                $produit->decrement('stock', $detail->quantite);
            }
        });
    }
}
