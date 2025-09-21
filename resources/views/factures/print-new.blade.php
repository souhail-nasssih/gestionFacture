<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
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
        print-color-adjust: exact !important;
      }
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


    /* Row under header:
       left = dates-section, right = destinataire (Déstinataire:)
       both must be on the same horizontal level */
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
      line-height: 1.5;
    }
    .destinataire-col {
      width: 320px; /* makes sure it's at the right side and same vertical baseline */
      font-size: 11px;
      line-height: 1.4;
      text-align: left;
      margin-left: 180px
    }
    .destinataire-col strong.company { display:inline-block; margin-left:4px; color: #b32626;text-decoration-color: #bd2e03;}

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
      padding: 5px 4px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #000;
      font-size: 8px;
    }
    td {
      border: 1px solid #000;
      padding: 5px 4px;
      text-align: center;
      vertical-align: middle;
    }
    .description-col {
      text-align: left !important;
      padding-left: 6px;
    }

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
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <img src="{{ asset('logo.jpg') }}" alt="Logo">
    </div>

    <div class="invoice-details">
      <div class="fa"><strong >Facture N°:</strong> {{ $facture->numero_facture ?? 'FC00001-25' }}</div>
      <div><strong>Etablie le:</strong> {{ $facture->date_facture ?? '2025-09-09' }}</div>
      <div><strong>Échéance le:</strong> {{ $facture->date_echeance ?? '' }}</div>
    </div>
  </div>

  <!-- TOP ROW: left = dates, right = Déstinataire (exact placement requested) -->
  <div class="top-row">
    <!-- LEFT: Dates block -->
    <div class="dates-col">
      <div><strong>Date du Facture:</strong> {{ $facture->date_facture ?? '2025-09-09' }}</div>
      <div><strong>Échéance du Facture:</strong> {{ $facture->date_echeance ?? '' }}</div>
      <div><strong>Modalités de Paiement:</strong> Chèque ou Espèce</div>
    </div>

    <!-- RIGHT: Déstinataire block (MUST contain the requested fields) -->
    <div class="destinataire-col">
      <div><strong>Déstinataire:</strong></div>
      <div>Société: <strong class="company">{{ $facture->destinataire->societe ?? $facture->fournisseur->nom ?? 'SIGNA PLUS' }}</strong></div>
      <div>Adresse: {{ $facture->destinataire->adresse ?? $facture->fournisseur->adresse ?? '' }}</div>
      <div>ICE: {{ $facture->destinataire->ice ?? $facture->fournisseur->ice ?? '' }}</div>
      <div>E-mail: {{ $facture->destinataire->email ?? $facture->fournisseur->email ?? '' }}</div>
    </div>
  </div>

  <!-- LEGAL NOTE (below the two columns) -->
  <div class="legal-note">
    **Date effet     {{ $facture->date_facture ?? '' }}     payable au plus tard le     {{ $facture->date_echeance ?? '' }}     sous peine de pénalité selon la loi 69-22**
  </div>

  <!-- PRODUCTS TABLE -->
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">Réf</th>
        <th style="width: 6%;">BC</th>
        <th style="width: 6%;">N° BL</th>
        <th style="width: 30%;">Description</th>
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
            <td>0</td>
            <td>0</td>
            <td>{{ $bl->numero_bl ?? '' }}</td>
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

      {{-- Fill up to a fixed number of rows so printed layout remains consistent (adjust 14 as needed)
      @for($i = $rowCount; $i < 14; $i++)
        <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      @endfor --}}
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
        <td class="amount-col">20,00%</td>
        <td class="amount-col">{{ number_format(($facture->montant_total ?? 0) * 0.2, 2, ',', ' ') }} DH</td>
        <td class="amount-col total-row">{{ number_format(($facture->montant_total ?? 0) * 1.2, 2, ',', ' ') }} DH</td>
      </tr>
    </table>
  </div>

  <!-- AMOUNT IN WORDS -->
  <div class="amount-words">
    <strong>Arrêtée la présente à la somme de:</strong>
    <strong>{{ ucfirst(\App\Helpers\NumberToWords::french($facture->montant_total ?? '' ))}}</strong>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    SARL au capital: 100000,00 - Siège social: 77 Rue Mohamed Smiha 10 Etg Appt N°57 Casablanca RC: 689565 - PATENTE: 32108409 - IF: 68363934 - ICE: 003789368000045 - Email: finducarr@gmail.com - Tél: 0708-330546
  </div>

  <!-- PRINT BUTTON -->
  <div class="no-print" style="text-align:center; margin-top:20px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #2B4C7E; color: white; border: none; border-radius: 5px; cursor: pointer;">Imprimer la Facture</button>
  </div>
</body>
</html>
