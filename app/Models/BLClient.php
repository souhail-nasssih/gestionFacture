<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BLClient extends Model
{
    use HasFactory;

    protected $table = 'bl_clients';

    protected $fillable = [
        'numero_bl',
        'date_bl',
        'client_id',
        'notes',
        'statut'
    ];

    protected $casts = [
        'date_bl' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(BLClientDetail::class, 'bl_client_id');
    }

    public function facture()
    {
        return $this->belongsTo(FactureClient::class, 'facture_client_id');
    }

    public function getTotalAttribute()
    {
        return $this->details->sum('montant');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($blClient) {
            // Auto-generate BL number if not provided
            if (empty($blClient->numero_bl)) {
                $blClient->numero_bl = static::generateNumeroBL();
            } else {
                // Validate manually entered BL number format
                if (!preg_match('/^BL\d{5,}$/', $blClient->numero_bl)) {
                    throw new \InvalidArgumentException('BL number must start with "BL" followed by at least 5 digits');
                }

                // Check for uniqueness
                if (static::where('numero_bl', $blClient->numero_bl)->exists()) {
                    throw new \InvalidArgumentException('This BL number already exists');
                }
            }
        });
    }

    protected static function generateNumeroBL()
    {
        $lastBL = static::latest('numero_bl')->first();
        if (!$lastBL) {
            return 'BL00001';
        }

        // Extract the numeric part after 'BL'
        $numericPart = substr($lastBL->numero_bl, 2);
        $nextNumber = intval($numericPart) + 1;

        // Ensure at least 5 digits, but allow more if needed
        return 'BL' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }
}
