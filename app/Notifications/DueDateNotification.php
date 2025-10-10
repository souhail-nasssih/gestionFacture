<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DueDateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $facture;
    protected $type;
    protected $daysOverdue;

    public function __construct($facture, $type = 'client', $daysOverdue = 0)
    {
        $this->facture = $facture;
        $this->type = $type;
        $this->daysOverdue = $daysOverdue;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        $numeroFacture = $this->facture->numero_facture ?? 'N/A';
        $montantRestant = $this->facture->reste_a_payer ?? 0;
        $dateEcheance = $this->facture->date_echeance ?? 'N/A';

        $title = $this->type === 'client'
            ? 'Facture client échue'
            : 'Facture fournisseur échue';

        $message = $this->daysOverdue > 0
            ? "La facture {$numeroFacture} est en retard de {$this->daysOverdue} jour(s). Montant restant: " . number_format($montantRestant, 2) . " DHS"
            : "La facture {$numeroFacture} arrive à échéance aujourd'hui. Montant restant: " . number_format($montantRestant, 2) . " DHS";

        return [
            'type' => 'due_date',
            'facture_type' => $this->type,
            'facture_id' => $this->facture->id,
            'numero_facture' => $numeroFacture,
            'date_echeance' => $dateEcheance,
            'montant_restant' => $montantRestant,
            'days_overdue' => $this->daysOverdue,
            'title' => $title,
            'message' => $message,
            'icon' => $this->daysOverdue > 0 ? '🚨' : '⚠️',
            'color' => $this->daysOverdue > 0 ? 'red' : 'orange',
        ];
    }

    public function toMail($notifiable)
    {
        $numeroFacture = $this->facture->numero_facture ?? 'N/A';
        $montantRestant = $this->facture->reste_a_payer ?? 0;

        return (new MailMessage)
            ->subject($this->type === 'client' ? 'Facture client échue' : 'Facture fournisseur échue')
            ->line("La facture {$numeroFacture} est échue.")
            ->line("Montant restant à payer: " . number_format($montantRestant, 2) . " DHS")
            ->line("Date d'échéance: " . ($this->facture->date_echeance ?? 'N/A'))
            ->action('Voir la facture', url('/factures/' . $this->facture->id));
    }
}
