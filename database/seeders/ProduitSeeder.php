<?php

namespace Database\Seeders;

use App\Models\Produit;
use Illuminate\Database\Seeder;

class ProduitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $produits = [
            [
                'nom' => 'Cutter GM',
                'description' => 'Cutter grande taille pour usage industriel',
                'prix_achat' => 20.00,
                'prix_vente' => 28.00,
                'stock' => 100,
                'seuil_alerte' => 10,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Cutter PM',
                'description' => 'Cutter petite taille pour usage professionnel',
                'prix_achat' => 10.00,
                'prix_vente' => 13.00,
                'stock' => 150,
                'seuil_alerte' => 15,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Lames Cutter GM',
                'description' => 'Lames de rechange pour cutter grande taille',
                'prix_achat' => 1.50,
                'prix_vente' => 2.00,
                'stock' => 500,
                'seuil_alerte' => 50,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Cheville Metal 10*120mm',
                'description' => 'Cheville métallique 10mm x 120mm pour fixation',
                'prix_achat' => 1.80,
                'prix_vente' => 2.40,
                'stock' => 300,
                'seuil_alerte' => 30,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Cheville Metal 12*120mm',
                'description' => 'Cheville métallique 12mm x 120mm pour fixation',
                'prix_achat' => 2.60,
                'prix_vente' => 3.40,
                'stock' => 250,
                'seuil_alerte' => 25,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Meche Inox 10mm',
                'description' => 'Mèche inoxydable 10mm pour métal',
                'prix_achat' => 18.00,
                'prix_vente' => 24.93,
                'stock' => 80,
                'seuil_alerte' => 8,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Meche Inox 12mm',
                'description' => 'Mèche inoxydable 12mm pour métal',
                'prix_achat' => 32.00,
                'prix_vente' => 42.00,
                'stock' => 60,
                'seuil_alerte' => 6,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Meche Inox 8mm',
                'description' => 'Mèche inoxydable 8mm pour métal',
                'prix_achat' => 16.00,
                'prix_vente' => 22.00,
                'stock' => 90,
                'seuil_alerte' => 9,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Meche Inox 3mm',
                'description' => 'Mèche inoxydable 3mm pour métal',
                'prix_achat' => 4.00,
                'prix_vente' => 5.40,
                'stock' => 200,
                'seuil_alerte' => 20,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Meche Inox 4mm',
                'description' => 'Mèche inoxydable 4mm pour métal',
                'prix_achat' => 5.00,
                'prix_vente' => 6.40,
                'stock' => 180,
                'seuil_alerte' => 18,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Vis à tête fraisée 6mm',
                'description' => 'Vis à tête fraisée M6 pour assemblage',
                'prix_achat' => 0.60,
                'prix_vente' => 0.85,
                'stock' => 1000,
                'seuil_alerte' => 100,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Écrou M6',
                'description' => 'Écrou hexagonal M6 pour vis',
                'prix_achat' => 0.30,
                'prix_vente' => 0.45,
                'stock' => 800,
                'seuil_alerte' => 80,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Roulement 6205',
                'description' => 'Roulement à billes 6205 pour applications industrielles',
                'prix_achat' => 35.00,
                'prix_vente' => 45.00,
                'stock' => 50,
                'seuil_alerte' => 5,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Joint O-Ring 20mm',
                'description' => 'Joint torique 20mm en caoutchouc',
                'prix_achat' => 0.80,
                'prix_vente' => 1.20,
                'stock' => 300,
                'seuil_alerte' => 30,
                'unite' => 'Pièce',
            ],
            [
                'nom' => 'Tuyau hydraulique 8mm',
                'description' => 'Tuyau hydraulique haute pression 8mm',
                'prix_achat' => 12.00,
                'prix_vente' => 15.50,
                'stock' => 120,
                'seuil_alerte' => 12,
                'unite' => 'Mètre',
            ],
        ];

        foreach ($produits as $produit) {
            Produit::create($produit);
        }

        $this->command->info('Produits créés avec succès !');
    }
}
