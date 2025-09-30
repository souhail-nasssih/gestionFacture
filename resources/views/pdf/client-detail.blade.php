<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Détail Client - {{ $client->nom }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .client-info {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background-color: #e9ecef;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
        }
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            font-size: 10px;
            color: #6c757d;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #333;
        }
        .amount {
            text-align: right;
            font-weight: bold;
        }
        .status-paid {
            color: #28a745;
        }
        .status-unpaid {
            color: #dc3545;
        }
        .status-partial {
            color: #ffc107;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Détail Client - {{ $client->nom }}</h1>
        <p>Généré le {{ now()->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="client-info">
        <h2>Informations du Client</h2>
        <p><strong>Nom :</strong> {{ $client->nom }}</p>
        <p><strong>Téléphone :</strong> {{ $client->telephone }}</p>
        <p><strong>Email :</strong> {{ $client->email ?? 'Non renseigné' }}</p>
        <p><strong>Adresse :</strong> {{ $client->adresse ?? 'Non renseignée' }}</p>
        <p><strong>Délai de paiement :</strong> {{ $client->delai_paiement ?? 0 }} jours</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">{{ number_format($stats['montant_total_factures'], 2) }} €</div>
            <div class="stat-label">Montant Total Factures</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ number_format($stats['montant_total_paye'], 2) }} €</div>
            <div class="stat-label">Montant Total Payé</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ number_format($stats['reste_a_payer'], 2) }} €</div>
            <div class="stat-label">Reste à Payer</div>
        </div>
    </div>

    <div class="section-title">Factures ({{ $stats['nombre_factures'] }})</div>
    @if($client->factures->count() > 0)
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
            <tbody>
                @foreach($client->factures as $facture)
                <tr>
                    <td>{{ $facture->numero_facture }}</td>
                    <td>{{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($facture->date_echeance)->format('d/m/Y') }}</td>
                    <td class="status-{{ $facture->statut_paiement }}">
                        {{ ucfirst($facture->statut_paiement) }}
                    </td>
                    <td class="amount">{{ number_format($facture->montant_total, 2) }} €</td>
                    <td class="amount">{{ number_format($facture->montant_regle, 2) }} €</td>
                    <td class="amount">{{ number_format($facture->reste_a_payer, 2) }} €</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>Aucune facture trouvée pour ce client.</p>
    @endif

    <div class="section-title">Règlements ({{ $stats['nombre_reglements'] }})</div>
    @if($client->reglements->count() > 0)
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
            <tbody>
                @foreach($client->reglements as $reglement)
                <tr>
                    <td>{{ $reglement->numero_reglement ?? 'N/A' }}</td>
                    <td>{{ \Carbon\Carbon::parse($reglement->date_reglement)->format('d/m/Y') }}</td>
                    <td>{{ $reglement->type_reglement }}</td>
                    <td class="amount">{{ number_format($reglement->montant_paye, 2) }} €</td>
                    <td>{{ $reglement->description ?? 'N/A' }}</td>
                    <td>{{ $reglement->facture ? $reglement->facture->numero_facture : 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>Aucun règlement trouvé pour ce client.</p>
    @endif

    <div class="footer">
        <p>Document généré automatiquement par le système de gestion de factures</p>
    </div>
</body>
</html>
