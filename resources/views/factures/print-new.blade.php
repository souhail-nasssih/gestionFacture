<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture Fournisseur</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      margin: 0;
      padding: 10px;
    }
    @media print {
      .no-print { display: none; }
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .logo-section {
      display: flex;
      align-items: center;
    }
    .logo {
      width: 180px;
      height: 50px;
      background: #2B4C7E;
      border-radius: 50%;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 7px;
      text-align: center;
      line-height: 1;
    }
    .company-name {
      font-size: 11px;
      font-weight: bold;
      color: #2d3748;
      line-height: 1.2;
    }
    .invoice-details {
      text-align: right;
      font-size: 11px;
    }
    .invoice-details div {
      margin-bottom: 3px;
    }
    .client-info {
      margin-bottom: 20px;
      font-size: 11px;
    }
    .client-info div {
      margin-bottom: 2px;
    }
    .dates-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 10px;
    }
    .dates-section div {
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 9px;
    }
    th {
      background: #2B4C7E !important;
      color: white !important;
      padding: 6px 4px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #000;
      font-size: 8px;
    }
    td {
      border: 1px solid #000;
      padding: 6px 4px;
      text-align: center;
    }
    .description-col {
      text-align: left !important;
      padding-left: 6px;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .totals-table {
      width: 300px;
      border-collapse: collapse;
      font-size: 11px;
    }
    .totals-table td {
      padding: 8px 12px;
      border: 1px solid #000;
    }
    .totals-table .label-col {
      background: #2B4C7E !important;
      color: white !important;
      font-weight: bold;
      text-align: center;
    }
    .totals-table .amount-col {
      text-align: right;
      font-weight: bold;
    }
    .total-row {
      background: #2B4C7E !important;
      color: white !important;
      font-weight: bold !important;
    }
    .amount-words {
      margin: 20px 0;
      font-size: 11px;
      border: 1px solid #000;
      padding: 10px;
    }
    .footer {
      margin-top: 30px;
      font-size: 9px;
      text-align: center;
      line-height: 1.4;
    }
    .empty-row {
      height: 25px;
    }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <div class="logo-section">
      <div class="logo" style="background:none;">
        <img src="{{ asset('logo.jpg') }}" alt="FINDUCARR Logo" style="width:180px; height:180px; object-fit:contain; border-radius:30px;">
      </div>

    </div>
    <div class="invoice-details">
    <div><strong>Facture:</strong> {{ $facture->numero_facture ?? '' }}</div>
    <div><strong>Etablie le:</strong> {{ $facture->date_facture ?? '' }}</div>
    <div><strong>Echéance le:</strong> {{ $facture->date_echeance ?? '' }}</div>
    </div>
  </div>

  <!-- CLIENT INFO -->
  <div class="client-info">
  <div><strong>Destinataire:</strong></div>
  <div>Société: <strong>{{ $facture->fournisseur->nom ?? '' }}</strong></div>
  <!-- Add more fournisseur info if available -->
  </div>

  <!-- DATES -->
  <div class="dates-section">
  <div><strong>***Date Editée {{ $facture->date_facture ?? '' }} Jusqu'au {{ $facture->date_echeance ?? '' }}</strong></div>
  <div style="margin: 0 20px;"><strong>Date de Facture: {{ $facture->date_facture ?? '' }}</strong></div>
  <div><strong>Modalité de Paiement: Chèque ou Espèce</strong></div>
  </div>

  <!-- PRODUCTS TABLE -->
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">Réf</th>
        <th style="width: 6%;">BL</th>
        <th style="width: 4%;">N°</th>
        <th style="width: 32%;">Description</th>
        <th style="width: 6%;">Qté</th>
        <th style="width: 12%;">Prix unitaire</th>
        <th style="width: 8%;">Remise</th>
        <th style="width: 12%;">Total HT</th>
        <th style="width: 12%;">Total TTC</th>
      </tr>
    </thead>
    <tbody>
  @php $rowCount = 0; @endphp
  @foreach($facture->bonsLivraison ?? [] as $bl)
    @foreach($bl->details ?? [] as $detail)
      <tr>
        <td>{{ $bl->numero_bl ?? '' }}</td>
        <td>{{ $bl->id ?? '' }}</td>
        <td>{{ $detail->id ?? '' }}</td>
        <td class="description-col">{{ $detail->produit->nom ?? '' }}</td>
        <td>{{ $detail->quantite ?? '' }}</td>
        <td>{{ number_format($detail->prix_unitaire, 2, ',', ' ') ?? '' }} DH</td>
        <td>0,00%</td>
        <td>{{ number_format(($detail->prix_unitaire * $detail->quantite), 2, ',', ' ') ?? '' }} DH</td>
        <td>{{ number_format(($detail->prix_unitaire * $detail->quantite * 1.2), 2, ',', ' ') ?? '' }} DH</td>
      </tr>
      @php $rowCount++; @endphp
    @endforeach
  @endforeach
  @for($i = $rowCount; $i < 8; $i++)
      <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  @endfor
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
  <td class="amount-col">{{ number_format($facture->montant_total ?? 0, 2, ',', ' ') }} DH</td>
  <td class="amount-col">20%</td>
  <td class="amount-col">{{ number_format(($facture->montant_total ?? 0) * 0.2, 2, ',', ' ') }} DH</td>
  <td class="amount-col total-row">{{ number_format(($facture->montant_total ?? 0) * 1.2, 2, ',', ' ') }} DH</td>
      </tr>
    </table>
  </div>

  <!-- AMOUNT IN WORDS -->
  <div class="amount-words">
    <strong>Arrêtée la présente à la somme de:</strong>
  <strong>{{ $facture->montant_en_lettres ?? '' }}</strong>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    SARL au capital : 100000,00 - Siège social : 77 Rue Mohamed Smiha 10 Et Appt N°57 Casablanca RC : 34329 - PATENTE : - IF : -
  </div>

  <!-- PRINT BUTTON -->
  <div class="no-print" style="text-align:center; margin-top:20px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #2B4C7E; color: white; border: none; border-radius: 5px; cursor: pointer;">Imprimer la Facture</button>
  </div>
</body>
</html>
