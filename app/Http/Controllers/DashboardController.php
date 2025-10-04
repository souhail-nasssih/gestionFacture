<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use App\Models\Produit;
use App\Models\Reglement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistiques principales
        $stats = $this->getMainStats();

        // Top clients par chiffre d'affaires
        $topClients = $this->getTopClients();

        // Produits en rupture de stock
        $produitsStockBas = $this->getProduitsStockBas();

        // Factures récentes
        $facturesRecentes = $this->getFacturesRecentes();

        // Évolution du chiffre d'affaires (optionnel pour l'instant)
        $evolutionCA = $this->getEvolutionCA();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'topClients' => $topClients,
            'produitsStockBas' => $produitsStockBas,
            'facturesRecentes' => $facturesRecentes,
            'evolutionCA' => $evolutionCA,
        ]);
    }

    private function getMainStats()
    {
        // Chiffre d'affaires total (toutes les factures clients)
        $chiffreAffaires = FactureClient::sum('montant_total');

        // Calculer les créances clients de manière plus simple
        $facturesClients = FactureClient::with(['reglements', 'client'])->get();
        $creancesClients = 0;
        $facturesEnRetard = 0;

        foreach ($facturesClients as $facture) {
            $montantRegle = $facture->reglements->where('type', 'client')->sum('montant_paye');
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);
            $creancesClients += $resteAPayer;

            // Vérifier si la facture est en retard
            if ($resteAPayer > 0) {
                $delai = $facture->client->delai_paiement ?? 0;
                $dateEcheance = Carbon::parse($facture->date_facture)->addDays((int)$delai);

                if ($dateEcheance->isPast()) {
                    $facturesEnRetard++;
                }
            }
        }

        // Dettes fournisseurs (factures non payées)
        $facturesFournisseurs = FactureFournisseur::with('reglements')->get();
        $dettesFournisseurs = 0;

        foreach ($facturesFournisseurs as $facture) {
            $montantRegle = $facture->reglements->where('type', 'fournisseur')->sum('montant_paye');
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);
            $dettesFournisseurs += $resteAPayer;
        }

        // Trésorerie nette (créances - dettes)
        $tresorerieNette = $creancesClients - $dettesFournisseurs;

        // Nombre total de clients
        $totalClients = Client::count();

        // Factures du mois en cours
        $facturesCeMois = FactureClient::whereMonth('date_facture', Carbon::now()->month)
            ->whereYear('date_facture', Carbon::now()->year)
            ->count();

        // Produits en rupture de stock
        $produitsEnRupture = Produit::whereColumn('stock', '<=', 'seuil_alerte')->count();

        return [
            'chiffreAffaires' => $chiffreAffaires,
            'creancesClients' => $creancesClients,
            'dettesFournisseurs' => $dettesFournisseurs,
            'tresorerieNette' => $tresorerieNette,
            'totalClients' => $totalClients,
            'facturesCeMois' => $facturesCeMois,
            'facturesEnRetard' => $facturesEnRetard,
            'produitsEnRupture' => $produitsEnRupture,
        ];
    }

    private function getTopClients($limit = 5)
    {
        return Client::withCount('factures')
            ->withSum('factures', 'montant_total')
            ->orderBy('factures_sum_montant_total', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'nom' => $client->nom,
                    'factures_count' => $client->factures_count,
                    'montant_total_factures' => $client->factures_sum_montant_total ?? 0,
                ];
            });
    }

    private function getProduitsStockBas($limit = 5)
    {
        return Produit::whereColumn('stock', '<=', 'seuil_alerte')
            ->orderBy('stock', 'asc')
            ->limit($limit)
            ->get(['id', 'nom', 'reference', 'stock', 'seuil_alerte']);
    }

    private function getFacturesRecentes($limit = 10)
    {
        return FactureClient::with('client')
            ->orderBy('date_facture', 'desc')
            ->limit($limit)
            ->get(['id', 'numero_facture', 'date_facture', 'montant_total', 'statut_paiement', 'client_id']);
    }

    private function getEvolutionCA()
    {
        // Évolution du CA sur les 6 derniers mois
        $evolution = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $ca = FactureClient::whereMonth('date_facture', $date->month)
                ->whereYear('date_facture', $date->year)
                ->sum('montant_total');

            $evolution[] = [
                'mois' => $date->format('M Y'),
                'ca' => $ca,
            ];
        }

        return $evolution;
    }
}
