<?php

namespace App\Notifications;

use App\Models\Produit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OutOfStockNotification extends Notification
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
                    ->subject('🚨 Rupture de Stock - ' . $this->produit->nom)
                    ->greeting('Alerte Urgente!')
                    ->line('Le produit "' . $this->produit->nom . '" est complètement en rupture de stock.')
                    ->line('Stock actuel: 0 ' . $this->produit->unite)
                    ->line('Référence: ' . $this->produit->reference)
                    ->action('Voir le produit', route('produits.show', $this->produit->id))
                    ->line('Action requise immédiatement!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'out_of_stock',
            'title' => 'Rupture de Stock',
            'message' => "Le produit \"{$this->produit->nom}\" est complètement en rupture de stock.",
            'produit_id' => $this->produit->id,
            'produit_nom' => $this->produit->nom,
            'produit_reference' => $this->produit->reference,
            'stock_actuel' => 0,
            'action_url' => route('produits.show', $this->produit->id),
            'icon' => '🚨',
            'color' => 'danger',
        ];
    }
}
