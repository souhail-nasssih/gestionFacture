<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reglement extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'facture_id',
        'montant_paye',
        'type_reglement',
        'date_reglement',
        'type',
        'infos_reglement',
        'numero_reglement',
        'date_reglement_at',
        'date_paiement',
        'description',
    ];

    protected $casts = [
        'infos_reglement' => 'array',
        'date_reglement' => 'date',
        'date_reglement_at' => 'datetime',
    ];

    public function facture()
    {
        if ($this->type === 'fournisseur') {
            return $this->belongsTo(FactureFournisseur::class, 'facture_id');
        }
        return $this->belongsTo(FactureClient::class, 'facture_id');
    }
}
