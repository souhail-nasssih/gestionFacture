<?php

namespace Database\Seeders;

use App\Models\Fournisseur;
use Illuminate\Database\Seeder;

class FournisseurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fournisseurs = [
            [
                'nom' => 'SIGNA PLUS',
                'adresse' => '14, Bd Chefchaouni Q.1, Casablanca, ain sbaa',
                'telephone' => '0522000001',
                'email' => 'signaplus@gmail.com',
            ],
            [
                'nom' => 'METAL INDUSTRIE',
                'adresse' => '25, Rue Hassan II, Casablanca',
                'telephone' => '0522000002',
                'email' => 'contact@metalindustrie.ma',
            ],
            [
                'nom' => 'CARROSSERIE EXPRESS',
                'adresse' => '8, Avenue Mohammed V, Rabat',
                'telephone' => '0537000001',
                'email' => 'info@carrosserie-express.ma',
            ],
            [
                'nom' => 'FOURNITURES PRO',
                'adresse' => '12, Boulevard Zerktouni, Casablanca',
                'telephone' => '0522000003',
                'email' => 'contact@fournitures-pro.ma',
            ],
            [
                'nom' => 'INDUSTRIE MAROC',
                'adresse' => '45, Rue Ibn Batouta, Tanger',
                'telephone' => '0539000001',
                'email' => 'info@industrie-maroc.ma',
            ],
        ];

        foreach ($fournisseurs as $fournisseur) {
            Fournisseur::create($fournisseur);
        }

        $this->command->info('Fournisseurs créés avec succès !');
    }
}
