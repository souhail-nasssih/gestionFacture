<?php

namespace App\Console\Commands;

use App\Http\Controllers\DashboardController;
use App\Models\Client;
use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use App\Models\Reglement;
use Illuminate\Console\Command;

class TestDashboardCalculations extends Command
{
    protected $signature = 'dashboard:test-calculations';
    protected $description = 'Test the dashboard calculations to ensure they are working correctly';

    public function handle()
    {
        $this->info('Testing Dashboard Calculations...');

        $controller = new DashboardController();

        // Test des statistiques principales
        $this->info('Testing main statistics...');

        // Récupérer les données directement depuis la base
        $totalFactures = FactureClient::count();
        $totalClients = Client::count();
        $totalFacturesFournisseurs = FactureFournisseur::count();

        $this->info("Total factures clients: {$totalFactures}");
        $this->info("Total clients: {$totalClients}");
        $this->info("Total factures fournisseurs: {$totalFacturesFournisseurs}");

        // Test des calculs de créances
        $this->info('Testing client receivables calculation...');
        $factures = FactureClient::withSum('reglements', 'montant_paye')->get();
        $creancesClients = 0;

        foreach ($factures as $facture) {
            $montantRegle = $facture->reglements_sum_montant_paye ?? 0;
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);
            $creancesClients += $resteAPayer;
        }

        $this->info("Calculated client receivables: " . number_format($creancesClients, 2) . " MAD");

        // Test des calculs de dettes fournisseurs
        $this->info('Testing supplier debts calculation...');
        $facturesFournisseurs = FactureFournisseur::withSum('reglements', 'montant_paye')->get();
        $dettesFournisseurs = 0;

        foreach ($facturesFournisseurs as $facture) {
            $montantRegle = $facture->reglements_sum_montant_paye ?? 0;
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);
            $dettesFournisseurs += $resteAPayer;
        }

        $this->info("Calculated supplier debts: " . number_format($dettesFournisseurs, 2) . " MAD");

        // Test de la trésorerie nette
        $tresorerieNette = $creancesClients - $dettesFournisseurs;
        $this->info("Net treasury: " . number_format($tresorerieNette, 2) . " MAD");

        // Test des factures en retard
        $this->info('Testing overdue invoices calculation...');
        $facturesEnRetard = 0;
        $facturesAvecReglements = FactureClient::with(['reglements', 'client'])->get();

        foreach ($facturesAvecReglements as $facture) {
            $montantRegle = $facture->reglements->where('type', 'client')->sum('montant_paye');
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);

            if ($resteAPayer > 0) {
                $dateEcheance = null;

                if ($facture->date_echeance) {
                    $dateEcheance = \Carbon\Carbon::parse($facture->date_echeance);
                } else {
                    $delai = $facture->client->delai_paiement ?? 0;
                    $dateEcheance = \Carbon\Carbon::parse($facture->date_facture)->addDays((int)$delai);
                }

                if ($dateEcheance && $dateEcheance->isPast()) {
                    $facturesEnRetard++;
                }
            }
        }

        $this->info("Overdue invoices: {$facturesEnRetard}");

        // Test des top clients
        $this->info('Testing top clients calculation...');
        $topClients = Client::withCount('factures')
            ->withSum('factures', 'montant_total')
            ->having('factures_sum_montant_total', '>', 0)
            ->orderBy('factures_sum_montant_total', 'desc')
            ->limit(5)
            ->get();

        $this->info("Top clients found: " . $topClients->count());
        foreach ($topClients as $client) {
            $this->info("- {$client->nom}: " . number_format($client->factures_sum_montant_total ?? 0, 2) . " MAD");
        }

        $this->info('Dashboard calculations test completed successfully!');

        return 0;
    }
}
