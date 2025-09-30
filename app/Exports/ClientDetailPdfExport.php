<?php

namespace App\Exports;

use App\Models\Client;
use Carbon\Carbon;

class ClientDetailPdfExport
{
    protected $client;
    protected $stats;

    public function __construct(Client $client, array $stats)
    {
        $this->client = $client;
        $this->stats = $stats;
    }

    /**
     * Générer le contenu PDF professionnel
     */
    public function generate()
    {
        $html = $this->getPdfHeader();
        $html .= $this->getClientInfoSection();
        $html .= $this->getStatsSection();
        $html .= $this->getInvoicesSection();
        $html .= $this->getPaymentsSection();
        $html .= $this->getPdfFooter();

        return $html;
    }

    /**
     * En-tête PDF avec styles professionnels
     */
    private function getPdfHeader()
    {
        return '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Détail Client - ' . htmlspecialchars($this->client->nom) . '</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #2c3e50;
            background: white;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px 0;
            border-bottom: 3px solid #3498db;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header .subtitle {
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
        }

        .client-info {
            background: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .client-info h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 600;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
        }

        .client-details {
            display: table;
            width: 100%;
        }

        .client-details .detail-row {
            display: table-row;
            margin-bottom: 8px;
        }

        .client-details .label {
            display: table-cell;
            width: 30%;
            color: #495057;
            font-weight: 600;
            padding: 8px 0;
            vertical-align: top;
        }

