<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Bon de Livraison - {{ $blClient->numero_bl }}</title>
    <style>
        @page {
            margin: 15mm;
            size: A4;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #000;
            margin: 0;
            padding: 10px;
        }

        /* TOP area uses a table to ensure perfect left/right alignment in all renderers */
        .top-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .top-table td {
            vertical-align: middle;
            padding: 6px;
        }

        .top-left {
            width: 50%;
        }

        .top-right {
            width: 50%;
            text-align: right;
        }

        .logo {
            display: inline-block;
        }

        .logo img {
            width: 250px;
            height: 100px;
            display: block;
        }

        .doc-title {
            font-size: 18px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 6px;
            margin-right: 100px;
        }

        .doc-number {
            font-size: 16px;
            font-weight: bold;
            margin-right: 100px;
        }

        .info-block {
            font-size: 11px;
            line-height: 1.4;
        }

        .info-block div {
            margin-bottom: 4px;
        }

        .destinataire {
            text-align: left;
            margin-left: 100px;
        }

        /* right cell content aligned left for multi-line data */
        .destinataire .label {
            display: inline-block;
            width: 50px;
            font-weight: bold;
        }

        /* adjust width if needed */

        /* Products table */
        table.products {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 10px;
        }

        table.products th,
        table.products td {
            border: 1px solid #000;
            padding: 6px 5px;
        }

        table.products th {
            background: #2B4C7E;
            color: #fff;
            font-weight: bold;
            text-align: center;
        }

        .text-left {
            text-align: left;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        /* Empty filler rows */
        .empty-row td {
            height: 20px;
        }

        /* Total and footer */
        .total {
            text-align: right;
            font-weight: bold;
            margin-top: 10px;
            font-size: 13px;
        }

        .footer {
            margin-top: 24px;
            font-size: 9px;
            text-align: center;
            color: #333;
            line-height: 1.4;
        }

        @media print {
            body {
                font-size: 11px;
            }

            .logo img {
                max-width: 140px;
            }
        }
    </style>
</head>

<body>

    <!-- TOP SECTION: use table to force two columns and two rows -->
    <table class="top-table">
        <tr>
            <!-- TOP LEFT: logo (same level as top-right title) -->
            <td class="top-left">
                <div class="logo">
                    <img src="{{ public_path('logo.jpg') }}" alt="Logo">
                </div>
            </td>

            <!-- TOP RIGHT: title + number (same level as logo) -->
            <td class="top-right">
                <div class="doc-title">BON DE LIVRAISON</div>
                <div class="doc-number">N° {{ $blClient->numero_bl }}</div>
            </td>
        </tr>

        <tr>
            <!-- BOTTOM LEFT: Date / Référence Offre (under the logo) -->
            <td class="top-left">
                <div class="info-block">
                    <div><strong>Date du Bon de Livraison:</strong> {{ $blClient->date_bl->format('d/m/Y') }}</div>
                    <div><strong>Référence du Bon de Livraison:</strong> {{ $blClient->numero_bl }}</div>
                    <div><strong>Référence de l’Offre de Prix:</strong> {{ $blClient->notes ?? '' }}</div>
                </div>
            </td>

            <!-- BOTTOM RIGHT: Déstinataire block (under the title/number) -->
            <td class="top-right">
                <div class="destinataire info-block" style="text-align:left;">
                    <div style="font-weight:bold; margin-bottom:6px;">Déstinataire:</div>
                    <div><span class="label">Société</span> <strong>{{ $blClient->client->nom }}</strong></div>

                    {{-- Preserve address line breaks if present --}}
                    <div><span class="label">Adresse</span>
                        {!! nl2br(e($blClient->client->adresse ?? '')) !!}
                    </div>

                    <div><span class="label">Tel</span> {{ $blClient->client->telephone ?? '' }}</div>
                    <div><span class="label">ICE</span> {{ $blClient->client->ice ?? '' }}</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- PRODUCTS TABLE -->
    <table class="products">
        <thead>
            <tr>
                <th style="width:12%;">Réf</th>
                <th style="width:50%;">Désignation</th>
                <th style="width:12%;">Quantités</th>
                <th style="width:13%;">Prix Un HT</th>
                <th style="width:13%;">Total HT</th>
            </tr>
        </thead>
        <tbody>
            @php $rows = 0; @endphp
            @foreach ($blClient->details as $detail)
                <tr>
                    <td class="text-center">{{ $detail->produit->reference ?? '' }}</td>
                    <td class="text-left">{{ $detail->produit->nom }}</td>
                    <td class="text-center">{{ number_format($detail->quantite, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($detail->prix_unitaire ?? 0, 2, ',', ' ') }} DH</td>
                    <td class="text-right">
                        {{ number_format($detail->montant ?? $detail->quantite * ($detail->prix_unitaire ?? 0), 2, ',', ' ') }}
                        DH</td>
                </tr>
                @php $rows++; @endphp
            @endforeach


        </tbody>
    </table>

    <!-- TOTAL -->
    <div class="total">Total HT: {{ number_format($blClient->total ?? 0, 2, ',', ' ') }} DH</div>

    <!-- FOOTER -->
    <div class="footer">
        SARL au capital: 100000,00 - Siège social: 77 Rue Mohamed Smiha 10 Etg Appt N°57 Casablanca RC: 34329 - PATENTE:
        - IF: 68363934 - ICE: 003789368000045 - Email: finducarr@gmail.com - Tél: 0708-330546
    </div>

</body>

</html>
