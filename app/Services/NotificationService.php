<?php

namespace App\Services;

use App\Events\LowStockAlert;
use App\Models\AppNotification;
use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use App\Models\Produit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Envoie une notification à tous les utilisateurs.
     */
    public function notifyAll(string $type, string $title, string $message, array $data = []): void
    {
        $users = User::query()->get();

        foreach ($users as $user) {
            AppNotification::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
            ]);
        }
    }

    public function notifyLowStock(Produit $produit): void
    {
        $message = "Stock bas pour « {$produit->nom} » : {$produit->stock} (seuil : {$produit->seuil_alerte}).";

        $this->notifyAll('low_stock', 'Stock bas', $message, [
            'produit_id' => $produit->id,
            'produit_nom' => $produit->nom,
            'stock' => $produit->stock,
            'seuil_alerte' => $produit->seuil_alerte,
            'action_url' => route('produits.historique', $produit->id),
        ]);

        LowStockAlert::dispatch($produit->fresh());
    }

    public function notifyOutOfStock(Produit $produit): void
    {
        $message = "Rupture de stock : « {$produit->nom} » (réf. {$produit->reference}).";

        $this->notifyAll('out_of_stock', 'Rupture de stock', $message, [
            'produit_id' => $produit->id,
            'produit_nom' => $produit->nom,
            'action_url' => route('produits.historique', $produit->id),
        ]);
    }

    /**
     * Synchronise les alertes stock pour les produits déjà en seuil (sans attendre un mouvement).
     */
    public function syncStockAlerts(): int
    {
        $count = 0;

        $lowStock = Produit::query()
            ->where('stock', '>', 0)
            ->where('seuil_alerte', '>', 0)
            ->whereColumn('stock', '<=', 'seuil_alerte')
            ->get();

        foreach ($lowStock as $produit) {
            if ($this->stockNotificationExistsToday($produit->id, 'low_stock')) {
                continue;
            }
            $this->notifyLowStock($produit);
            $count++;
        }

        $outOfStock = Produit::query()->where('stock', 0)->get();

        foreach ($outOfStock as $produit) {
            if ($this->stockNotificationExistsToday($produit->id, 'out_of_stock')) {
                continue;
            }
            $this->notifyOutOfStock($produit);
            $count++;
        }

        return $count;
    }

    /**
     * Vérifie échéances (même logique que l'échéancier) + synchronise le stock.
     */
    public function checkDueDates(): int
    {
        $count = $this->syncStockAlerts();
        $count += $this->syncDueDateAlerts();

        return $count;
    }

    protected function syncDueDateAlerts(): int
    {
        $count = 0;
        $today = now()->toDateString();
        $inThreeDays = now()->addDays(3)->toDateString();

        foreach (FactureClient::with(['client', 'reglements'])->get() as $facture) {
            if (! $this->factureHasBalanceDue($facture)) {
                continue;
            }

            $dateEcheance = $this->computeClientDueDate($facture);
            if (! $dateEcheance || $dateEcheance > $inThreeDays) {
                continue;
            }

            $isOverdue = $dateEcheance < $today;
            $type = $isOverdue ? 'due_date_overdue' : 'due_date_soon';
            $title = $isOverdue ? 'Échéance dépassée' : 'Échéance proche';
            $message = "Facture client #{$facture->numero_facture} — échéance {$dateEcheance}.";

            if ($this->notificationExistsToday($type, 'facture_client', $facture->id)) {
                continue;
            }

            $this->notifyAll($type, $title, $message, [
                'facture_type' => 'client',
                'facture_id' => $facture->id,
                'date_echeance' => $dateEcheance,
                'action_url' => route('echeancier.index'),
            ]);
            $count++;
        }

        foreach (FactureFournisseur::with(['fournisseur', 'reglements'])->get() as $facture) {
            if (! $this->factureHasBalanceDue($facture)) {
                continue;
            }

            $dateEcheance = $this->computeFournisseurDueDate($facture);
            if (! $dateEcheance || $dateEcheance > $inThreeDays) {
                continue;
            }

            $isOverdue = $dateEcheance < $today;
            $type = $isOverdue ? 'due_date_overdue' : 'due_date_soon';
            $title = $isOverdue ? 'Échéance dépassée' : 'Échéance proche';
            $message = "Facture fournisseur #{$facture->numero_facture} — échéance {$dateEcheance}.";

            if ($this->notificationExistsToday($type, 'facture_fournisseur', $facture->id)) {
                continue;
            }

            $this->notifyAll($type, $title, $message, [
                'facture_type' => 'fournisseur',
                'facture_id' => $facture->id,
                'date_echeance' => $dateEcheance,
                'action_url' => route('echeancier.index'),
            ]);
            $count++;
        }

        return $count;
    }

    protected function factureHasBalanceDue(FactureClient|FactureFournisseur $facture): bool
    {
        if ($facture->statut_paiement === 'payee') {
            return false;
        }

        $montantRegle = $facture->relationLoaded('reglements')
            ? (float) $facture->reglements->sum('montant_paye')
            : (float) $facture->reglements()->sum('montant_paye');

        return max(0, (float) $facture->montant_total - $montantRegle) > 0;
    }

    protected function computeClientDueDate(FactureClient $facture): ?string
    {
        if ($facture->date_echeance) {
            return Carbon::parse($facture->date_echeance)->toDateString();
        }

        if (! $facture->date_facture) {
            return null;
        }

        $delai = (int) ($facture->client->delai_paiement ?? 0);

        return Carbon::parse($facture->date_facture)->addDays($delai)->toDateString();
    }

    protected function computeFournisseurDueDate(FactureFournisseur $facture): ?string
    {
        if ($facture->date_echeance) {
            return Carbon::parse($facture->date_echeance)->toDateString();
        }

        if (! $facture->date_facture) {
            return null;
        }

        $delai = (int) ($facture->fournisseur->delai_paiement ?? 0);

        return Carbon::parse($facture->date_facture)->addDays($delai)->toDateString();
    }

    protected function notificationExistsToday(string $type, string $factureType, int $factureId): bool
    {
        return AppNotification::query()
            ->where('type', $type)
            ->whereDate('created_at', today())
            ->where('data->facture_type', $factureType)
            ->where('data->facture_id', $factureId)
            ->exists();
    }

    protected function stockNotificationExistsToday(int $produitId, string $type): bool
    {
        return AppNotification::query()
            ->where('type', $type)
            ->whereDate('created_at', today())
            ->where('data->produit_id', $produitId)
            ->exists();
    }

    public function listForUser(User $user, int $limit = 30): Collection
    {
        return AppNotification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function unreadCount(User $user): int
    {
        return AppNotification::query()
            ->where('user_id', $user->id)
            ->unread()
            ->count();
    }

    public function markAsRead(User $user, int $id): bool
    {
        $notification = AppNotification::query()
            ->where('user_id', $user->id)
            ->whereKey($id)
            ->first();

        if (! $notification) {
            return false;
        }

        $notification->update(['read_at' => now()]);

        return true;
    }

    public function markAllAsRead(User $user): int
    {
        return AppNotification::query()
            ->where('user_id', $user->id)
            ->unread()
            ->update(['read_at' => now()]);
    }
}
