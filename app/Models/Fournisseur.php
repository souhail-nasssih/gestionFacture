<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fournisseur extends Model
{
    use SoftDeletes;
    //
    protected $fillable = [
        'nom',
        'telephone',
        'adresse',
        'email',
        'delai_paiement',
    ];

    /**
     * Relation : un fournisseur peut avoir plusieurs bons de livraison.
     */
    public function bonsLivraison()
    {
        return $this->hasMany(BLFournisseur::class);
    }

    /**
     * Relation : un fournisseur peut avoir plusieurs factures.
     */
    public function factures()
    {
        return $this->hasMany(FactureFournisseur::class);
    }
}
