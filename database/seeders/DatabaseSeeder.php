<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Créer l'utilisateur de test seulement s'il n'existe pas déjà
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
            $this->command->info('👤 Utilisateur de test créé');
        } else {
            $this->command->info('👤 Utilisateur de test existe déjà');
        }

        // Exécuter les seeders dans l'ordre
        $this->call([
            FournisseurSeeder::class,
            ClientSeeder::class,
            ProduitSeeder::class,
            BLFournisseurSeeder::class,
            FactureFournisseurSeeder::class,
        ]);

        $this->command->info('🎉 Tous les seeders ont été exécutés avec succès !');
        $this->command->info('📊 Données créées :');
        $this->command->info('   - 5 fournisseurs');
        $this->command->info('   - 5 clients');
        $this->command->info('   - 20 produits');
        $this->command->info('   - Bons de livraison avec détails');
        $this->command->info('   - Factures fournisseurs');
        $this->command->info('');
        $this->command->info('🚀 Vous pouvez maintenant tester le système d\'impression !');
    }
}
