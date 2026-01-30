<?php

namespace App\Observers;

use App\Events\LowStockAlert;
use App\Models\Produit;

class ProduitObserver
{
    /**
     * Stock précédent avant la mise à jour (pour détecter le passage sous le seuil).
     */
    private static ?int $previousStock = null;

    /**
     * Mémorise le stock avant modification.
     */
    public function saving(Produit $produit): void
    {
        self::$previousStock = $produit->exists ? $produit->getOriginal('stock') : null;
    }

    /**
     * Déclenche une alerte broadcast uniquement quand le stock vient de passer
     * à ou en dessous du seuil (évite les alertes en double).
     */
    public function saved(Produit $produit): void
    {
        $seuil = $produit->seuil_alerte ?? 0;
        $stock = $produit->stock;
        $wasAbove = self::$previousStock === null || self::$previousStock > $seuil;
        $isNowAtOrBelow = $stock <= $seuil && $stock >= 0;

        if ($wasAbove && $isNowAtOrBelow) {
            LowStockAlert::dispatch($produit->fresh());
        }

        self::$previousStock = null;
    }
}
