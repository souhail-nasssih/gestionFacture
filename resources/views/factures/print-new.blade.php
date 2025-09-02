<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture {{ $facture->numero_facture }} - {{ $facture->fournisseur->nom }}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 11px;
            line-height: 1.3;
            background: white;
        }

        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2c3e50;
        }

        .company-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
        }

        .logo-icon {
            font-size: 24px;
            margin-right: 10px;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .company-subtitle {
            font-size: 12px;
            color: #555;
            margin-bottom: 8px;
        }

        .invoice-info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }

        .invoice-details {
            flex: 1;
        }

        .invoice-details h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 14px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }

        .invoice-details div {
            margin-bottom: 6px;
            font-size: 11px;
        }

        .invoice-details strong {
            color: #2c3e50;
            min-width: 100px;
            display: inline-block;
        }

        .supplier-info {
            flex: 1;
            margin-left: 20px;
        }

        .supplier-info h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 14px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }

        .supplier-info div {
            margin-bottom: 6px;
            font-size: 11px;
        }

        .supplier-info strong {
            color: #2c3e50;
            min-width: 80px;
            display: inline-block;
        }

        .payment-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 10px;
        }

        .payment-info strong {
            color: #856404;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            font-size: 10px;
        }

        .items-table th {
            background: #2c3e50;
            color: white;
            padding: 8px 6px;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
            border: 1px solid #ddd;
        }

        .items-table td {
            padding: 6px 4px;
            border: 1px solid #ddd;
            font-size: 9px;
            text-align: center;
        }

        .items-table td:nth-child(3) {
            text-align: left;
        }

        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .totals-section {
            margin-left: auto;
            width: 280px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }

        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 3px 0;
            font-size: 11px;
        }

        .total-line.grand-total {
            border-top: 2px solid #2c3e50;
            padding-top: 10px;
            margin-top: 10px;
            font-weight: bold;
            font-size: 12px;
            color: #2c3e50;
        }

        .amount-in-words {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #2c3e50;
            font-size: 11px;
        }

        .amount-in-words strong {
            color: #2c3e50;
            font-size: 11px;
        }

        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }

        .print-button:hover {
            background: #2980b9;
        }

        @media print {
            .print-button {
                display: none;
            }

            body {
                font-size: 9px;
            }

            .invoice-container {
                max-width: none;
                margin: 0;
                padding: 10px;
            }

            .items-table th,
            .items-table td {
                padding: 4px 3px;
                font-size: 8px;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">
        🖨️ Imprimer
    </button>

    <div class="invoice-container">
        <!-- En-tête de l'entreprise -->
        <div class="header">
            <div class="company-logo">
                <div class="logo-icon">⚙️🚛</div>
                <div>
                    <div class="company-name">FINDUCARR</div>
                    <div class="company-subtitle">FOURNITURE INDUSTRIELLE ET CARROSSERIES</div>
                </div>
            </div>
        </div>

        <!-- Informations de facture et fournisseur -->
        <div class="invoice-info-section">
            <div class="invoice-details">
                <h3>INFORMATIONS DE FACTURE</h3>
                <div><strong>Facture N°:</strong> {{ $facture->numero_facture }}</div>
                <div><strong>Etablie le:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/y') }}</div>
                <div><strong>Échéance le:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->addDays(60)->format('d/m/y') }}</div>
            </div>

            <div class="supplier-info">
                <h3>DESTINATAIRE</h3>
                <div><strong>Société:</strong> {{ $facture->fournisseur->nom }}</div>
                <div><strong>Adresse:</strong> {{ $facture->fournisseur->adresse }}</div>
                @if($facture->fournisseur->ice)
                    <div><strong>ICE:</strong> {{ $facture->fournisseur->ice }}</div>
                @endif
                @if($facture->fournisseur->email)
                    <div><strong>E-mail:</strong> {{ $facture->fournisseur->email }}</div>
                @endif
            </div>
        </div>

        <!-- Informations de paiement -->
        <div class="payment-info">
            <div><strong>Date du Facture:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/y') }}</div>
            <div><strong>Échéance du Facture:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->addDays(60)->format('d/m/y') }}</div>
            <div><strong>Modalités de Paiement:</strong> Chéque ou Espéce</div>
            <div><strong>Date effet</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/y') }} <strong>payable au plus tard le</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->addDays(60)->format('d/m/y') }}</div>
            <div style="margin-top: 5px;"><strong>sous peine de pénalité selon la loi 69-22</strong></div>
        </div>

        <!-- Tableau des articles -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 12%;">Réf BC</th>
                    <th style="width: 12%;">N° BL</th>
                    <th style="width: 35%;">Description</th>
                    <th style="width: 8%;">Qté</th>
                    <th style="width: 12%;">Prix unitaire</th>
                    <th style="width: 10%;">Remise</th>
                    <th style="width: 11%;">Total HT</th>
                    <th style="width: 11%;">Total TTC</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totalHT = 0;
                    $totalTVA = 0;
                    $totalTTC = 0;
                    $itemCount = 0;
                @endphp

                @foreach($facture->bonsLivraison as $bl)
                    @foreach($bl->details as $detail)
                        @php
                            $montantHT = $detail->quantite * $detail->prix_unitaire;
                            $tva = $montantHT * 0.2; // TVA 20%
                            $montantTTC = $montantHT + $tva;

                            $totalHT += $montantHT;
                            $totalTVA += $tva;
                            $totalTTC += $montantTTC;
                            $itemCount++;
                        @endphp
                        <tr>
                            <td>{{ $detail->produit->reference ?? 'N/A' }}</td>
                            <td>{{ $bl->numero_bl ?? 'N/A' }}</td>
                            <td class="text-left">{{ $detail->produit->designation ?? $detail->description ?? 'Produit non spécifié' }}</td>
                            <td>{{ number_format($detail->quantite, 0, ',', ' ') }}</td>
                            <td>{{ number_format($detail->prix_unitaire, 2, ',', ' ') }} DH</td>
                            <td>0,00%</td>
                            <td>{{ number_format($montantHT, 2, ',', ' ') }} DH</td>
                            <td>{{ number_format($montantTTC, 2, ',', ' ') }} DH</td>
                        </tr>
                    @endforeach
                @endforeach

                @if($itemCount === 0)
                    <tr>
                        <td colspan="8" class="text-center" style="padding: 15px; color: #7f8c8d;">
                            Aucun article trouvé pour cette facture
                        </td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Totaux -->
        <div class="totals-section">
            <div class="total-line">
                <span>Total Facture HT:</span>
                <span>{{ number_format($totalHT, 2, ',', ' ') }} DH</span>
            </div>
            <div class="total-line">
                <span>TVA:</span>
                <span>20% (Taxe: {{ number_format($totalTVA, 2, ',', ' ') }} DH)</span>
            </div>
            <div class="total-line grand-total">
                <span>TOTAL TTC:</span>
                <span>{{ number_format($totalTTC, 2, ',', ' ') }} DH</span>
            </div>
        </div>

        <!-- Montant en lettres -->
        <div class="amount-in-words">
            <strong>Arrêtée la présente à la somme de:</strong><br>
            <span style="font-style: italic; color: #2c3e50;">
                {{ ucfirst(\App\Helpers\NumberToWords::french($totalTTC)) }}
            </span>
        </div>
    </div>

    <script>
        // Auto-print après 1 seconde si on est sur la page d'impression
        if (window.location.search.includes('autoprint=1')) {
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    </script>
</body>
</html>
