<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FactureFournisseur extends Model
{
    //
    protected $fillable = [
        'fournisseur_id',
        'numero_facture',
        'date_facture',
        'montant_total',
        'statut_paiement',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function bonsLivraison()
    {
        return $this->hasMany(BLFournisseur::class, 'facture_fournisseur_id');
    }
}
