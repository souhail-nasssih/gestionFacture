<?php

namespace App\Services;

use App\Models\Client;
use App\Exports\ClientDetailExcelExport;
use App\Exports\ClientDetailPdfExport;
use Illuminate\Http\Response;

class ClientExportService
{
    /**
     * Exporter le détail client en Excel professionnel
     */
    public function exportToExcel(Client $client)
    {
        $stats = $this->getClientStats($client);
        $excelExport = new ClientDetailExcelExport($client, $stats);
        $content = $excelExport->generate();

        $filename = "detail-client-{$client->nom}-" . now()->format('Y-m-d') . '.xls';

        return response($content, 200, [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($content),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Content-Transfer-Encoding' => 'binary',
            'Accept-Ranges' => 'bytes'
        ]);
    }

    /**
     * Exporter le détail client en PDF professionnel (HTML avec design moderne)
     */
    public function exportToPdf(Client $client)
    {
        $stats = $this->getClientStats($client);
        
        // Générer le HTML professionnel
        $htmlContent = $this->generateProfessionalHtml($client, $stats);
        $filename = "detail-client-{$client->nom}-" . now()->format('Y-m-d') . '.html';
        
        return response($htmlContent, 200, [
            'Content-Type' => 'text/html',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($htmlContent),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Exporter le détail client en PDF pour impression
     */
    public function exportToPdfPrint(Client $client)
    {
        $stats = $this->getClientStats($client);
        $pdfExport = new ClientDetailPdfExport($client, $stats);
        $content = $pdfExport->generate();

        return response($content, 200, [
            'Content-Type' => 'text/html',
            'Content-Disposition' => 'inline; filename="detail-client-'.$client->nom.'-'.now()->format('Y-m-d').'.html"',
        ]);
    }

    /**
     * Exporter le détail client en CSV
     */
    public function exportToCsv(Client $client)
    {
        $stats = $this->getClientStats($client);
        $csvContent = $this->generateCsvContent($client, $stats);

        $filename = "detail-client-{$client->nom}-" . now()->format('Y-m-d') . '.csv';

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($csvContent),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Obtenir les statistiques du client
     */
    private function getClientStats(Client $client)
    {
        return [
            'montant_total_factures' => $client->montant_total_factures,
            'montant_total_paye' => $client->montant_total_paye,
            'reste_a_payer' => $client->reste_a_payer,
            'nombre_factures' => $client->factures->count(),
            'nombre_reglements' => $client->reglements->count(),
        ];
    }

    /**
     * Générer le contenu CSV
     */
    private function generateCsvContent(Client $client, array $stats)
    {
        $csv = "Détail Client - " . $client->nom . "\n";
        $csv .= "Généré le " . now()->format('d/m/Y à H:i') . "\n\n";

        $csv .= "INFORMATIONS DU CLIENT\n";
        $csv .= "Nom," . $client->nom . "\n";
        $csv .= "Téléphone," . $client->telephone . "\n";
        $csv .= "Email," . ($client->email ?? 'Non renseigné') . "\n";
        $csv .= "Adresse," . ($client->adresse ?? 'Non renseignée') . "\n";
        $csv .= "Délai de paiement," . ($client->delai_paiement ?? 0) . " jours\n\n";

        $csv .= "STATISTIQUES FINANCIÈRES\n";
        $csv .= "Montant total factures," . number_format($stats['montant_total_factures'], 2) . " €\n";
        $csv .= "Montant total payé," . number_format($stats['montant_total_paye'], 2) . " €\n";
        $csv .= "Reste à payer," . number_format($stats['reste_a_payer'], 2) . " €\n";
        $csv .= "Nombre de factures," . $stats['nombre_factures'] . "\n";
        $csv .= "Nombre de règlements," . $stats['nombre_reglements'] . "\n\n";

        $csv .= "FACTURES\n";
        $csv .= "N° Facture,Date Facture,Date Échéance,Statut,Montant Total,Montant Payé,Reste à Payer\n";

        if ($client->factures->count() > 0) {
            foreach ($client->factures as $facture) {
                $csv .= $facture->numero_facture . ",";
                $csv .= \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') . ",";
                $csv .= \Carbon\Carbon::parse($facture->date_echeance)->format('d/m/Y') . ",";
                $csv .= ucfirst($facture->statut_paiement) . ",";
                $csv .= number_format($facture->montant_total, 2) . " €,";
                $csv .= number_format($facture->montant_regle, 2) . " €,";
                $csv .= number_format($facture->reste_a_payer, 2) . " €\n";
            }
        } else {
            $csv .= "Aucune facture trouvée pour ce client.\n";
        }

        $csv .= "\nRÈGLEMENTS\n";
        $csv .= "N° Règlement,Date Règlement,Type Règlement,Montant Payé,Description,Facture Associée\n";

        if ($client->reglements->count() > 0) {
            foreach ($client->reglements as $reglement) {
                $csv .= ($reglement->numero_reglement ?? 'N/A') . ",";
                $csv .= \Carbon\Carbon::parse($reglement->date_reglement)->format('d/m/Y') . ",";
                $csv .= $reglement->type_reglement . ",";
                $csv .= number_format($reglement->montant_paye, 2) . " €,";
                $csv .= ($reglement->description ?? 'N/A') . ",";
                $csv .= ($reglement->facture ? $reglement->facture->numero_facture : 'N/A') . "\n";
            }
        } else {
            $csv .= "Aucun règlement trouvé pour ce client.\n";
        }

        return $csv;
    }

    /**
     * Générer un vrai PDF natif avec structure PDF 1.4
     */
    private function generateNativePdf(Client $client, array $stats)
    {
        // Créer un PDF basique en utilisant une structure simple
        $pdf = "%PDF-1.4\n";
        $pdf .= "1 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Catalog\n";
        $pdf .= "/Pages 2 0 R\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        $pdf .= "2 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Pages\n";
        $pdf .= "/Kids [3 0 R]\n";
        $pdf .= "/Count 1\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        // Page content
        $content = $this->generatePdfTextContent($client, $stats);
        $contentLength = strlen($content);

        $pdf .= "3 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Page\n";
        $pdf .= "/Parent 2 0 R\n";
        $pdf .= "/MediaBox [0 0 612 792]\n";
        $pdf .= "/Contents 4 0 R\n";
        $pdf .= "/Resources <<\n";
        $pdf .= "/Font <<\n";
        $pdf .= "/F1 5 0 R\n";
        $pdf .= ">>\n";
        $pdf .= ">>\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        // Content stream
        $pdf .= "4 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Length " . $contentLength . "\n";
        $pdf .= ">>\n";
        $pdf .= "stream\n";
        $pdf .= $content;
        $pdf .= "endstream\n";
        $pdf .= "endobj\n\n";

        // Font
        $pdf .= "5 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Font\n";
        $pdf .= "/Subtype /Type1\n";
        $pdf .= "/BaseFont /Helvetica\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        // Cross-reference table
        $pdf .= "xref\n";
        $pdf .= "0 6\n";
        $pdf .= "0000000000 65535 f \n";
        $pdf .= "0000000009 00000 n \n";
        $pdf .= "0000000058 00000 n \n";
        $pdf .= "0000000115 00000 n \n";
        $pdf .= "0000000274 00000 n \n";
        $pdf .= "0000000380 00000 n \n";

        // Trailer
        $pdf .= "trailer\n";
        $pdf .= "<<\n";
        $pdf .= "/Size 6\n";
        $pdf .= "/Root 1 0 R\n";
        $pdf .= ">>\n";
        $pdf .= "startxref\n";
        $pdf .= "500\n";
        $pdf .= "%%EOF\n";

        return $pdf;
    }

    /**
     * Générer le contenu texte pour le PDF avec design professionnel
     */
    private function generatePdfTextContent(Client $client, array $stats)
    {
        $content = "BT\n";

        // En-tête professionnel
        $content .= "0 0 0 rg\n"; // Noir
        $content .= "/F1 24 Tf\n";
        $content .= "50 750 Td\n";
        $content .= "(DETAIL CLIENT) Tj\n";

        $content .= "0 -35 Td\n";
        $content .= "/F1 18 Tf\n";
        $content .= "(" . strtoupper($client->nom) . ") Tj\n";

        $content .= "0 -30 Td\n";
        $content .= "/F1 12 Tf\n";
        $content .= "(Genere le " . now()->format('d/m/Y a H:i') . ") Tj\n";

        // Ligne de séparation
        $content .= "0 -25 Td\n";
        $content .= "0.2 0.2 0.2 rg\n";
        $content .= "50 0 m 550 0 l S\n";

        // Section Informations Client
        $content .= "0 -35 Td\n";
        $content .= "0 0 0 rg\n";
        $content .= "/F1 16 Tf\n";
        $content .= "(INFORMATIONS DU CLIENT) Tj\n";

        $content .= "0 -25 Td\n";
        $content .= "/F1 12 Tf\n";
        $content .= "(Nom: " . $client->nom . ") Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Telephone: " . $client->telephone . ") Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Email: " . ($client->email ?? 'Non renseigne') . ") Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Adresse: " . ($client->adresse ?? 'Non renseignee') . ") Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Delai de paiement: " . ($client->delai_paiement ?? 0) . " jours) Tj\n";

        // Section Statistiques
        $content .= "0 -35 Td\n";
        $content .= "/F1 16 Tf\n";
        $content .= "(STATISTIQUES FINANCIERES) Tj\n";

        $content .= "0 -25 Td\n";
        $content .= "/F1 12 Tf\n";
        $content .= "(Montant total factures: " . number_format($stats['montant_total_factures'], 2) . " EUR) Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Montant total paye: " . number_format($stats['montant_total_paye'], 2) . " EUR) Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Reste a payer: " . number_format($stats['reste_a_payer'], 2) . " EUR) Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Nombre de factures: " . $stats['nombre_factures'] . ") Tj\n";
        $content .= "0 -18 Td\n";
        $content .= "(Nombre de reglements: " . $stats['nombre_reglements'] . ") Tj\n";

        // Section Factures avec tableau structuré
        $content .= "0 -35 Td\n";
        $content .= "/F1 16 Tf\n";
        $content .= "(FACTURES) Tj\n";

        if ($client->factures->count() > 0) {
            // En-tête du tableau
            $content .= "0 -25 Td\n";
            $content .= "/F1 11 Tf\n";
            $content .= "0.8 0.8 0.8 rg\n"; // Fond gris pour l'en-tête
            $content .= "40 -5 m 560 -5 l 560 -20 l 40 -20 l h f\n"; // Rectangle de fond

            $content .= "0 0 0 rg\n"; // Texte noir
            $content .= "45 -12 Td\n";
            $content .= "(N° Facture) Tj\n";
            $content .= "100 0 Td\n";
            $content .= "(Date Facture) Tj\n";
            $content .= "80 0 Td\n";
            $content .= "(Date Echeance) Tj\n";
            $content .= "80 0 Td\n";
            $content .= "(Statut) Tj\n";
            $content .= "70 0 Td\n";
            $content .= "(Montant Total) Tj\n";
            $content .= "70 0 Td\n";
            $content .= "(Montant Paye) Tj\n";
            $content .= "70 0 Td\n";
            $content .= "(Reste a Payer) Tj\n";

            // Lignes du tableau
            $y = 500;
            foreach ($client->factures as $index => $facture) {
                $y -= 20;

                // Fond alterné pour les lignes
                if ($index % 2 == 0) {
                    $content .= "0.95 0.95 0.95 rg\n"; // Gris très clair
                } else {
                    $content .= "1 1 1 rg\n"; // Blanc
                }
                $content .= "40 " . ($y - 5) . " m 560 " . ($y - 5) . " l 560 " . ($y + 15) . " l 40 " . ($y + 15) . " l h f\n";

                // Texte des données
                $content .= "0 0 0 rg\n";
                $content .= "45 " . $y . " Td\n";
                $content .= "(" . $facture->numero_facture . ") Tj\n";
                $content .= "100 0 Td\n";
                $content .= "(" . \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') . ") Tj\n";
                $content .= "80 0 Td\n";
                $content .= "(" . \Carbon\Carbon::parse($facture->date_echeance)->format('d/m/Y') . ") Tj\n";
                $content .= "80 0 Td\n";

                // Couleur du statut
                if ($facture->statut_paiement == 'payee') {
                    $content .= "0 0.6 0 rg\n"; // Vert
                } elseif ($facture->statut_paiement == 'impayee') {
                    $content .= "0.8 0 0 rg\n"; // Rouge
                } else {
                    $content .= "0.8 0.4 0 rg\n"; // Orange
                }
                $content .= "(" . ucfirst($facture->statut_paiement) . ") Tj\n";

                $content .= "0 0 0 rg\n";
                $content .= "70 0 Td\n";
                $content .= "(" . number_format($facture->montant_total, 2) . " EUR) Tj\n";
                $content .= "70 0 Td\n";
                $content .= "(" . number_format($facture->montant_regle, 2) . " EUR) Tj\n";
                $content .= "70 0 Td\n";
                $content .= "(" . number_format($facture->reste_a_payer, 2) . " EUR) Tj\n";
            }
        } else {
            $content .= "0 -25 Td\n";
            $content .= "0.5 0.5 0.5 rg\n";
            $content .= "(Aucune facture trouvee pour ce client.) Tj\n";
        }

        // Section Règlements avec tableau structuré
        $content .= "0 -35 Td\n";
        $content .= "/F1 16 Tf\n";
        $content .= "(REGLEMENTS) Tj\n";

        if ($client->reglements->count() > 0) {
            // En-tête du tableau
            $content .= "0 -25 Td\n";
            $content .= "/F1 11 Tf\n";
            $content .= "0.8 0.8 0.8 rg\n"; // Fond gris pour l'en-tête
            $content .= "40 -5 m 560 -5 l 560 -20 l 40 -20 l h f\n"; // Rectangle de fond

            $content .= "0 0 0 rg\n"; // Texte noir
            $content .= "45 -12 Td\n";
            $content .= "(N° Reglement) Tj\n";
            $content .= "100 0 Td\n";
            $content .= "(Date Reglement) Tj\n";
            $content .= "80 0 Td\n";
            $content .= "(Type Reglement) Tj\n";
            $content .= "80 0 Td\n";
            $content .= "(Montant Paye) Tj\n";
            $content .= "100 0 Td\n";
            $content .= "(Description) Tj\n";
            $content .= "80 0 Td\n";
            $content .= "(Facture Associee) Tj\n";

            // Lignes du tableau
            $y = 300;
            foreach ($client->reglements as $index => $reglement) {
                $y -= 20;

                // Fond alterné pour les lignes
                if ($index % 2 == 0) {
                    $content .= "0.95 0.95 0.95 rg\n"; // Gris très clair
                } else {
                    $content .= "1 1 1 rg\n"; // Blanc
                }
                $content .= "40 " . ($y - 5) . " m 560 " . ($y - 5) . " l 560 " . ($y + 15) . " l 40 " . ($y + 15) . " l h f\n";

                // Texte des données
                $content .= "0 0 0 rg\n";
                $content .= "45 " . $y . " Td\n";
                $content .= "(" . ($reglement->numero_reglement ?? 'N/A') . ") Tj\n";
                $content .= "100 0 Td\n";
                $content .= "(" . \Carbon\Carbon::parse($reglement->date_reglement)->format('d/m/Y') . ") Tj\n";
                $content .= "80 0 Td\n";
                $content .= "(" . $reglement->type_reglement . ") Tj\n";
                $content .= "80 0 Td\n";
                $content .= "(" . number_format($reglement->montant_paye, 2) . " EUR) Tj\n";
                $content .= "100 0 Td\n";
                $content .= "(" . ($reglement->description ?? 'N/A') . ") Tj\n";
                $content .= "80 0 Td\n";
                $content .= "(" . ($reglement->facture ? $reglement->facture->numero_facture : 'N/A') . ") Tj\n";
            }
        } else {
            $content .= "0 -25 Td\n";
            $content .= "0.5 0.5 0.5 rg\n";
            $content .= "(Aucun reglement trouve pour ce client.) Tj\n";
        }

        // Pied de page
        $content .= "0 -35 Td\n";
        $content .= "0.2 0.2 0.2 rg\n";
        $content .= "50 0 m 550 0 l S\n";

        $content .= "0 -20 Td\n";
        $content .= "/F1 10 Tf\n";
        $content .= "50 0 Td\n";
        $content .= "(Document genere automatiquement par le systeme de gestion de factures) Tj\n";

        $content .= "ET\n";

        return $content;
    }

    /**
     * Générer le HTML professionnel pour le PDF
     */
    private function generateProfessionalHtml(Client $client, array $stats)
    {
        $html = '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Détail Client - ' . htmlspecialchars($client->nom) . '</title>
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

        .pdf-container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 25px 0;
            border-bottom: 3px solid #3498db;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 8px 8px 0 0;
        }

        .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .header .client-name {
            font-size: 20px;
            color: #34495e;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .header .subtitle {
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
        }

        .client-info {
            background: #ffffff;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .client-info h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 700;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .client-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .detail-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
        }

        .detail-label {
            font-weight: 600;
            color: #495057;
            min-width: 140px;
            margin-right: 10px;
        }

        .detail-value {
            color: #2c3e50;
            font-weight: 500;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 25px;
            text-align: center;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
            font-weight: 600;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            margin: 30px 0 20px 0;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-unpaid {
            color: #dc3545;
            font-weight: 700;
            text-align: center;
            background: #f8d7da;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-partial {
            color: #fd7e14;
            font-weight: 700;
            text-align: center;
            background: #fff3cd;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
            border-top: 2px solid #e9ecef;
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
            border: 2px dashed #dee2e6;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="header">
            <h1>Détail Client</h1>
            <div class="client-name">' . htmlspecialchars(strtoupper($client->nom)) . '</div>
            <p class="subtitle">Généré le ' . now()->format('d/m/Y à H:i') . '</p>
        </div>

        <div class="client-info">
            <h2>📋 Informations du Client</h2>
            <div class="client-details">
                <div class="detail-item">
                    <div class="detail-label">Nom :</div>
                    <div class="detail-value">' . htmlspecialchars($client->nom) . '</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Téléphone :</div>
                    <div class="detail-value">' . htmlspecialchars($client->telephone) . '</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email :</div>
                    <div class="detail-value">' . htmlspecialchars($client->email ?? 'Non renseigné') . '</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Adresse :</div>
                    <div class="detail-value">' . htmlspecialchars($client->adresse ?? 'Non renseignée') . '</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Délai de paiement :</div>
                    <div class="detail-value">' . ($client->delai_paiement ?? 0) . ' jours</div>
                </div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">' . number_format($stats['montant_total_factures'], 2) . ' €</div>
                <div class="stat-label">Montant Total Factures</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">' . number_format($stats['montant_total_paye'], 2) . ' €</div>
                <div class="stat-label">Montant Total Payé</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">' . number_format($stats['reste_a_payer'], 2) . ' €</div>
                <div class="stat-label">Reste à Payer</div>
            </div>
        </div>

        <div class="section-title">📄 Situation des Factures (' . $stats['nombre_factures'] . ')</div>';

        if ($client->factures->count() > 0) {
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

            foreach ($client->factures as $facture) {
                $statusClass = $this->getStatusClass($facture->statut_paiement);
                $html .= '
                <tr>
                    <td><strong>' . htmlspecialchars($facture->numero_facture) . '</strong></td>
                    <td>' . \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') . '</td>
                    <td>' . \Carbon\Carbon::parse($facture->date_echeance)->format('d/m/Y') . '</td>
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

        $html .= '
        <div class="section-title">💰 Historique des Règlements (' . $stats['nombre_reglements'] . ')</div>';

        if ($client->reglements->count() > 0) {
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

            foreach ($client->reglements as $reglement) {
                $html .= '
                <tr>
                    <td><strong>' . htmlspecialchars($reglement->numero_reglement ?? 'N/A') . '</strong></td>
                    <td>' . \Carbon\Carbon::parse($reglement->date_reglement)->format('d/m/Y') . '</td>
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

        $html .= '
        <div class="footer">
            <p><strong>Document généré automatiquement par le système de gestion de factures</strong></p>
            <p>Page générée le ' . now()->format('d/m/Y à H:i') . '</p>
        </div>
    </div>
</body>
</html>';

        return $html;
    }

    /**
     * Exporter le détail client en PDF natif simple (vrai PDF)
     */
    public function exportToPdfNative(Client $client)
    {
        $stats = $this->getClientStats($client);
        
        // Générer un vrai PDF natif simple
        $pdfContent = $this->generateSimplePdf($client, $stats);
        $filename = "detail-client-{$client->nom}-" . now()->format('Y-m-d') . '.pdf';
        
        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($pdfContent),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Générer un PDF natif simple qui fonctionne
     */
    private function generateSimplePdf(Client $client, array $stats)
    {
        // Créer un PDF basique mais fonctionnel
        $pdf = "%PDF-1.4\n";
        $pdf .= "1 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Catalog\n";
        $pdf .= "/Pages 2 0 R\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        $pdf .= "2 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Pages\n";
        $pdf .= "/Kids [3 0 R]\n";
        $pdf .= "/Count 1\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        // Page content
        $content = $this->generateSimplePdfContent($client, $stats);
        $contentLength = strlen($content);

        $pdf .= "3 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Page\n";
        $pdf .= "/Parent 2 0 R\n";
        $pdf .= "/MediaBox [0 0 612 792]\n";
        $pdf .= "/Contents 4 0 R\n";
        $pdf .= "/Resources <<\n";
        $pdf .= "/Font <<\n";
        $pdf .= "/F1 5 0 R\n";
        $pdf .= ">>\n";
        $pdf .= ">>\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        // Content stream
        $pdf .= "4 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Length " . $contentLength . "\n";
        $pdf .= ">>\n";
        $pdf .= "stream\n";
        $pdf .= $content;
        $pdf .= "endstream\n";
        $pdf .= "endobj\n\n";

        // Font
        $pdf .= "5 0 obj\n";
        $pdf .= "<<\n";
        $pdf .= "/Type /Font\n";
        $pdf .= "/Subtype /Type1\n";
        $pdf .= "/BaseFont /Helvetica\n";
        $pdf .= ">>\n";
        $pdf .= "endobj\n\n";

        // Cross-reference table
        $pdf .= "xref\n";
        $pdf .= "0 6\n";
        $pdf .= "0000000000 65535 f \n";
        $pdf .= "0000000009 00000 n \n";
        $pdf .= "0000000058 00000 n \n";
        $pdf .= "0000000115 00000 n \n";
        $pdf .= "0000000274 00000 n \n";
        $pdf .= "0000000380 00000 n \n";

        // Trailer
        $pdf .= "trailer\n";
        $pdf .= "<<\n";
        $pdf .= "/Size 6\n";
        $pdf .= "/Root 1 0 R\n";
        $pdf .= ">>\n";
        $pdf .= "startxref\n";
        $pdf .= "500\n";
        $pdf .= "%%EOF\n";

        return $pdf;
    }

    /**
     * Générer le contenu texte simple pour le PDF
     */
    private function generateSimplePdfContent(Client $client, array $stats)
    {
        $content = "BT\n";

        // En-tête simple
        $content .= "0 0 0 rg\n";
        $content .= "/F1 20 Tf\n";
        $content .= "50 750 Td\n";
        $content .= "(DETAIL CLIENT) Tj\n";

        $content .= "0 -30 Td\n";
        $content .= "/F1 16 Tf\n";
        $content .= "(" . strtoupper($client->nom) . ") Tj\n";

        $content .= "0 -25 Td\n";
        $content .= "/F1 10 Tf\n";
        $content .= "(Genere le " . now()->format('d/m/Y a H:i') . ") Tj\n";

        // Ligne de séparation
        $content .= "0 -20 Td\n";
        $content .= "0.5 0.5 0.5 rg\n";
        $content .= "50 0 m 550 0 l S\n";

        // Informations client
        $content .= "0 -30 Td\n";
        $content .= "0 0 0 rg\n";
        $content .= "/F1 14 Tf\n";
        $content .= "(INFORMATIONS DU CLIENT) Tj\n";

        $content .= "0 -20 Td\n";
        $content .= "/F1 11 Tf\n";
        $content .= "(Nom: " . $client->nom . ") Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Telephone: " . $client->telephone . ") Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Email: " . ($client->email ?? 'Non renseigne') . ") Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Adresse: " . ($client->adresse ?? 'Non renseignee') . ") Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Delai de paiement: " . ($client->delai_paiement ?? 0) . " jours) Tj\n";

        // Statistiques
        $content .= "0 -30 Td\n";
        $content .= "/F1 14 Tf\n";
        $content .= "(STATISTIQUES FINANCIERES) Tj\n";

        $content .= "0 -20 Td\n";
        $content .= "/F1 11 Tf\n";
        $content .= "(Montant total factures: " . number_format($stats['montant_total_factures'], 2) . " EUR) Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Montant total paye: " . number_format($stats['montant_total_paye'], 2) . " EUR) Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Reste a payer: " . number_format($stats['reste_a_payer'], 2) . " EUR) Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Nombre de factures: " . $stats['nombre_factures'] . ") Tj\n";
        $content .= "0 -15 Td\n";
        $content .= "(Nombre de reglements: " . $stats['nombre_reglements'] . ") Tj\n";

        // Factures
        $content .= "0 -30 Td\n";
        $content .= "/F1 14 Tf\n";
        $content .= "(FACTURES) Tj\n";
        
        if ($client->factures->count() > 0) {
            $content .= "0 -20 Td\n";
            $content .= "/F1 10 Tf\n";
            $content .= "(N° Facture | Date Facture | Date Echeance | Statut | Montant Total | Montant Paye | Reste a Payer) Tj\n";
            
            foreach ($client->factures as $facture) {
                $content .= "0 -15 Td\n";
                $content .= "(" . $facture->numero_facture . " | " . 
                           \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') . " | " . 
                           \Carbon\Carbon::parse($facture->date_echeance)->format('d/m/Y') . " | " . 
                           ucfirst($facture->statut_paiement) . " | " . 
                           number_format($facture->montant_total, 2) . " EUR | " . 
                           number_format($facture->montant_regle, 2) . " EUR | " . 
                           number_format($facture->reste_a_payer, 2) . " EUR) Tj\n";
            }
        } else {
            $content .= "0 -20 Td\n";
            $content .= "(Aucune facture trouvee pour ce client.) Tj\n";
        }

        // Règlements
        $content .= "0 -30 Td\n";
        $content .= "/F1 14 Tf\n";
        $content .= "(REGLEMENTS) Tj\n";
        
        if ($client->reglements->count() > 0) {
            $content .= "0 -20 Td\n";
            $content .= "/F1 10 Tf\n";
            $content .= "(N° Reglement | Date Reglement | Type Reglement | Montant Paye | Description | Facture Associee) Tj\n";
            
            foreach ($client->reglements as $reglement) {
                $content .= "0 -15 Td\n";
                $content .= "(" . ($reglement->numero_reglement ?? 'N/A') . " | " . 
                           \Carbon\Carbon::parse($reglement->date_reglement)->format('d/m/Y') . " | " . 
                           $reglement->type_reglement . " | " . 
                           number_format($reglement->montant_paye, 2) . " EUR | " . 
                           ($reglement->description ?? 'N/A') . " | " . 
                           ($reglement->facture ? $reglement->facture->numero_facture : 'N/A') . ") Tj\n";
            }
        } else {
            $content .= "0 -20 Td\n";
            $content .= "(Aucun reglement trouve pour ce client.) Tj\n";
        }

        // Pied de page
        $content .= "0 -30 Td\n";
        $content .= "0.5 0.5 0.5 rg\n";
        $content .= "50 0 m 550 0 l S\n";

        $content .= "0 -15 Td\n";
        $content .= "/F1 8 Tf\n";
        $content .= "50 0 Td\n";
        $content .= "(Document genere automatiquement par le systeme de gestion de factures) Tj\n";

        $content .= "ET\n";

        return $content;
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
