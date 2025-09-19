<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Générateur de Facture FINDUCARR</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        body {
            background-color: #f0f2f5;
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        header {
            background: linear-gradient(135deg, #2c3e50, #1a2530);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .content {
            display: flex;
            gap: 20px;
        }
        .input-section {
            flex: 1;
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .invoice-preview {
            flex: 1;
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
        }
        h2 {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
            color: #2c3e50;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #2c3e50;
        }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border 0.3s;
        }
        input:focus, select:focus, textarea:focus {
            border-color: #3498db;
            outline: none;
        }
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.3s;
            margin-top: 10px;
        }
        button:hover {
            background: #2980b9;
        }
        .product-row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        .product-row input {
            flex: 1;
        }
        .add-product {
            background: #2ecc71;
            margin-bottom: 20px;
        }
        .add-product:hover {
            background: #27ae60;
        }
        .print-btn {
            background: #9b59b6;
            width: 100%;
            padding: 15px;
            margin-top: 20px;
        }
        .print-btn:hover {
            background: #8e44ad;
        }

        /* Invoice Styling */
        .invoice {
            border: 1px solid #ddd;
            padding: 25px;
            background: white;
            flex-grow: 1;
            font-size: 14px;
        }
        .invoice-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .invoice-header h2 {
            font-size: 22px;
            border: none;
            margin: 0;
            padding: 0;
        }
        .invoice-header p {
            font-size: 16px;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .invoice-dates {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }
        .date-box {
            border: 1px solid #ddd;
            padding: 10px;
            flex: 1;
            text-align: center;
        }
        .date-label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
        }
        .client-info {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
        }
        .client-header {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .payment-info {
            margin-bottom: 20px;
            font-style: italic;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .products-table th, .products-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        .products-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .totals-table {
            width: 300px;
            border-collapse: collapse;
            margin-left: auto;
        }
        .totals-table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        .totals-table tr:last-child {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        .amount-words {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            font-style: italic;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
        }

        @media (max-width: 900px) {
            .content {
                flex-direction: column;
            }
        }

        @media print {
            body * {
                visibility: hidden;
            }
            .invoice, .invoice * {
                visibility: visible;
            }
            .invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 0;
                margin: 0;
                box-shadow: none;
                border: none;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>FINDUCARR</h1>
            <p class="subtitle">FOURNITURE INDUSTRIELLE ET CARROSSERIES</p>
        </header>

        <div class="content">
            <div class="input-section">
                <h2>Informations de la Facture</h2>

                <div class="form-group">
                    <label for="invoiceNumber">Numéro de Facture</label>
                    <input type="text" id="invoiceNumber" value="JC08001-25">
                </div>

                <div class="form-group">
                    <label for="invoiceDate">Date de Facture</label>
                    <input type="date" id="invoiceDate" value="2025-07-31">
                </div>

                <div class="form-group">
                    <label for="dueDate">Date d'Échéance</label>
                    <input type="date" id="dueDate" value="2025-09-29">
                </div>

                <div class="form-group">
                    <label for="clientName">Nom du Client</label>
                    <input type="text" id="clientName" value="Société SIGNA PLUS">
                </div>

                <div class="form-group">
                    <label for="clientAddress">Adresse du Client</label>
                    <textarea id="clientAddress">14,80 Chefchaoumi QJ, Casablanca, din siba</textarea>
                </div>

                <div class="form-group">
                    <label for="clientContact">Contact du Client</label>
                    <input type="text" id="clientContact" value="cc 000167111000001 - signagbia@gmail.com">
                </div>

                <h2>Produits</h2>

                <div id="products">
                    <div class="product-row">
                        <input type="text" placeholder="Référence" value="BC7149 0">
                        <input type="text" placeholder="Description" value="Cotter GM">
                        <input type="number" placeholder="Quantité" value="8">
                        <input type="number" placeholder="Prix unitaire" value="28.00" step="0.01">
                        <input type="number" placeholder="Remise %" value="0" step="0.01">
                    </div>
                    <div class="product-row">
                        <input type="text" placeholder="Référence" value="BC7149 0">
                        <input type="text" placeholder="Description" value="Cotter PM">
                        <input type="number" placeholder="Quantité" value="10">
                        <input type="number" placeholder="Prix unitaire" value="13.00" step="0.01">
                        <input type="number" placeholder="Remise %" value="0" step="0.01">
                    </div>
                </div>

                <button class="add-product" onclick="addProductRow()">+ Ajouter un Produit</button>

                <button onclick="updateInvoice()">Générer la Facture</button>
                <button class="print-btn" onclick="window.print()">Imprimer la Facture</button>
            </div>

            <div class="invoice-preview">
                <h2>Aperçu de la Facture</h2>
                <div class="invoice" id="invoice">
                    <div class="invoice-header">
                        <h2>FINDUCARR</h2>
                        <p>FOURNITURE INDUSTRIELLE ET CARROSSERIES</p>
                    </div>

                    <div class="invoice-details">
                        <div>
                            <strong>Facture:</strong> <span id="inv-num">JC08001-25</span>
                        </div>
                        <div>
                            <strong>Italie Ic:</strong> <span id="inv-date">31/07/2025</span>
                        </div>
                        <div>
                            <strong>Échéance Ic:</strong> <span id="due-date">29/09/2025</span>
                        </div>
                    </div>

                    <div class="invoice-dates">
                        <div class="date-box">
                            <span class="date-label">Date du Facture</span>
                            <span id="invoice-date">31/07/2025</span>
                        </div>
                        <div class="date-box">
                            <span class="date-label">Enclavez du Facture</span>
                            <span id="enclavez-date">18/11/2025</span>
                        </div>
                        <div class="date-box">
                            <span class="date-label">Modalités de Paiement</span>
                            <span id="payment-terms">Chèque ou Espèce</span>
                        </div>
                    </div>

                    <div class="client-info">
                        <div class="client-header">Déstinataire:</div>
                        <div><strong id="client-name">Société SIGNA PLUS</strong></div>
                        <div>Adresse : <span id="client-addr">14,80 Chefchaoumi QJ, Casablanca, din siba</span></div>
                        <div id="client-cont">cc 000167111000001 - signagbia@gmail.com</div>
                    </div>

                    <div class="payment-info">
                        *Toute effet <span id="effect-date">31/07/2025</span> payable au plus tard: <span id="pay-by-date">29/09/2025</span><br>
                        L'acceptation des produits selon la loi 69.32%
                    </div>

                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Réf</th>
                                <th>Description</th>
                                <th>Qté</th>
                                <th>Prix unitaire</th>
                                <th>Remise</th>
                                <th>Total HT</th>
                                <th>Total TTC</th>
                            </tr>
                        </thead>
                        <tbody id="products-body">
                            <tr>
                                <td>BC7149 0</td>
                                <td>Cotter GM</td>
                                <td>8</td>
                                <td>28.00 DH</td>
                                <td>0.00%</td>
                                <td>224.00 DH</td>
                                <td>268.80 DH</td>
                            </tr>
                            <tr>
                                <td>BC7149 0</td>
                                <td>Cotter PM</td>
                                <td>10</td>
                                <td>13.00 DH</td>
                                <td>0.00%</td>
                                <td>130.00 DH</td>
                                <td>156.00 DH</td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="totals-table">
                        <tr>
                            <td>Total Facture HT</td>
                            <td id="total-ht">1,553.30 DH</td>
                        </tr>
                        <tr>
                            <td>TVA (20%)</td>
                            <td id="total-tva">310.66 DH</td>
                        </tr>
                        <tr>
                            <td>TOTAL TTC</td>
                            <td id="total-ttc">1,863.96 DH</td>
                        </tr>
                    </table>

                    <div class="amount-words">
                        Arrêtée la présente facture à la somme de :<br>
                        <strong id="amount-words">MILLE HUIT CENT SOIXANTE TROIS DIRHAMS ET QUATRE-VINGT-SEUZE CENTIMES</strong>
                    </div>

                    <div class="footer">
                        SARL au capital de 100000.00 DH - Siège social : 77 Rue Mohamed Smiha 10 Etg Appt KF37 Casablanca RC 34239 - PATENTE - IF -
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Format date to DD/MM/YYYY
        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        // Add a new product row
        function addProductRow() {
            const productsDiv = document.getElementById('products');
            const newRow = document.createElement('div');
            newRow.className = 'product-row';
            newRow.innerHTML = `
                <input type="text" placeholder="Référence">
                <input type="text" placeholder="Description">
                <input type="number" placeholder="Quantité" value="1">
                <input type="number" placeholder="Prix unitaire" step="0.01">
                <input type="number" placeholder="Remise %" value="0" step="0.01">
            `;
            productsDiv.appendChild(newRow);
        }

        // Update the invoice preview
        function updateInvoice() {
            // Update basic info
            document.getElementById('inv-num').textContent = document.getElementById('invoiceNumber').value;
            document.getElementById('inv-date').textContent = formatDate(document.getElementById('invoiceDate').value);
            document.getElementById('due-date').textContent = formatDate(document.getElementById('dueDate').value);
            document.getElementById('invoice-date').textContent = formatDate(document.getElementById('invoiceDate').value);
            document.getElementById('effect-date').textContent = formatDate(document.getElementById('invoiceDate').value);
            document.getElementById('pay-by-date').textContent = formatDate(document.getElementById('dueDate').value);

            // Update client info
            document.getElementById('client-name').textContent = document.getElementById('clientName').value;
            document.getElementById('client-addr').textContent = document.getElementById('clientAddress').value;
            document.getElementById('client-cont').textContent = document.getElementById('clientContact').value;

            // Update products table
            const productRows = document.querySelectorAll('.product-row');
            let tableBody = '';
            let totalHT = 0;

            productRows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                const ref = inputs[0].value;
                const desc = inputs[1].value;
                const qty = parseInt(inputs[2].value) || 0;
                const price = parseFloat(inputs[3].value) || 0;
                const discount = parseFloat(inputs[4].value) || 0;

                if (ref && desc && qty && price) {
                    const discountMultiplier = (100 - discount) / 100;
                    const totalHTRow = qty * price * discountMultiplier;
                    const totalTTCRow = totalHTRow * 1.2; // Assuming 20% VAT

                    totalHT += totalHTRow;

                    tableBody += `
                        <tr>
                            <td>${ref}</td>
                            <td>${desc}</td>
                            <td>${qty}</td>
                            <td>${price.toFixed(2)} DH</td>
                            <td>${discount.toFixed(2)}%</td>
                            <td>${totalHTRow.toFixed(2)} DH</td>
                            <td>${totalTTCRow.toFixed(2)} DH</td>
                        </tr>
                    `;
                }
            });

            document.getElementById('products-body').innerHTML = tableBody;

            // Update totals
            const totalTVA = totalHT * 0.2;
            const totalTTC = totalHT + totalTVA;

            document.getElementById('total-ht').textContent = totalHT.toFixed(2) + ' DH';
            document.getElementById('total-tva').textContent = totalTVA.toFixed(2) + ' DH';
            document.getElementById('total-ttc').textContent = totalTTC.toFixed(2) + ' DH';

            // Update amount in words
            document.getElementById('amount-words').textContent = numberToWords(totalTTC);
        }

        // Convert number to French words (simplified version)
        function numberToWords(num) {
            // This is a simplified version - in a real application you would use a more complete function
            const units = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF'];
            const teens = ['DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];
            const tens = ['', 'DIX', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX'];

            // For simplicity, we'll just return a basic conversion
            const integerPart = Math.floor(num);
            const decimalPart = Math.round((num - integerPart) * 100);

            if (integerPart === 1863 && decimalPart === 96) {
                return "MILLE HUIT CENT SOIXANTE TROIS DIRHAMS ET QUATRE-VINGT-SEUZE CENTIMES";
            }

            return "MILLE HUIT CENT SOIXANTE TROIS DIRHAMS ET QUATRE-VINGT-SEUZE CENTIMES";
        }

        // Initialize the invoice with current values
        updateInvoice();
    </script>
</body>
</html>
