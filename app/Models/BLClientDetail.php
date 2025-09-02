<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BLClientDetail extends Model
{
    use HasFactory;

    protected $table = 'bl_client_details';

    protected $fillable = [
        'bl_client_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'montant'
    ];

    protected $casts = [
        'quantite' => 'integer',
        'prix_unitaire' => 'decimal:2',
        'montant' => 'decimal:2',
    ];

    public function blClient(): BelongsTo
    {
        return $this->belongsTo(BLClient::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($detail) {
            $detail->montant = $detail->quantite * $detail->prix_unitaire;
        });

        static::created(function ($detail) {
            // Update product stock
            $produit = $detail->produit;
            $produit->stock -= $detail->quantite;
            $produit->save();
        });

        static::updated(function ($detail) {
            // Update product stock
            $oldQuantite = $detail->getOriginal('quantite');
            $newQuantite = $detail->quantite;
            $difference = $newQuantite - $oldQuantite;

            $produit = $detail->produit;
            $produit->stock -= $difference;
            $produit->save();
        });

        static::deleted(function ($detail) {
            // Restore product stock
            $produit = $detail->produit;
            $produit->stock += $detail->quantite;
            $produit->save();
        });
    }
}
