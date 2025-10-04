<?php

namespace App\Console\Commands;

use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use App\Models\Reglement;
use Illuminate\Console\Command;

class CleanOrphanReglements extends Command
{
    protected $signature = 'dashboard:clean-orphan-reglements {--dry-run : Show what would be deleted without actually deleting}';
    protected $description = 'Clean orphan reglements that reference non-existent factures';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No data will be deleted');
        } else {
            $this->warn('⚠️  LIVE MODE - Data will be permanently deleted!');
            if (!$this->confirm('Are you sure you want to proceed?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $this->info('🧹 Cleaning orphan reglements...');

        // Trouver les règlements clients orphelins
        $reglementsOrphelinsClients = Reglement::where('type', 'client')
            ->whereNotIn('facture_id', FactureClient::pluck('id'))
            ->get();

        $this->info("📊 Found {$reglementsOrphelinsClients->count()} orphan client reglements");

        if ($reglementsOrphelinsClients->count() > 0) {
            $totalMontantClients = $reglementsOrphelinsClients->sum('montant_paye');
            $this->info("   Total amount: " . number_format($totalMontantClients, 2) . " MAD");

            if (!$dryRun) {
                Reglement::where('type', 'client')
                    ->whereNotIn('facture_id', FactureClient::pluck('id'))
                    ->delete();
                $this->info("✅ Deleted {$reglementsOrphelinsClients->count()} orphan client reglements");
            }
        }

        // Trouver les règlements fournisseurs orphelins
        $reglementsOrphelinsFournisseurs = Reglement::where('type', 'fournisseur')
            ->whereNotIn('facture_id', FactureFournisseur::pluck('id'))
            ->get();

        $this->info("📊 Found {$reglementsOrphelinsFournisseurs->count()} orphan supplier reglements");

        if ($reglementsOrphelinsFournisseurs->count() > 0) {
            $totalMontantFournisseurs = $reglementsOrphelinsFournisseurs->sum('montant_paye');
            $this->info("   Total amount: " . number_format($totalMontantFournisseurs, 2) . " MAD");

            if (!$dryRun) {
                Reglement::where('type', 'fournisseur')
                    ->whereNotIn('facture_id', FactureFournisseur::pluck('id'))
                    ->delete();
                $this->info("✅ Deleted {$reglementsOrphelinsFournisseurs->count()} orphan supplier reglements");
            }
        }

        $totalOrphans = $reglementsOrphelinsClients->count() + $reglementsOrphelinsFournisseurs->count();

        if ($totalOrphans == 0) {
            $this->info("✅ No orphan reglements found - database is clean!");
        } else {
            if ($dryRun) {
                $this->info("🔍 DRY RUN: Would delete {$totalOrphans} orphan reglements");
                $this->info("   Run without --dry-run to actually delete them");
            } else {
                $this->info("✅ Successfully cleaned {$totalOrphans} orphan reglements");
                $this->info("   Your dashboard treasury calculation should now be correct!");
            }
        }

        return 0;
    }
}
