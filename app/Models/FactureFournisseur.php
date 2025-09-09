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
        'date_echeance',
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

    public function reglements()
    {
        return $this->hasMany(Reglement::class, 'facture_id')->where('type', 'fournisseur');
    }

    public function getMontantRegleAttribute()
    {
        return $this->reglements()->sum('montant_paye');
    }

    public function getResteAPayerAttribute()
    {
        return max(0, $this->montant_total - $this->montant_regle);
    }
}
