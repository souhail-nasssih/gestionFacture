<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
      protected $fillable = [
        'nom',
        'telephone',
        'adresse',
        'email',
        'delai_paiement',
    ];

    /**
     * Relation : un client peut avoir plusieurs factures.
     */
    public function factures()
    {
        return $this->hasMany(FactureClient::class);
    }
    /**
     * Relation : un client peut avoir plusieurs bons de livraison.
     */
    public function bonsLivraison()
    {
        return $this->hasMany(BLClient::class);
    }


}
