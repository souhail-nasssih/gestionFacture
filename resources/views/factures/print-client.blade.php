<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture Client {{ $facture->numero_facture }} - {{ $facture->client->nom }}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      margin: 0;
      padding: 10px;
      background: #fff;
    }
    @media print {
      .no-print { display: none; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body { font-size: 10px; }
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .logo img {
      width: 400px;
      height: 100px;
      object-fit: fill;
    }
    .invoice-details {
      text-align: left;
      font-size: 11px;
      line-height: 1.25;
      margin-right: 130px;
      margin-top: 40px;

    }
    .invoice-details .fa{
    color: #b32626;
      text-decoration: underline;
      text-decoration-color: #bd2e03;
    }

    /* Top row: left = dates, right = destinataire */
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      margin-bottom: 8px;
    }
    .dates-col {
      flex: 1 1 60%;
      font-size: 10.5px;
      line-height: 1.45;
    }
    .destinataire-col {
      width: 320px; /* makes sure it's at the right side and same vertical baseline */
      font-size: 11px;
      line-height: 1.4;
      text-align: left;
      margin-left: 180px
    }
    .destinataire-col strong.company { display:inline-block; margin-left:4px;color: #b32626;text-decoration-color: #bd2e03 }

    .legal-note {
      font-size: 10px;
      margin: 6px 0 10px 0;
      font-style: italic;
      text-align: right;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 15px 0;
      font-size: 9px;
    }
    th {
      background: #2B4C7E;
      color: white;
      padding: 5px 3px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #000;
      font-size: 8px;
    }
    td {
      border: 1px solid #000;
      padding: 5px 3px;
      text-align: center;
      vertical-align: middle;
    }
    .description-col {
      text-align: left !important;
      padding-left: 6px;
    }
    .empty-row td { height: 22px; }

    /* Totals */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin: 18px 0 10px 0;
    }
    .totals-table {
      width: 380px;
      border-collapse: collapse;
      font-size: 10px;
    }
    .totals-table td {
      padding: 7px 10px;
      border: 1px solid #000;
    }
    .totals-table .label-col {
      background: #2B4C7E;
      color: white;
      font-weight: bold;
      text-align: center;
    }
    .totals-table .amount-col {
      text-align: right;
      font-weight: bold;
    }
    .total-row {
      background: #2B4C7E;
      color: white;
      font-weight: bold !important;
    }

    .amount-words {
      margin: 15px 0;
      font-size: 11px;
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
    }

    .footer {
      margin-top: 20px;
      font-size: 9px;
      text-align: center;
      line-height: 1.4;
    }

    .no-print { text-align:center; margin-top:20px; }
    .btn-print {
      padding: 10px 20px; background: #2B4C7E; color: white; border: none; border-radius: 5px; cursor: pointer;
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <img src="{{ asset('logo.jpg') }}" alt="Logo">
    </div>

    <div class="invoice-details">
      <div class="fa"><strong>Facture N°:</strong> {{ $facture->numero_facture }}</div>
      <div><strong>Etablie le:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') }}</div>
      <div><strong>Échéance le:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->addDays(60)->format('d/m/Y') }}</div>
    </div>
  </div>

  <!-- TOP ROW: left = dates, right = Déstinataire (same horizontal level) -->
  <div class="top-row">
    <!-- LEFT: Dates block -->
    <div class="dates-col">
      <div><strong>Date du Facture:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') }}</div>
      <div><strong>Échéance du Facture:</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->addDays(60)->format('d/m/Y') }}</div>
      <div><strong>Modalités de Paiement:</strong> Chèque ou Espèce</div>
    </div>

    <!-- RIGHT: Déstinataire block (MUST contain these fields) -->
    <div class="destinataire-col">
      <div><strong>Déstinataire:</strong></div>
      <div>Société: <strong class="company">{{ $facture->client->nom ?? 'SIGNA PLUS' }}</strong></div>
      <div>Adresse: {{ $facture->client->adresse ?? '' }}</div>
      <div>ICE: {{ $facture->client->ice ?? '' }}</div>
      <div>E-mail: {{ $facture->client->email ?? '' }}</div>
    </div>
  </div>

  <!-- LEGAL NOTE -->
  <div class="legal-note">
    Date effet {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') }} payable au plus tard le {{ \Carbon\Carbon::parse($facture->date_facture)->addDays(60)->format('d/m/Y') }} sous peine de pénalité selon la loi 69-22
  </div>

  <!-- ITEMS TABLE -->
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Réf BC</th>
        <th style="width: 12%;">N° BL</th>
        <th style="width: 35%;">Description</th>
        <th style="width: 8%;">Qté</th>
        <th style="width: 12%;">Prix unitaire</th>
        <th style="width: 8%;">Remise</th>
        <th style="width: 11%;">Total HT</th>
        <th style="width: 11%;">Total TTC</th>
      </tr>
    </thead>
    <tbody>
      @php
        $totalHT = 0;
        $totalTVA = 0;
        $totalTTC = 0;
        $rowCount = 0;
      @endphp

      @foreach($facture->bonsLivraison ?? [] as $bl)
        @foreach($bl->details ?? [] as $detail)
          @php
            $montantHT = ($detail->quantite ?? 0) * ($detail->prix_unitaire ?? 0);
            $tva = $montantHT * 0.2;
            $montantTTC = $montantHT + $tva;

            $totalHT += $montantHT;
            $totalTVA += $tva;
            $totalTTC += $montantTTC;
            $rowCount++;
          @endphp
          <tr>
            <td>{{ $detail->produit->reference ?? 'N/A' }}</td>
            <td>{{ $bl->numero_bl ?? 'N/A' }}</td>
            <td class="description-col">{{ $detail->produit->designation ?? $detail->description ?? 'Produit non spécifié' }}</td>
            <td>{{ number_format($detail->quantite ?? 0, 0, ',', ' ') }}</td>
            <td>{{ number_format($detail->prix_unitaire ?? 0, 2, ',', ' ') }} DH</td>
            <td>0,00%</td>
            <td>{{ number_format($montantHT, 2, ',', ' ') }} DH</td>
            <td>{{ number_format($montantTTC, 2, ',', ' ') }} DH</td>
          </tr>
        @endforeach
      @endforeach



      @if($rowCount === 0)
        <tr>
          <td colspan="8" class="text-center" style="padding: 15px; color: #7f8c8d;">Aucun article trouvé pour cette facture</td>
        </tr>
      @endif
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td class="label-col">Total Facture HT</td>
        <td class="label-col">TVA</td>
        <td class="label-col">Taxe</td>
        <td class="label-col">TOTAL TTC</td>
      </tr>
      <tr>
        <td class="amount-col">{{ number_format($totalHT, 2, ',', ' ') }} DH</td>
        <td class="amount-col">20,00%</td>
        <td class="amount-col">{{ number_format($totalTVA, 2, ',', ' ') }} DH</td>
        <td class="amount-col total-row">{{ number_format($totalTTC, 2, ',', ' ') }} DH</td>
      </tr>
    </table>
  </div>

  <!-- AMOUNT IN WORDS -->
  <div class="amount-words">
    <strong>Arrêtée la présente à la somme de:</strong>
    <span style="font-style: italic;">
      {{ ucfirst(\App\Helpers\NumberToWords::french($totalTTC)) }}
    </span>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    SARL au capital: 100000,00 - Siège social: 77 Rue Mohamed Smiha 10 Etg Appt N°57 Casablanca RC: 689565 - PATENTE: 32108409 - IF: 68363934 - ICE: 003789368000045 - Email: finducarr@gmail.com - Tél: 0708-330546
  </div>

  <!-- PRINT BUTTON -->
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">Imprimer la Facture</button>
  </div>
</body>
</html>