        .client-details .value {
            display: table-cell;
            width: 70%;
            padding: 8px 0;
            vertical-align: top;
        }

        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-collapse: separate;
            border-spacing: 0;
        }

        .stat-card {
            display: table-cell;
            width: 33.33%;
            background: white;
            padding: 20px;
            text-align: center;
            border: 1px solid #dee2e6;
            vertical-align: top;
            position: relative;
        }

        .stat-card:nth-child(2) {
            border-left: none;
            border-right: none;
        }

        .stat-card:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }

        .stat-card:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
            font-family: "Courier New", monospace;
        }

        .stat-label {
            font-size: 11px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            margin: 30px 0 20px 0;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        th {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            font-size: 11px;
            vertical-align: middle;
        }

        tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        tr:hover {
            background-color: #e3f2fd;
        }

        .amount {
            text-align: right;
            font-weight: 600;
            font-family: "Courier New", monospace;
            color: #2c3e50;
        }

        .status-paid {
            color: #28a745;
            font-weight: 700;
            text-align: center;
            background: #d4edda;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            text-transform: uppercase;
        }

        .status-unpaid {
            color: #dc3545;
            font-weight: 700;
            text-align: center;
            background: #f8d7da;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            text-transform: uppercase;
        }

        .status-partial {
            color: #fd7e14;
            font-weight: 700;
            text-align: center;
            background: #fff3cd;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            text-transform: uppercase;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
        }

        .no-data {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
        }

        .page-break {
            page-break-before: always;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>';
    }

    /**
     * Section informations client
     */
    private function getClientInfoSection()
    {
        return '
    <div class="header">
        <h1>Détail Client - ' . htmlspecialchars($this->client->nom) . '</h1>
        <p class="subtitle">Généré le ' . now()->format('d/m/Y à H:i') . '</p>
    </div>

    <div class="client-info">
        <h2>📋 Informations du Client</h2>
        <div class="client-details">
            <div class="detail-row">
                <div class="label">Nom :</div>
                <div class="value">' . htmlspecialchars($this->client->nom) . '</div>
            </div>
            <div class="detail-row">
                <div class="label">Téléphone :</div>
                <div class="value">' . htmlspecialchars($this->client->telephone) . '</div>
            </div>
            <div class="detail-row">
                <div class="label">Email :</div>
                <div class="value">' . htmlspecialchars($this->client->email ?? 'Non renseigné') . '</div>
            </div>
            <div class="detail-row">
                <div class="label">Adresse :</div>
                <div class="value">' . htmlspecialchars($this->client->adresse ?? 'Non renseignée') . '</div>
            </div>
            <div class="detail-row">
                <div class="label">Délai de paiement :</div>
                <div class="value">' . ($this->client->delai_paiement ?? 0) . ' jours</div>
            </div>
        </div>
    </div>';
    }

    /**
     * Section statistiques financières
     */
    private function getStatsSection()
    {
        return '
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">' . number_format($this->stats['montant_total_factures'], 2) . ' €</div>
            <div class="stat-label">Montant Total Factures</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">' . number_format($this->stats['montant_total_paye'], 2) . ' €</div>
            <div class="stat-label">Montant Total Payé</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">' . number_format($this->stats['reste_a_payer'], 2) . ' €</div>
            <div class="stat-label">Reste à Payer</div>
        </div>
    </div>';
    }

    /**
     * Section factures
     */
    private function getInvoicesSection()
    {
        $html = '
    <div class="section-title">📄 Situation des Factures (' . $this->stats['nombre_factures'] . ')</div>';

        if ($this->client->factures->count() > 0) {
            $html .= '
    <table>
        <thead>
            <tr>
                <th>N° Facture</th>
                <th>Date Facture</th>
                <th>Date Échéance</th>
                <th>Statut</th>
                <th>Montant Total</th>
                <th>Montant Payé</th>
                <th>Reste à Payer</th>
            </tr>
        </thead>
        <tbody>';

            foreach ($this->client->factures as $facture) {
                $statusClass = $this->getStatusClass($facture->statut_paiement);
                $html .= '
            <tr>
                <td><strong>' . htmlspecialchars($facture->numero_facture) . '</strong></td>
                <td>' . Carbon::parse($facture->date_facture)->format('d/m/Y') . '</td>
                <td>' . Carbon::parse($facture->date_echeance)->format('d/m/Y') . '</td>
                <td><span class="' . $statusClass . '">' . ucfirst($facture->statut_paiement) . '</span></td>
                <td class="amount">' . number_format($facture->montant_total, 2) . ' €</td>
                <td class="amount">' . number_format($facture->montant_regle, 2) . ' €</td>
                <td class="amount">' . number_format($facture->reste_a_payer, 2) . ' €</td>
            </tr>';
            }
            $html .= '
        </tbody>
    </table>';
        } else {
            $html .= '
    <div class="no-data">
        <p>Aucune facture trouvée pour ce client.</p>
    </div>';
        }

        return $html;
    }

    /**
     * Section règlements
     */
    private function getPaymentsSection()
    {
        $html = '
    <div class="section-title">💰 Historique des Règlements (' . $this->stats['nombre_reglements'] . ')</div>';

        if ($this->client->reglements->count() > 0) {
            $html .= '
    <table>
        <thead>
            <tr>
                <th>N° Règlement</th>
                <th>Date Règlement</th>
                <th>Type Règlement</th>
                <th>Montant Payé</th>
                <th>Description</th>
                <th>Facture Associée</th>
            </tr>
        </thead>
        <tbody>';

            foreach ($this->client->reglements as $reglement) {
                $html .= '
            <tr>
                <td><strong>' . htmlspecialchars($reglement->numero_reglement ?? 'N/A') . '</strong></td>
                <td>' . Carbon::parse($reglement->date_reglement)->format('d/m/Y') . '</td>
                <td>' . htmlspecialchars($reglement->type_reglement) . '</td>
                <td class="amount">' . number_format($reglement->montant_paye, 2) . ' €</td>
                <td>' . htmlspecialchars($reglement->description ?? 'N/A') . '</td>
                <td>' . htmlspecialchars($reglement->facture ? $reglement->facture->numero_facture : 'N/A') . '</td>
            </tr>';
            }
            $html .= '
        </tbody>
    </table>';
        } else {
            $html .= '
    <div class="no-data">
        <p>Aucun règlement trouvé pour ce client.</p>
    </div>';
        }

        return $html;
    }

    /**
     * Pied de page PDF
     */
    private function getPdfFooter()
    {
        return '
    <div class="footer">
        <p><strong>Document généré automatiquement par le système de gestion de factures</strong></p>
        <p>Page générée le ' . now()->format('d/m/Y à H:i') . '</p>
    </div>
</body>
</html>';
    }

    /**
     * Obtenir la classe CSS selon le statut
     */
    private function getStatusClass($status)
    {
        switch ($status) {
            case 'payee':
                return 'status-paid';
            case 'impayee':
                return 'status-unpaid';
            default:
                return 'status-partial';
        }
    }
}
