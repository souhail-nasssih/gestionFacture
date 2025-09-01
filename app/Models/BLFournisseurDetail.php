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
        return $this->belongsTo(BLFournisseur::class, 'b_l_fournisseur_id');
    }

    /**
     * Produit lié à la ligne
     */
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
