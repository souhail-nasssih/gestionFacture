<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FactureClient extends Model
{
    protected $fillable = [
        'client_id',
        'numero_facture',
        'date_facture',
        'montant_total',
        'statut_paiement',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function bonsLivraison()
    {
        return $this->hasMany(BLClient::class, 'facture_client_id');
    }

    public function reglements()
    {
        return $this->hasMany(Reglement::class, 'facture_id');
    }

    public function getMontantRegleAttribute()
    {
        return $this->reglements()->sum('montant');
    }

    public function getResteAPayerAttribute()
    {
        return max(0, $this->montant_total - $this->montant_regle);
    }

    public function getStatutEcheanceAttribute()
    {
        if ($this->reste_a_payer <= 0) {
            return 'Encaissée';
        }
        if (isset($this->date_echeance) && $this->date_echeance < now()->toDateString()) {
            return 'Échue';
        }
        return 'En attente';
    }
}
