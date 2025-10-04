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

        // Calculer les créances clients de manière optimisée
        $creancesClients = $this->calculateCreancesClients();

        // Calculer les dettes fournisseurs de manière optimisée
        $dettesFournisseurs = $this->calculateDettesFournisseurs();

        // Calculer les factures en retard
        $facturesEnRetard = $this->calculateFacturesEnRetard();

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

        // Statistiques supplémentaires
        $caCeMois = FactureClient::whereMonth('date_facture', Carbon::now()->month)
            ->whereYear('date_facture', Carbon::now()->year)
            ->sum('montant_total');

        $caMoisPrecedent = FactureClient::whereMonth('date_facture', Carbon::now()->subMonth()->month)
            ->whereYear('date_facture', Carbon::now()->subMonth()->year)
            ->sum('montant_total');

        $evolutionCAMois = $caMoisPrecedent > 0 ?
            (($caCeMois - $caMoisPrecedent) / $caMoisPrecedent) * 100 : 0;

        // Nombre total de factures
        $totalFactures = FactureClient::count();

        // Montant moyen par facture
        $montantMoyenFacture = $totalFactures > 0 ? $chiffreAffaires / $totalFactures : 0;

        return [
            'chiffreAffaires' => $chiffreAffaires,
            'creancesClients' => $creancesClients,
            'dettesFournisseurs' => $dettesFournisseurs,
            'tresorerieNette' => $tresorerieNette,
            'totalClients' => $totalClients,
            'facturesCeMois' => $facturesCeMois,
            'facturesEnRetard' => $facturesEnRetard,
            'produitsEnRupture' => $produitsEnRupture,
            'caCeMois' => $caCeMois,
            'evolutionCAMois' => round($evolutionCAMois, 2),
            'totalFactures' => $totalFactures,
            'montantMoyenFacture' => round($montantMoyenFacture, 2),
        ];
    }

    /**
     * Calculer les créances clients de manière optimisée
     */
    private function calculateCreancesClients()
    {
        $creancesClients = 0;

        // Récupérer toutes les factures avec leurs règlements en une seule requête
        // Seulement les règlements qui correspondent à des factures existantes
        $factures = FactureClient::withSum(['reglements' => function($query) {
                $query->where('type', 'client');
            }], 'montant_paye')->get();

        foreach ($factures as $facture) {
            $montantRegle = $facture->reglements_sum_montant_paye ?? 0;
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);
            $creancesClients += $resteAPayer;
        }

        return $creancesClients;
    }

    /**
     * Calculer les dettes fournisseurs de manière optimisée
     */
    private function calculateDettesFournisseurs()
    {
        $dettesFournisseurs = 0;

        // Récupérer toutes les factures fournisseurs avec leurs règlements en une seule requête
        // Seulement les règlements qui correspondent à des factures existantes
        $factures = FactureFournisseur::withSum(['reglements' => function($query) {
                $query->where('type', 'fournisseur');
            }], 'montant_paye')->get();

        foreach ($factures as $facture) {
            $montantRegle = $facture->reglements_sum_montant_paye ?? 0;
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);
            $dettesFournisseurs += $resteAPayer;
        }

        return $dettesFournisseurs;
    }

    /**
     * Calculer les factures en retard
     */
    private function calculateFacturesEnRetard()
    {
        $facturesEnRetard = 0;

        // Récupérer les factures avec leurs règlements et clients
        $factures = FactureClient::with(['reglements', 'client'])->get();

        foreach ($factures as $facture) {
            $montantRegle = $facture->reglements->where('type', 'client')->sum('montant_paye');
            $resteAPayer = max(0, $facture->montant_total - $montantRegle);

            // Si il reste de l'argent à payer, vérifier si la facture est en retard
            if ($resteAPayer > 0) {
                $dateEcheance = null;

                // Priorité à la date d'échéance de la facture
                if ($facture->date_echeance) {
                    $dateEcheance = Carbon::parse($facture->date_echeance);
                } else {
                    // Sinon utiliser le délai de paiement du client
                    $delai = $facture->client->delai_paiement ?? 0;
                    $dateEcheance = Carbon::parse($facture->date_facture)->addDays((int)$delai);
                }

                if ($dateEcheance && $dateEcheance->isPast()) {
                    $facturesEnRetard++;
                }
            }
        }

        return $facturesEnRetard;
    }

    private function getTopClients($limit = 5)
    {
        return Client::withCount('factures')
            ->withSum('factures', 'montant_total')
            ->having('factures_sum_montant_total', '>', 0) // Seulement les clients avec des factures
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
            ->get(['id', 'numero_facture', 'date_facture', 'montant_total', 'statut_paiement', 'client_id'])
            ->map(function ($facture) {
                // Calculer le statut de paiement réel basé sur les règlements
                $montantRegle = $facture->reglements()->where('type', 'client')->sum('montant_paye');
                $resteAPayer = max(0, $facture->montant_total - $montantRegle);

                if ($resteAPayer <= 0) {
                    $statutPaiement = 'payée';
                } elseif ($montantRegle > 0) {
                    $statutPaiement = 'partiellement payée';
                } else {
                    $statutPaiement = 'en attente';
                }

                return [
                    'id' => $facture->id,
                    'numero_facture' => $facture->numero_facture,
                    'date_facture' => $facture->date_facture,
                    'montant_total' => $facture->montant_total,
                    'statut_paiement' => $statutPaiement,
                    'client_id' => $facture->client_id,
                    'client' => $facture->client,
                ];
            });
    }

    private function getEvolutionCA()
    {
        // Évolution du CA sur les 6 derniers mois avec une requête optimisée
        $evolution = [];

        // Récupérer toutes les données en une seule requête
        $caData = FactureClient::selectRaw('
                YEAR(date_facture) as year,
                MONTH(date_facture) as month,
                SUM(montant_total) as total_ca
            ')
            ->where('date_facture', '>=', Carbon::now()->subMonths(5)->startOfMonth())
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy(function ($item) {
                return $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT);
            });

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $key = $date->year . '-' . $date->format('m');
            $ca = $caData->get($key)->total_ca ?? 0;

            $evolution[] = [
                'mois' => $date->format('M Y'),
                'ca' => $ca,
            ];
        }

        return $evolution;
    }
}
