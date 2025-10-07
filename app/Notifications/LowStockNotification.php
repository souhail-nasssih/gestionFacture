<?php

namespace App\Notifications;

use App\Models\Produit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    use Queueable;

    protected $produit;

    /**
     * Create a new notification instance.
     */
    public function __construct(Produit $produit)
    {
        $this->produit = $produit;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('⚠️ Alerte Stock Bas - ' . $this->produit->nom)
                    ->greeting('Bonjour!')
                    ->line('Le produit "' . $this->produit->nom . '" est en rupture de stock.')
                    ->line('Stock actuel: ' . $this->produit->stock . ' ' . $this->produit->unite)
                    ->line('Seuil d\'alerte: ' . $this->produit->seuil_alerte . ' ' . $this->produit->unite)
                    ->action('Voir le produit', route('produits.show', $this->produit->id))
                    ->line('Merci d\'utiliser notre application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'low_stock',
            'title' => 'Stock Bas',
            'message' => "Le produit \"{$this->produit->nom}\" est en rupture de stock.",
            'produit_id' => $this->produit->id,
            'produit_nom' => $this->produit->nom,
            'produit_reference' => $this->produit->reference,
            'stock_actuel' => $this->produit->stock,
            'seuil_alerte' => $this->produit->seuil_alerte,
            'unite' => $this->produit->unite,
            'action_url' => route('produits.show', $this->produit->id),
            'icon' => '⚠️',
            'color' => 'warning',
        ];
    }
}
