<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FactureFournisseur extends Model
{
    use HasFactory;

    protected $table = 'facture_fournisseurs';

    protected $fillable = [
        'fournisseur_id',
        'numero_facture',
        'date_facture',
        'montant_total',
        'statut_paiement',
    ];

    /**
     * Relation avec le fournisseur
     */
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    /**
     * Les bons de livraison associés à la facture
     */
    public function bonsLivraison()
    {
        return $this->hasMany(BLFournisseur::class, 'facture_fournisseur_id');
    }
}
