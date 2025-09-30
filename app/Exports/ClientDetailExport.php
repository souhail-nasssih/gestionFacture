<?php

namespace App\Exports;

use App\Models\Client;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class ClientDetailExport implements WithMultipleSheets
{
    protected $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function sheets(): array
    {
        return [
            'Informations Client' => new ClientInfoSheet($this->client),
            'Factures' => new ClientFacturesSheet($this->client),
            'Règlements' => new ClientReglementsSheet($this->client),
        ];
    }
}

class ClientInfoSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function collection()
    {
        return collect([
            [
                'Nom' => $this->client->nom,
                'Téléphone' => $this->client->telephone,
                'Email' => $this->client->email,
                'Adresse' => $this->client->adresse,
                'Délai de paiement' => $this->client->delai_paiement . ' jours',
                'Montant total factures' => number_format($this->client->montant_total_factures, 2) . ' €',
                'Montant total payé' => number_format($this->client->montant_total_paye, 2) . ' €',
                'Reste à payer' => number_format($this->client->reste_a_payer, 2) . ' €',
            ]
        ]);
    }

    public function headings(): array
    {
        return [
            'Nom',
            'Téléphone',
            'Email',
            'Adresse',
            'Délai de paiement',
            'Montant total factures',
            'Montant total payé',
            'Reste à payer',
        ];
    }

    public function title(): string
    {
        return 'Informations Client';
    }
}

class ClientFacturesSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function collection()
    {
        return $this->client->factures;
    }

    public function map($facture): array
    {
        return [
            $facture->numero_facture,
            $facture->date_facture,
            $facture->date_echeance,
            $facture->statut_paiement,
            number_format($facture->montant_total, 2),
            number_format($facture->montant_regle, 2),
            number_format($facture->reste_a_payer, 2),
            $facture->statut_echeance,
        ];
    }

    public function headings(): array
    {
        return [
            'N° Facture',
            'Date Facture',
            'Date Échéance',
            'Statut Paiement',
            'Montant Total',
            'Montant Payé',
            'Reste à Payer',
            'Statut Échéance',
        ];
    }

    public function title(): string
    {
        return 'Factures';
    }
}

class ClientReglementsSheet implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function collection()
    {
        return $this->client->reglements;
    }

    public function map($reglement): array
    {
        return [
            $reglement->numero_reglement,
            $reglement->date_reglement,
            $reglement->type_reglement,
            number_format($reglement->montant_paye, 2),
            $reglement->description,
            $reglement->facture ? $reglement->facture->numero_facture : 'N/A',
        ];
    }

    public function headings(): array
    {
        return [
            'N° Règlement',
            'Date Règlement',
            'Type Règlement',
            'Montant Payé',
            'Description',
            'Facture Associée',
        ];
    }

    public function title(): string
    {
        return 'Règlements';
    }
}
