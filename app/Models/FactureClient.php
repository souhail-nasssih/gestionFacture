<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FactureClient extends Model
{
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
