<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BLFournisseurDetail extends Model
{
    //
    protected $fillable = [
        'b_l_fournisseur_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'montantBL',
    ];
    public function bonLivraison()
    {
        return $this->belongsTo(BLFournisseur::class, 'b_l_fournisseur_id'); // Corrigé ici aussi
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
