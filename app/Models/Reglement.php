<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reglement extends Model
{
    protected $fillable = [
        'facture_id',
        'montant',
        'mode_paiement',
        'numero_reglement',
        'date_reglement',
        'type',
    ];

    public function facture()
    {
        return $this->belongsTo(FactureClient::class, 'facture_id');
    }
}
