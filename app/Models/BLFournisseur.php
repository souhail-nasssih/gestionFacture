<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BLFournisseur extends Model
{
    use HasFactory;

    protected $table = 'b_l_fournisseurs';

    protected $fillable = [
        'fournisseur_id',
        'date_bl',
        'numero_bl',
        'facture_fournisseur_id',
    ];

    /**
     * Relation avec le fournisseur
     */
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class, 'fournisseur_id', 'id');
    }


    /**
     * Détails du bon de livraison
     */
    public function details()
    {
        return $this->hasMany(BLFournisseurDetail::class, 'b_l_fournisseur_id');
    }

    /**
     * Facture liée au bon de livraison
     */
    public function facture()
    {
        return $this->belongsTo(FactureFournisseur::class, 'facture_fournisseur_id');
    }
}
