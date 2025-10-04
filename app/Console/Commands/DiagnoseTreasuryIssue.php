<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use App\Models\Reglement;
use Illuminate\Console\Command;

class DiagnoseTreasuryIssue extends Command
{
    protected $signature = 'dashboard:diagnose-treasury';
    protected $description = 'Diagnose why treasury calculation shows incorrect values';

    public function handle()
    {
        $this->info('🔍 Diagnosing Treasury Calculation Issue...');

        // Vérifier les factures clients
        $totalFacturesClients = FactureClient::count();
        $this->info("📊 Total factures clients: {$totalFacturesClients}");

        // Vérifier les factures fournisseurs
        $totalFacturesFournisseurs = FactureFournisseur::count();
        $this->info("📊 Total factures fournisseurs: {$totalFacturesFournisseurs}");

        // Vérifier les règlements clients
        $totalReglementsClients = Reglement::where('type', 'client')->count();
        $this->info("💰 Total règlements clients: {$totalReglementsClients}");

        // Vérifier les règlements fournisseurs
        $totalReglementsFournisseurs = Reglement::where('type', 'fournisseur')->count();
        $this->info("💰 Total règlements fournisseurs: {$totalReglementsFournisseurs}");

        // Vérifier les règlements orphelins (sans facture)
        $reglementsOrphelinsClients = Reglement::where('type', 'client')
            ->whereNotIn('facture_id', FactureClient::pluck('id'))
            ->count();
        $this->info("⚠️  Règlements clients orphelins: {$reglementsOrphelinsClients}");

        $reglementsOrphelinsFournisseurs = Reglement::where('type', 'fournisseur')
            ->whereNotIn('facture_id', FactureFournisseur::pluck('id'))
            ->count();
        $this->info("⚠️  Règlements fournisseurs orphelins: {$reglementsOrphelinsFournisseurs}");

        // Calculer les montants des règlements orphelins
        $montantReglementsOrphelinsClients = Reglement::where('type', 'client')
            ->whereNotIn('facture_id', FactureClient::pluck('id'))
            ->sum('montant_paye');
        $this->info("💸 Montant règlements clients orphelins: " . number_format($montantReglementsOrphelinsClients, 2) . " MAD");

        $montantReglementsOrphelinsFournisseurs = Reglement::where('type', 'fournisseur')
            ->whereNotIn('facture_id', FactureFournisseur::pluck('id'))
            ->sum('montant_paye');
        $this->info("💸 Montant règlements fournisseurs orphelins: " . number_format($montantReglementsOrphelinsFournisseurs, 2) . " MAD");

        // Calculer la trésorerie actuelle selon notre logique
        $creancesClients = 0;
        $dettesFournisseurs = 0;

        if ($totalFacturesClients > 0) {
            $factures = FactureClient::withSum('reglements', 'montant_paye')->get();
            foreach ($factures as $facture) {
                $montantRegle = $facture->reglements_sum_montant_paye ?? 0;
                $resteAPayer = max(0, $facture->montant_total - $montantRegle);
                $creancesClients += $resteAPayer;
            }
        }

        if ($totalFacturesFournisseurs > 0) {
            $factures = FactureFournisseur::withSum('reglements', 'montant_paye')->get();
            foreach ($factures as $facture) {
                $montantRegle = $facture->reglements_sum_montant_paye ?? 0;
                $resteAPayer = max(0, $facture->montant_total - $montantRegle);
                $dettesFournisseurs += $resteAPayer;
            }
        }

        $tresorerieNette = $creancesClients - $dettesFournisseurs;

        $this->info("\n📈 Calculs actuels:");
        $this->info("   Créances clients: " . number_format($creancesClients, 2) . " MAD");
        $this->info("   Dettes fournisseurs: " . number_format($dettesFournisseurs, 2) . " MAD");
        $this->info("   Trésorerie nette: " . number_format($tresorerieNette, 2) . " MAD");

        // Identifier le problème
        if ($totalFacturesClients == 0 && $totalFacturesFournisseurs == 0) {
            if ($reglementsOrphelinsClients > 0 || $reglementsOrphelinsFournisseurs > 0) {
                $this->error("\n❌ PROBLÈME IDENTIFIÉ:");
                $this->error("   Des règlements existent encore alors que toutes les factures ont été supprimées!");
                $this->error("   Ces règlements orphelins causent des calculs incorrects.");

                $this->info("\n🔧 SOLUTIONS POSSIBLES:");
                $this->info("   1. Supprimer tous les règlements orphelins");
                $this->info("   2. Corriger la logique de calcul pour ignorer les règlements orphelins");
                $this->info("   3. Ajouter des contraintes de clé étrangère pour éviter ce problème");
            } else {
                $this->info("\n✅ Aucun problème détecté - les calculs devraient être corrects");
            }
        }

        return 0;
    }
}
