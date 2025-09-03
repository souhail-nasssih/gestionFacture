<?php

namespace Database\Seeders;

use App\Models\BLFournisseur;
use App\Models\FactureFournisseur;
use App\Models\Fournisseur;
use Illuminate\Database\Seeder;

class FactureFournisseurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fournisseurs = Fournisseur::all();

        if ($fournisseurs->isEmpty()) {
            $this->command->error('Veuillez d\'abord exécuter FournisseurSeeder !');
            return;
        }

        foreach ($fournisseurs as $fournisseur) {
            // Récupérer les BL non facturés de ce fournisseur
            $blsNonFactures = BLFournisseur::where('fournisseur_id', $fournisseur->id)
                ->whereNull('facture_fournisseur_id')
                ->get();

            if ($blsNonFactures->count() > 0) {
                // Créer une facture pour ce fournisseur
                $facture = FactureFournisseur::create([
                    'fournisseur_id' => $fournisseur->id,
                    'numero_facture' => 'FC' . str_pad($fournisseur->id, 5, '0', STR_PAD_LEFT) . '-' . date('y'),
                    'date_facture' => now()->subDays(rand(1, 15)),
                    'montant_total' => 0, // Sera calculé après
                    'statut_paiement' => 'en_attente',
                ]);

                // Calculer le montant total et associer les BL
                $montantTotal = 0;
                foreach ($blsNonFactures->take(rand(1, 3)) as $bl) {
                    $montantBL = $bl->details->sum(function($detail) {
                        return $detail->quantite * $detail->prix_unitaire;
                    });

                    $montantTotal += $montantBL;

                    // Associer le BL à la facture
                    $bl->update(['facture_fournisseur_id' => $facture->id]);
                }

                // Mettre à jour le montant total de la facture
                $facture->update(['montant_total' => $montantTotal]);
            }
        }

        $this->command->info('Factures fournisseurs créées avec succès !');
    }
}
