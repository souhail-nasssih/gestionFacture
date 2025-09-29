<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FactureClient extends Model
{
    protected $fillable = [
        'client_id',
        'numero_facture',
        'date_facture',
        'date_echeance',
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
        return $this->hasMany(Reglement::class, 'facture_id')->where('type', 'client');
    }

    public function getMontantRegleAttribute()
    {
        return $this->reglements()->sum('montant_paye');
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

    /**
     * Boot method to handle numero_facture generation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($factureClient) {
            // Auto-generate numero_facture if not provided
            if (empty($factureClient->numero_facture)) {
                $factureClient->numero_facture = static::generateNumeroFacture();
            } else {
                // Validate manually entered numero_facture format
                if (!preg_match('/^FC\d{2}\d{3}-\d{2}$/', $factureClient->numero_facture)) {
                    throw new \InvalidArgumentException('Facture number must follow format FC09001-25 (FC + month + counter + year)');
                }

                // Check for uniqueness
                if (static::where('numero_facture', $factureClient->numero_facture)->exists()) {
                    throw new \InvalidArgumentException('This facture number already exists');
                }
            }
        });

        static::updating(function ($factureClient) {
            // Validate numero_facture format if it's being updated
            if (!empty($factureClient->numero_facture) && $factureClient->isDirty('numero_facture')) {
                if (!preg_match('/^FC\d{2}\d{3}-\d{2}$/', $factureClient->numero_facture)) {
                    throw new \InvalidArgumentException('Facture number must follow format FC09001-25 (FC + month + counter + year)');
                }

                // Check for uniqueness (excluding current record)
                if (static::where('numero_facture', $factureClient->numero_facture)->where('id', '!=', $factureClient->id)->exists()) {
                    throw new \InvalidArgumentException('This facture number already exists');
                }
            }
        });
    }

    /**
     * Generate the next numero_facture following the format FC09001-25
     * Format: FC + MM + CCC + -YY
     * Where: FC = fixed prefix, MM = month (01-12), CCC = counter (001+), YY = year (last 2 digits)
     */
    public static function generateNumeroFacture()
    {
        $now = now();
        $currentMonth = $now->format('m'); // 01-12
        $currentYear = $now->format('y'); // 25, 26, etc.

        // Find the highest counter for the current month/year
        $pattern = "FC{$currentMonth}%{$currentYear}";
        $lastFacture = static::where('numero_facture', 'like', $pattern)
            ->orderBy('numero_facture', 'desc')
            ->first();

        if (!$lastFacture) {
            // No facture exists for this month/year, start at 001
            $nextCounter = 1;
        } else {
            // Extract counter from the last facture number
            // Format: FC09015-25 -> extract 015
            if (preg_match('/^FC\d{2}(\d+)-(\d{2})$/', $lastFacture->numero_facture, $matches)) {
                $lastCounter = intval($matches[1]);
                $nextCounter = $lastCounter + 1;
            } else {
                // Fallback if format doesn't match
                $nextCounter = 1;
            }
        }

        // Format the counter with leading zeros (minimum 3 digits)
        $formattedCounter = str_pad($nextCounter, 3, '0', STR_PAD_LEFT);

        return "FC{$currentMonth}{$formattedCounter}-{$currentYear}";
    }
}
