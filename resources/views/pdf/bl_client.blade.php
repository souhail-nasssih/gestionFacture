<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bon de Livraison - {{ $blClient->numero_bl }}</title>
    <style>
        @page {
            margin: 15mm;
            size: A4;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }

        .company-info {
            flex: 1;
        }

        .company-logo {
            max-height: 60px;
            margin-bottom: 10px;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }

        .company-description {
            font-size: 11px;
            color: #666;
        }

        .document-info {
            text-align: right;
            flex: 1;
        }

        .document-title {
            font-size: 20px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 10px;
        }

        .document-number {
            font-size: 14px;
            font-weight: bold;
        }

        .content {
            margin-bottom: 20px;
        }

        .document-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .left-details {
            flex: 1;
        }

        .right-details {
            flex: 1;
            text-align: right;
        }

        .detail-row {
            margin-bottom: 8px;
        }

        .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }

        .client-info {
            margin-top: 15px;
        }

        .client-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 1px solid #ddd;
        }

        .products-table th {
            background-color: #333;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        .products-table td {
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 11px;
        }

        .products-table .text-right {
            text-align: right;
        }

        .products-table .text-center {
            text-align: center;
        }

        .total-section {
            margin-top: 20px;
            text-align: right;
        }

        .total-amount {
            font-size: 14px;
            font-weight: bold;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
        }

        .footer-info {
            margin-bottom: 5px;
        }

        .grid-lines {
            background-image:
                linear-gradient(to right, #f0f0f0 1px, transparent 1px),
                linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
            background-size: 20px 20px;
            background-position: 0 0, 0 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <img src="{{ public_path('logo.jpg') }}" alt="Logo" class="company-logo">
            {{-- <div class="company-name">FINDUCARR</div> --}}
            <div class="company-description">FOURNITURE INDUSTRIELLE ET CARROSSERIES</div>
        </div>
        <div class="document-info">
            <div class="document-title">BON DE LIVRAISON</div>
            <div class="document-number">N° {{ $blClient->numero_bl }}</div>
        </div>
    </div>

    <div class="content">
        <div class="document-details">
            <div class="left-details">
                <div class="detail-row">
                    <span class="detail-label">Date du Bon de Livraison:</span>
                    {{ $blClient->date_bl->format('d/m/Y') }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Référence du Bon de Livraison:</span>
                    {{ $blClient->numero_bl }}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Référence du Offre de Prix:</span>
                    {{ $blClient->notes ?? '' }}
                </div>
            </div>
            <div class="left-details">
                <div class="client-info">
                    <div style="font-weight: bold; margin-bottom: 10px;">Destinataire:</div>
                    <div class="client-name">{{ $blClient->client->nom }}</div>
                    <div>{{ $blClient->client->adresse }}</div>
                    <div>Tel: {{ $blClient->client->telephone ?? '' }}</div>
                    <div>Email: {{ $blClient->client->email ?? '' }}</div>
                </div>
            </div>
        </div>

        <table class="products-table">
            <thead>
                <tr>
                    <th style="width: 10%;">Réf</th>
                    <th style="width: 50%;">Désignation</th>
                    <th style="width: 15%;" class="text-center">Quantités</th>
                    <th style="width: 12%;" class="text-right">Prix Un HT</th>
                    <th style="width: 13%;" class="text-right">Total HT</th>
                </tr>
            </thead>
            <tbody>
                @foreach($blClient->details as $detail)
                <tr>
                    <td class="text-center">{{ $detail->produit->reference ?? '' }}</td>
                    <td>{{ $detail->produit->nom }}</td>
                    <td class="text-center">{{ number_format($detail->quantite, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($detail->prix_unitaire, 2, ',', ' ') }} DH</td>
                    <td class="text-right">{{ number_format($detail->montant, 2, ',', ' ') }} DH</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-amount">
                Total HT: {{ number_format($blClient->total, 2, ',', ' ') }} DH
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="footer-info">
            SARL au capital: 100000,00 - Siège social: 77 Rue Mohamed Smiha 10 Etg Appt N°57 Casablanca RC: 34329
        </div>
        <div class="footer-info">
            PATENTE: - IF: 68363934 - ICE: 003789368000045 - Email: finducarr@gmail.com Tél: 0708-330546
        </div>
    </div>
</body>
</html>
