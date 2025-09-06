<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $fillable = [
        'nom',
        'description',
        'prix_achat',
        'prix_vente',
        'stock',
        'seuil_alerte',
        'unite'
    ];
    protected $casts = [
        'prix_achat' => 'float',
        'prix_vente' => 'float',
        'stock' => 'integer',
    ];

    public function blFournisseurDetails()
    {
        return $this->hasMany(BLFournisseurDetail::class);
    }

    /**
     * Relation avec les détails de BL client (ventes).
     */
    public function blClientDetails()
    {
        return $this->hasMany(BLClientDetail::class);
    }

    /**
     * Scope pour produits en stock bas (si tu veux lister les produits critiques).
     */
    public function scopeStockBas($query)
    {
        return $query->whereColumn('stock', '<=', 'seuil_alerte');
    }

    public function historiqueAchats()
    {
        return $this->hasMany(BLFournisseurDetail::class, 'produit_id', 'id')
            ->with(['bonLivraison.fournisseur']);
    }



}
