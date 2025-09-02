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
            if (empty($blClient->numero_bl)) {
                $blClient->numero_bl = static::generateNumeroBL();
            }
        });
    }

    protected static function generateNumeroBL()
    {
        $year = now()->year;
        $lastBL = static::whereYear('created_at', $year)->latest()->first();
        $sequence = $lastBL ? (int) substr($lastBL->numero_bl, -4) + 1 : 1;

        return 'BL-C-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
