<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use SoftDeletes;
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

    /**
     * Relation : un client peut avoir plusieurs règlements.
     */
    public function reglements()
    {
        return $this->hasManyThrough(Reglement::class, FactureClient::class, 'client_id', 'facture_id')
            ->where('reglements.type', 'client');
    }

    /**
     * Calculer le montant total des factures du client
     */
    public function getMontantTotalFacturesAttribute()
    {
        return $this->factures()->sum('montant_total');
    }

    /**
     * Calculer le montant total payé par le client
     */
    public function getMontantTotalPayeAttribute()
    {
        return $this->factures()->withSum('reglements', 'montant_paye')->get()
            ->sum('reglements_sum_montant_paye');
    }

    /**
     * Calculer le reste à payer du client
     */
    public function getResteAPayerAttribute()
    {
        return $this->montant_total_factures - $this->montant_total_paye;
    }

}
