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

    /**
     * Check and notify for due dates (both client and supplier invoices)
     * Only sends notifications for invoices with "En retard" status (overdue)
     */
    public static function checkDueDates(?int $userId = null): array
    {
        $notifications = [];

        // Check client invoices - only those that are truly overdue (past due date)
        $clientFactures = FactureClient::whereNotNull('date_echeance')
            ->where('date_echeance', '<', now()->toDateString()) // Only past due date, not on due date
            ->get()
            ->filter(function($facture) {
                return $facture->reste_a_payer > 0; // Only unpaid invoices
            });

        foreach ($clientFactures as $facture) {
            // Check if notification already exists for this invoice (avoid duplicates)
            $existingNotification = AppNotification::where('user_id', $userId)
                ->where('type', 'due_date.client')
                ->whereJsonContains('data->facture_id', $facture->id)
                ->where('created_at', '>=', now()->subDays(1)) // Only check last 24 hours
                ->first();

            if (!$existingNotification) {
                $daysOverdue = now()->diffInDays($facture->date_echeance, false);
                $notification = self::notify(
                    $userId,
                    'due_date.client',
                    'Facture client échue',
                    "Facture {$facture->numero_facture} en retard de {$daysOverdue} jour(s)",
                    [
                        'type' => 'client',
                        'facture_id' => $facture->id,
                        'numero_facture' => $facture->numero_facture,
                        'date_echeance' => $facture->date_echeance,
                        'montant_restant' => $facture->reste_a_payer,
                        'days_overdue' => $daysOverdue,
                        'icon' => '🚨',
                        'color' => 'red'
                    ]
                );
                $notifications[] = $notification;
            }
        }

        // Check supplier invoices - only those that are truly overdue (past due date)
        $supplierFactures = FactureFournisseur::whereNotNull('date_echeance')
            ->where('date_echeance', '<', now()->toDateString()) // Only past due date, not on due date
            ->get()
            ->filter(function($facture) {
                return $facture->reste_a_payer > 0; // Only unpaid invoices
            });

        foreach ($supplierFactures as $facture) {
            // Check if notification already exists for this invoice (avoid duplicates)
            $existingNotification = AppNotification::where('user_id', $userId)
                ->where('type', 'due_date.fournisseur')
                ->whereJsonContains('data->facture_id', $facture->id)
                ->where('created_at', '>=', now()->subDays(1)) // Only check last 24 hours
                ->first();

            if (!$existingNotification) {
                $daysOverdue = now()->diffInDays($facture->date_echeance, false);
                $notification = self::notify(
                    $userId,
                    'due_date.fournisseur',
                    'Facture fournisseur échue',
                    "Facture {$facture->numero_facture} en retard de {$daysOverdue} jour(s)",
                    [
                        'type' => 'fournisseur',
                        'facture_id' => $facture->id,
                        'numero_facture' => $facture->numero_facture,
                        'date_echeance' => $facture->date_echeance,
                        'montant_restant' => $facture->reste_a_payer,
                        'days_overdue' => $daysOverdue,
                        'icon' => '🚨',
                        'color' => 'red'
                    ]
                );
                $notifications[] = $notification;
            }
        }

        return $notifications;
    }

    /**
     * Check for upcoming due dates (within next 3 days)
     * Only sends notifications for invoices that are due soon but not yet overdue
     */
    public static function checkUpcomingDueDates(?int $userId = null): array
    {
        $notifications = [];
        $today = now()->toDateString();
        $upcomingDate = now()->addDays(3)->toDateString();

        // Check client invoices - only those due within next 3 days but not yet overdue
        $clientFactures = FactureClient::whereNotNull('date_echeance')
            ->where('date_echeance', '>', $today) // Not yet due
            ->where('date_echeance', '<=', $upcomingDate) // Due within next 3 days
            ->get()
            ->filter(function($facture) {
                return $facture->reste_a_payer > 0; // Only unpaid invoices
            });

        foreach ($clientFactures as $facture) {
            // Check if notification already exists for this invoice (avoid duplicates)
            $existingNotification = AppNotification::where('user_id', $userId)
                ->where('type', 'due_date.upcoming.client')
                ->whereJsonContains('data->facture_id', $facture->id)
                ->where('created_at', '>=', now()->subDays(1)) // Only check last 24 hours
                ->first();

            if (!$existingNotification) {
                $daysUntilDue = now()->diffInDays($facture->date_echeance, false);
                $notification = self::notify(
                    $userId,
                    'due_date.upcoming.client',
                    'Facture client à échéance proche',
                    "Facture {$facture->numero_facture} arrive à échéance dans {$daysUntilDue} jour(s)",
                    [
                        'type' => 'client',
                        'facture_id' => $facture->id,
                        'numero_facture' => $facture->numero_facture,
                        'date_echeance' => $facture->date_echeance,
                        'montant_restant' => $facture->reste_a_payer,
                        'days_until_due' => $daysUntilDue,
                        'icon' => '📅',
                        'color' => 'blue'
                    ]
                );
                $notifications[] = $notification;
            }
        }

        // Check supplier invoices - only those due within next 3 days but not yet overdue
        $supplierFactures = FactureFournisseur::whereNotNull('date_echeance')
            ->where('date_echeance', '>', $today) // Not yet due
            ->where('date_echeance', '<=', $upcomingDate) // Due within next 3 days
            ->get()
            ->filter(function($facture) {
                return $facture->reste_a_payer > 0; // Only unpaid invoices
            });

        foreach ($supplierFactures as $facture) {
            // Check if notification already exists for this invoice (avoid duplicates)
            $existingNotification = AppNotification::where('user_id', $userId)
                ->where('type', 'due_date.upcoming.fournisseur')
                ->whereJsonContains('data->facture_id', $facture->id)
                ->where('created_at', '>=', now()->subDays(1)) // Only check last 24 hours
                ->first();

            if (!$existingNotification) {
                $daysUntilDue = now()->diffInDays($facture->date_echeance, false);
                $notification = self::notify(
                    $userId,
                    'due_date.upcoming.fournisseur',
                    'Facture fournisseur à échéance proche',
                    "Facture {$facture->numero_facture} arrive à échéance dans {$daysUntilDue} jour(s)",
                    [
                        'type' => 'fournisseur',
                        'facture_id' => $facture->id,
                        'numero_facture' => $facture->numero_facture,
                        'date_echeance' => $facture->date_echeance,
                        'montant_restant' => $facture->reste_a_payer,
                        'days_until_due' => $daysUntilDue,
                        'icon' => '📅',
                        'color' => 'blue'
                    ]
                );
                $notifications[] = $notification;
            }
        }

        return $notifications;
    }
}


