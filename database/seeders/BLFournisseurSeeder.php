<?php

namespace Database\Seeders;

use App\Models\BLFournisseur;
use App\Models\BLFournisseurDetail;
use App\Models\Fournisseur;
use App\Models\Produit;
use Illuminate\Database\Seeder;

class BLFournisseurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fournisseurs = Fournisseur::all();
        $produits = Produit::all();

        if ($fournisseurs->isEmpty() || $produits->isEmpty()) {
            $this->command->error('Veuillez d\'abord exécuter FournisseurSeeder et ProduitSeeder !');
            return;
        }

        // Créer des bons de livraison pour chaque fournisseur
        foreach ($fournisseurs as $fournisseur) {
            // Créer 2-3 BL par fournisseur
            for ($i = 1; $i <= rand(2, 3); $i++) {
                $bl = BLFournisseur::create([
                    'fournisseur_id' => $fournisseur->id,
                    'numero_bl' => 'BL-' . str_pad($fournisseur->id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'date_bl' => now()->subDays(rand(1, 30)),
                ]);

                // Ajouter 3-6 produits par BL
                $nbProduits = rand(3, 6);
                $produitsSelectionnes = $produits->random($nbProduits);

                foreach ($produitsSelectionnes as $produit) {
                    $quantite = rand(5, 50);
                    $prix_unitaire = $produit->prix_vente; // Utiliser prix_vente au lieu de prix_unitaire
                    $montant_bl = $quantite * $prix_unitaire;

                    BLFournisseurDetail::create([
                        'b_l_fournisseur_id' => $bl->id,
                        'produit_id' => $produit->id,
                        'quantite' => $quantite,
                        'prix_unitaire' => $prix_unitaire,
                        'montant_bl' => $montant_bl,
                    ]);
                }
            }
        }

        $this->command->info('Bons de livraison fournisseurs créés avec succès !');
    }
}
