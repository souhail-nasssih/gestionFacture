<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = [
            [
                'nom' => 'GARAGE CENTRAL',
                'adresse' => '67, Rue Ibn Sina, Casablanca',
                'telephone' => '0522000101',
                'email' => 'contact@garage-central.ma',
                'delai_paiement' => 30,
            ],
            [
                'nom' => 'AUTO SERVICE PLUS',
                'adresse' => '23, Boulevard Mohammed V, Rabat',
                'telephone' => '0537000101',
                'email' => 'info@auto-service-plus.ma',
                'delai_paiement' => 30,
            ],
            [
                'nom' => 'CARROSSERIE MODERNE',
                'adresse' => '89, Avenue Hassan II, Tanger',
                'telephone' => '0539000101',
                'email' => 'contact@carrosserie-moderne.ma',
                'delai_paiement' => 30,
            ],
            [
                'nom' => 'MECANIQUE EXPRESS',
                'adresse' => '34, Rue Ibn Khaldoun, Fès',
                'telephone' => '0535000101',
                'email' => 'info@mecanique-express.ma',
                'delai_paiement' => 30,
            ],
            [
                'nom' => 'ATELIER AUTOMOBILE',
                'adresse' => '56, Boulevard Mohammed VI, Marrakech',
                'telephone' => '0524000101',
                'email' => 'contact@atelier-auto.ma',
                'delai_paiement' => 30,
            ],
        ];

        foreach ($clients as $client) {
            Client::create($client);
        }

        $this->command->info('Clients créés avec succès !');
    }
}
