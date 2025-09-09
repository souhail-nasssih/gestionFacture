<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Produit;
use App\Models\FactureClient;
use App\Models\FactureFournisseur;

class NotificationService
{
    public static function notify(int $userId = null, string $type, string $title, ?string $message = null, array $data = []): AppNotification
    {
        return AppNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function notifyLowStock(Produit $produit, float $threshold, ?int $userId = null): ?AppNotification
    {
        if ($produit->quantite <= $threshold) {
            return self::notify(
                $userId,
                'stock.low',
                'Produit presque terminé',
                "Le produit {$produit->nom} atteint le seuil ({$produit->quantite}).",
                ['produit_id' => $produit->id, 'quantite' => $produit->quantite, 'threshold' => $threshold]
            );
        }
        return null;
    }

    public static function notifyOverdueFactureClient(FactureClient $facture, ?int $userId = null): ?AppNotification
    {
        $isOverdue = isset($facture->date_echeance)
            ? $facture->date_echeance < now()->toDateString()
            : false;
        if ($isOverdue && $facture->reste_a_payer > 0) {
            return self::notify(
                $userId,
                'facture.client.overdue',
                'Facture client échue',
                "Facture {$facture->numero_facture} échue",
                ['type' => 'client', 'facture_id' => $facture->id]
            );
        }
        return null;
    }

    public static function notifyOverdueFactureFournisseur(FactureFournisseur $facture, ?int $userId = null): ?AppNotification
    {
        $dateEch = $facture->date_echeance ?? $facture->date_facture;
        $isOverdue = $dateEch < now()->toDateString();
        $reste = max(0, $facture->montant_total - ($facture->reglements()->sum('montant_paye')));
        if ($isOverdue && $reste > 0) {
            return self::notify(
                $userId,
                'facture.fournisseur.overdue',
                'Facture fournisseur échue',
                "Facture {$facture->numero_facture} échue",
                ['type' => 'fournisseur', 'facture_id' => $facture->id]
            );
        }
        return null;
    }
}


