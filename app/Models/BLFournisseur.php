<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BLFournisseur extends Model
{
    //

    protected $fillable = [
        'fournisseur_id',
        'date_bl',
        'numero_bl',
        'facture_fournisseur_id',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function details()
    {
        return $this->hasMany(BLFournisseurDetail::class);
    }

    public function facture()
    {
        return $this->belongsTo(FactureFournisseur::class, 'facture_fournisseur_id');
    }
}
