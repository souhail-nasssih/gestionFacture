<?php

namespace App\Exports;

use App\Models\Client;
use Carbon\Carbon;

class ClientDetailExcelExport
{
    protected $client;
    protected $stats;

    public function __construct(Client $client, array $stats)
    {
        $this->client = $client;
        $this->stats = $stats;
    }

    /**
     * Générer le contenu Excel professionnel
     */
    public function generate()
    {
        $content = $this->getExcelHeader();
        $content .= $this->getClientInfoSection();
        $content .= $this->getStatsSection();
        $content .= $this->getInvoicesSection();
        $content .= $this->getPaymentsSection();
        $content .= $this->getExcelFooter();

        return $content;
    }

    /**
     * En-tête Excel avec styles professionnels
     */
    private function getExcelHeader()
    {
        return '<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>Détail Client - ' . htmlspecialchars($this->client->nom) . '</Title>
    <Author>Système de Gestion de Factures</Author>
    <Created>' . now()->format('Y-m-d\TH:i:s\Z') . '</Created>
</DocumentProperties>
<Styles>
    <Style ss:ID="Header">
        <Font ss:Bold="1" ss:Size="14" ss:Color="#FFFFFF"/>
        <Interior ss:Color="#2C3E50" ss:Pattern="Solid"/>
        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
    </Style>
    <Style ss:ID="SubHeader">
        <Font ss:Bold="1" ss:Size="12" ss:Color="#2C3E50"/>
        <Interior ss:Color="#ECF0F1" ss:Pattern="Solid"/>
        <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
        <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
    </Style>
    <Style ss:ID="Data">
        <Font ss:Size="11"/>
        <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
        <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
    </Style>
    <Style ss:ID="Amount">
        <Font ss:Size="11" ss:Bold="1"/>
        <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
        <NumberFormat ss:Format="&quot;€&quot; #,##0.00"/>
        <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
    </Style>
    <Style ss:ID="StatusPaid">
        <Font ss:Size="11" ss:Bold="1" ss:Color="#27AE60"/>
        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
    </Style>
    <Style ss:ID="StatusUnpaid">
        <Font ss:Size="11" ss:Bold="1" ss:Color="#E74C3C"/>
        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
    </Style>
    <Style ss:ID="StatusPartial">
        <Font ss:Size="11" ss:Bold="1" ss:Color="#F39C12"/>
        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
        </Borders>
    </Style>
</Styles>
<Worksheet ss:Name="Détail Client">
<Table>';
    }

    /**
     * Section informations client
     */
    private function getClientInfoSection()
    {
        return '
<Row>
    <Cell ss:StyleID="Header" ss:MergeAcross="6">
        <Data ss:Type="String">DÉTAIL CLIENT - ' . htmlspecialchars(strtoupper($this->client->nom)) . '</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data" ss:MergeAcross="6">
        <Data ss:Type="String">Généré le ' . now()->format('d/m/Y à H:i') . '</Data>
    </Cell>
</Row>
<Row></Row>
<Row>
    <Cell ss:StyleID="SubHeader" ss:MergeAcross="6">
        <Data ss:Type="String">INFORMATIONS DU CLIENT</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Nom :</Data>
    </Cell>
    <Cell ss:StyleID="Data" ss:MergeAcross="5">
        <Data ss:Type="String">' . htmlspecialchars($this->client->nom) . '</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Téléphone :</Data>
    </Cell>
    <Cell ss:StyleID="Data" ss:MergeAcross="5">
        <Data ss:Type="String">' . htmlspecialchars($this->client->telephone) . '</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Email :</Data>
    </Cell>
    <Cell ss:StyleID="Data" ss:MergeAcross="5">
        <Data ss:Type="String">' . htmlspecialchars($this->client->email ?? 'Non renseigné') . '</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Adresse :</Data>
    </Cell>
    <Cell ss:StyleID="Data" ss:MergeAcross="5">
        <Data ss:Type="String">' . htmlspecialchars($this->client->adresse ?? 'Non renseignée') . '</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Délai de paiement :</Data>
    </Cell>
    <Cell ss:StyleID="Data" ss:MergeAcross="5">
        <Data ss:Type="String">' . ($this->client->delai_paiement ?? 0) . ' jours</Data>
    </Cell>
</Row>
<Row></Row>';
    }

    /**
     * Section statistiques financières
     */
    private function getStatsSection()
    {
        return '
<Row>
    <Cell ss:StyleID="SubHeader" ss:MergeAcross="6">
        <Data ss:Type="String">STATISTIQUES FINANCIÈRES</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Montant total factures :</Data>
    </Cell>
    <Cell ss:StyleID="Amount">
        <Data ss:Type="Number">' . $this->stats['montant_total_factures'] . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Montant total payé :</Data>
    </Cell>
    <Cell ss:StyleID="Amount">
        <Data ss:Type="Number">' . $this->stats['montant_total_paye'] . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Reste à payer :</Data>
    </Cell>
    <Cell ss:StyleID="Amount">
        <Data ss:Type="Number">' . $this->stats['reste_a_payer'] . '</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Nombre de factures :</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="Number">' . $this->stats['nombre_factures'] . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">Nombre de règlements :</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="Number">' . $this->stats['nombre_reglements'] . '</Data>
    </Cell>
</Row>
<Row></Row>';
    }

