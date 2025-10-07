<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BLClient extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bl_clients';

    protected $fillable = [
        'numero_bl',
        'numero_bc',
        'description',
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
                    throw new \InvalidArgumentException('BL number must start with "BL" followed by at least 5 digits (e.g., BL00001)');
                }

                // Check for uniqueness
                if (static::where('numero_bl', $blClient->numero_bl)->exists()) {
                    throw new \InvalidArgumentException('This BL number already exists');
                }
            }
        });

        static::updating(function ($blClient) {
            // Validate BL number format if it's being updated
            if (!empty($blClient->numero_bl)) {
                if (!preg_match('/^BL\d{5,}$/', $blClient->numero_bl)) {
                    throw new \InvalidArgumentException('BL number must start with "BL" followed by at least 5 digits (e.g., BL00001)');
                }

                // Check for uniqueness (excluding current record)
                if (static::where('numero_bl', $blClient->numero_bl)->where('id', '!=', $blClient->id)->exists()) {
                    throw new \InvalidArgumentException('This BL number already exists');
                }
            }
        });

        static::deleting(function ($blClient) {
            // Soft delete all related details when BL is soft deleted
            $blClient->details()->delete();
        });

        static::restoring(function ($blClient) {
            // Restore all related details when BL is restored
            $blClient->details()->onlyTrashed()->restore();
        });
    }

    public static function generateNumeroBL()
    {
        // Get all BL numbers and find the highest numeric value
        $allBLs = static::where('numero_bl', 'like', 'BL%')->pluck('numero_bl');

        if ($allBLs->isEmpty()) {
            return 'BL00001';
        }

        $maxNumber = 0;
        foreach ($allBLs as $blNumber) {
            // Extract numeric part after 'BL' and validate format
            if (preg_match('/^BL(\d+)$/', $blNumber, $matches)) {
                $number = intval($matches[1]);
                if ($number > $maxNumber) {
                    $maxNumber = $number;
                }
            }
        }

        $nextNumber = $maxNumber + 1;

        // Ensure at least 5 digits, but allow more if needed
        return 'BL' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }
}
