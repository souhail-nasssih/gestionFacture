<?php

namespace App\Observers;

use App\Models\Produit;
use App\Services\NotificationService;

class ProduitObserver
{
    private static ?int $previousStock = null;

    public function saving(Produit $produit): void
    {
        self::$previousStock = $produit->exists ? $produit->getOriginal('stock') : null;
    }

    public function saved(Produit $produit): void
    {
        $notifications = app(NotificationService::class);
        $seuil = $produit->seuil_alerte ?? 0;
        $stock = $produit->stock;
        $previous = self::$previousStock;

        $wasAboveSeuil = $previous === null || $previous > $seuil;
        $isNowAtOrBelowSeuil = $stock <= $seuil && $stock > 0;
        $wasAboveZero = $previous === null || $previous > 0;
        $isNowZero = $stock === 0;

        if ($wasAboveSeuil && $isNowAtOrBelowSeuil) {
            $notifications->notifyLowStock($produit->fresh());
        }

        if ($wasAboveZero && $isNowZero) {
            $notifications->notifyOutOfStock($produit->fresh());
        }

        self::$previousStock = null;
    }
}
