<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    //
    protected $fillable = [
        'nom',
        'telephone',
        'adresse',
        'email',
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