    /**
     * Section factures
     */
    private function getInvoicesSection()
    {
        $content = '
<Row>
    <Cell ss:StyleID="SubHeader" ss:MergeAcross="6">
        <Data ss:Type="String">FACTURES (' . $this->stats['nombre_factures'] . ')</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">N° Facture</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Date Facture</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Date Échéance</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Statut</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Montant Total</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Montant Payé</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Reste à Payer</Data>
    </Cell>
</Row>';

        if ($this->client->factures->count() > 0) {
            foreach ($this->client->factures as $facture) {
                $statusStyle = $this->getStatusStyle($facture->statut_paiement);
                $content .= '
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . htmlspecialchars($facture->numero_facture) . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . Carbon::parse($facture->date_facture)->format('d/m/Y') . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . Carbon::parse($facture->date_echeance)->format('d/m/Y') . '</Data>
    </Cell>
    <Cell ss:StyleID="' . $statusStyle . '">
        <Data ss:Type="String">' . ucfirst($facture->statut_paiement) . '</Data>
    </Cell>
    <Cell ss:StyleID="Amount">
        <Data ss:Type="Number">' . $facture->montant_total . '</Data>
    </Cell>
    <Cell ss:StyleID="Amount">
        <Data ss:Type="Number">' . $facture->montant_regle . '</Data>
    </Cell>
    <Cell ss:StyleID="Amount">
        <Data ss:Type="Number">' . $facture->reste_a_payer . '</Data>
    </Cell>
</Row>';
            }
        } else {
            $content .= '
<Row>
    <Cell ss:StyleID="Data" ss:MergeAcross="6">
        <Data ss:Type="String">Aucune facture trouvée pour ce client.</Data>
    </Cell>
</Row>';
        }

        $content .= '<Row></Row>';
        return $content;
    }

    /**
     * Section règlements
     */
    private function getPaymentsSection()
    {
        $content = '
<Row>
    <Cell ss:StyleID="SubHeader" ss:MergeAcross="5">
        <Data ss:Type="String">RÈGLEMENTS (' . $this->stats['nombre_reglements'] . ')</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">N° Règlement</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Date Règlement</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Type Règlement</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Montant Payé</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Description</Data>
    </Cell>
    <Cell ss:StyleID="Header">
        <Data ss:Type="String">Facture Associée</Data>
    </Cell>
</Row>';

        if ($this->client->reglements->count() > 0) {
            foreach ($this->client->reglements as $reglement) {
                $content .= '
<Row>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . htmlspecialchars($reglement->numero_reglement ?? 'N/A') . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . Carbon::parse($reglement->date_reglement)->format('d/m/Y') . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . htmlspecialchars($reglement->type_reglement) . '</Data>
    </Cell>
    <Cell ss:StyleID="Amount">
        <Data ss:Type="Number">' . $reglement->montant_paye . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . htmlspecialchars($reglement->description ?? 'N/A') . '</Data>
    </Cell>
    <Cell ss:StyleID="Data">
        <Data ss:Type="String">' . htmlspecialchars($reglement->facture ? $reglement->facture->numero_facture : 'N/A') . '</Data>
    </Cell>
</Row>';
            }
        } else {
            $content .= '
<Row>
    <Cell ss:StyleID="Data" ss:MergeAcross="5">
        <Data ss:Type="String">Aucun règlement trouvé pour ce client.</Data>
    </Cell>
</Row>';
        }

        return $content;
    }

    /**
     * Pied de page Excel
     */
    private function getExcelFooter()
    {
        return '
<Row></Row>
<Row>
    <Cell ss:StyleID="Data" ss:MergeAcross="6">
        <Data ss:Type="String">Document généré automatiquement par le système de gestion de factures</Data>
    </Cell>
</Row>
<Row>
    <Cell ss:StyleID="Data" ss:MergeAcross="6">
        <Data ss:Type="String">Page générée le ' . now()->format('d/m/Y à H:i') . '</Data>
    </Cell>
</Row>
</Table>
</Worksheet>
</Workbook>';
    }

    /**
     * Obtenir le style selon le statut
     */
    private function getStatusStyle($status)
    {
        switch ($status) {
            case 'payee':
                return 'StatusPaid';
            case 'impayee':
                return 'StatusUnpaid';
            default:
                return 'StatusPartial';
        }
    }
}
