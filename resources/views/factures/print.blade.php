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
            font-size: 12px;
            line-height: 1.4;
        }

        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
        }

        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .company-subtitle {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 10px;
        }

        .company-details {
            font-size: 11px;
            color: #555;
        }

        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }

        .invoice-details {
            flex: 1;
        }

        .invoice-details h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 16px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }

        .invoice-details div {
            margin-bottom: 8px;
        }

        .invoice-details strong {
            color: #2c3e50;
            min-width: 120px;
            display: inline-block;
        }

        .supplier-info {
            flex: 1;
            margin-left: 30px;
        }

        .supplier-info h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 16px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }

        .supplier-info div {
            margin-bottom: 8px;
        }

        .supplier-info strong {
            color: #2c3e50;
            min-width: 100px;
            display: inline-block;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #ddd;
        }

        .items-table th {
            background: #2c3e50;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }

        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .items-table tr:hover {
            background: #e9ecef;
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
            width: 300px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }

        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }

        .total-line.grand-total {
            border-top: 2px solid #2c3e50;
            padding-top: 15px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 14px;
            color: #2c3e50;
        }

        .amount-in-words {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #2c3e50;
        }

        .amount-in-words strong {
            color: #2c3e50;
            font-size: 13px;
        }

        .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }

        .signature-box {
            width: 200px;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #333;
            width: 100%;
            height: 40px;
            margin-top: 10px;
        }

        .signature-label {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #7f8c8d;
            border-top: 1px solid #eee;
            padding-top: 20px;
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
                font-size: 10px;
            }

            .invoice-container {
                max-width: none;
                margin: 0;
            }

            .items-table th,
            .items-table td {
                padding: 8px 6px;
                font-size: 10px;
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
            <div class="company-name">FINDUCARR</div>
            <div class="company-subtitle">FOURNITURE INDUSTRIELLE ET CARROSSERIES</div>
            <div class="company-details">
                123 Rue de l'Industrie, 20000 Casablanca, Maroc<br>
                Tél: +212 5 22 12 34 56 | Email: contact@finducarr.ma<br>
                ICE: 123456789 | RC: 12345 | CNSS: 123456789
            </div>
        </div>

        <!-- Informations de facture et fournisseur -->
        <div class="invoice-info">
            <div class="invoice-details">
                <h3>INFORMATIONS DE FACTURE</h3>
                <div><strong>N° Facture:</strong> {{ $facture->numero_facture }}</div>
                <div><strong>Date Facture:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') }}</div>
                <div><strong>Date Échéance:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->addDays(30)->format('d/m/Y') }}</div>
                <div><strong>Mode Paiement:</strong> Chèque ou Espèces</div>
                <div><strong>Statut:</strong>
                    <span style="color: {{ $facture->statut_paiement === 'paye' ? '#27ae60' : ($facture->statut_paiement === 'en_attente' ? '#f39c12' : '#e74c3c') }};">
                        {{ ucfirst(str_replace('_', ' ', $facture->statut_paiement)) }}
                    </span>
                </div>
            </div>

            <div class="supplier-info">
                <h3>FOURNISSEUR</h3>
                <div><strong>Société:</strong> {{ $facture->fournisseur->nom }}</div>
                <div><strong>Adresse:</strong> {{ $facture->fournisseur->adresse }}</div>
                <div><strong>Téléphone:</strong> {{ $facture->fournisseur->telephone }}</div>
                <div><strong>Email:</strong> {{ $facture->fournisseur->email }}</div>
                @if($facture->fournisseur->ice)
                    <div><strong>ICE:</strong> {{ $facture->fournisseur->ice }}</div>
                @endif
                @if($facture->fournisseur->rc)
                    <div><strong>RC:</strong> {{ $facture->fournisseur->rc }}</div>
                @endif
            </div>
        </div>

        <!-- Tableau des articles -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Référence</th>
                    <th style="width: 35%;">Description</th>
                    <th style="width: 10%;" class="text-center">Quantité</th>
                    <th style="width: 12%;" class="text-right">Prix Unitaire</th>
                    <th style="width: 12%;" class="text-right">Montant HT</th>
                    <th style="width: 8%;" class="text-center">TVA</th>
                    <th style="width: 8%;" class="text-right">Montant TTC</th>
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
                            <td>{{ $detail->produit->designation ?? $detail->description ?? 'Produit non spécifié' }}</td>
                            <td class="text-center">{{ number_format($detail->quantite, 0, ',', ' ') }}</td>
                            <td class="text-right">{{ number_format($detail->prix_unitaire, 2, ',', ' ') }} DH</td>
                            <td class="text-right">{{ number_format($montantHT, 2, ',', ' ') }} DH</td>
                            <td class="text-center">20%</td>
                            <td class="text-right">{{ number_format($montantTTC, 2, ',', ' ') }} DH</td>
                        </tr>
                    @endforeach
                @endforeach

                @if($itemCount === 0)
                    <tr>
                        <td colspan="7" class="text-center" style="padding: 20px; color: #7f8c8d;">
                            Aucun article trouvé pour cette facture
                        </td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Totaux -->
        <div class="totals-section">
            <div class="total-line">
                <span>Total HT:</span>
                <span>{{ number_format($totalHT, 2, ',', ' ') }} DH</span>
            </div>
            <div class="total-line">
                <span>TVA (20%):</span>
                <span>{{ number_format($totalTVA, 2, ',', ' ') }} DH</span>
            </div>
            <div class="total-line grand-total">
                <span>Total TTC:</span>
                <span>{{ number_format($totalTTC, 2, ',', ' ') }} DH</span>
            </div>
        </div>

        <!-- Montant en lettres -->
        <div class="amount-in-words">
            <strong>Arrêtée la présente facture à la somme de :</strong><br>
            <span style="font-style: italic; color: #2c3e50;">
                {{ ucfirst(\App\Helpers\NumberToWords::french($totalTTC)) }} DIRHAMS
            </span>
        </div>


        <!-- Pied de page -->
        <div class="footer">
            <p>FINDUCARR - Fourniture Industrielle et Carrosseries</p>
            <p>Merci de votre confiance | Pour toute question, contactez-nous au +212 5 22 12 34 56</p>
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
