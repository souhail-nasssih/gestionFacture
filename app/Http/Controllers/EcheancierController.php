<?php

namespace App\Http\Controllers;

use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use App\Models\Client;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EcheancierController extends Controller
{
    public function getFacture(Request $request, $id)
    {
        $type = $request->query('type');

        if ($type === 'client') {
            $facture = FactureClient::with('client')->find($id);
            if (!$facture) {
                return response()->json(['error' => 'Facture client non trouvée'], 404);
            }

            $facture->montant_regle = $facture->reglements()->sum('montant_paye');
            $facture->reste_a_payer = max(0, $facture->montant_total - $facture->montant_regle);
            $facture->type = 'client';
            $facture->nom_entite = $facture->client->nom ?? '';

            // Calculer la date d'échéance
            $delai = $facture->client->delai_paiement ?? 0;
            $dateEcheance = Carbon::parse($facture->date_facture)->addDays((int)$delai)->toDateString();
            $facture->date_echeance = $dateEcheance;
            $facture->en_retard = $facture->reste_a_payer > 0 && $dateEcheance < now()->toDateString();

            if ($facture->reste_a_payer <= 0) {
                $facture->statut = 'Payée';
            } elseif ($facture->reste_a_payer < $facture->montant_total) {
                $facture->statut = 'Partiellement payée';
            } else {
                $facture->statut = $facture->en_retard ? 'En retard' : 'En attente';
            }

        } else if ($type === 'fournisseur') {
            $facture = FactureFournisseur::with('fournisseur')->find($id);
            if (!$facture) {
                return response()->json(['error' => 'Facture fournisseur non trouvée'], 404);
            }

            $facture->montant_regle = $facture->reglements()->sum('montant_paye');
            $facture->reste_a_payer = max(0, $facture->montant_total - $facture->montant_regle);
            $facture->type = 'fournisseur';
            $facture->nom_entite = $facture->fournisseur->nom ?? '';

            // Calculer la date d'échéance
            $delai = $facture->fournisseur->delai_paiement ?? 0;
            $dateEcheance = Carbon::parse($facture->date_facture)->addDays((int)$delai)->toDateString();
            $facture->date_echeance = $dateEcheance;
            $facture->en_retard = $facture->reste_a_payer > 0 && $dateEcheance < now()->toDateString();

            if ($facture->reste_a_payer <= 0) {
                $facture->statut = 'Payée';
            } elseif ($facture->reste_a_payer < $facture->montant_total) {
                $facture->statut = 'Partiellement payée';
            } else {
                $facture->statut = $facture->en_retard ? 'En retard' : 'En attente';
            }
        } else {
            return response()->json(['error' => 'Type de facture invalide'], 400);
        }

        return response()->json($facture);
    }

    public function index(Request $request)
    {
        $type = $request->get('type', 'tous');

        // Récupérer toutes les factures (clients et fournisseurs)
        $facturesClients = FactureClient::with('client')
            ->get()
            ->map(function ($f) {
                $f->montant_regle = $f->reglements()->sum('montant_paye');
                $f->reste_a_payer = max(0, $f->montant_total - $f->montant_regle);

                // Calculer la date d'échéance
                $delai = $f->client->delai_paiement ?? 0;
                $dateEcheance = Carbon::parse($f->date_facture)->addDays((int)$delai)->toDateString();
                $f->date_echeance = $dateEcheance;

                // Déterminer le statut
                $f->en_retard = $f->reste_a_payer > 0 && $dateEcheance < now()->toDateString();

                if ($f->reste_a_payer <= 0) {
                    $f->statut = 'Payée';
                } elseif ($f->reste_a_payer < $f->montant_total) {
                    $f->statut = 'Partiellement payée';
                } else {
                    $f->statut = $f->en_retard ? 'En retard' : 'En attente';
                }

                $f->type = 'client';
                $f->nom_entite = $f->client->nom ?? '';
                $f->dernier_reglement = $f->reglements()->latest('date_reglement')->first();

                return $f;
            });

        $facturesFournisseurs = FactureFournisseur::with('fournisseur')
            ->get()
            ->map(function ($f) {
                $f->montant_regle = $f->reglements()->sum('montant_paye');
                $f->reste_a_payer = max(0, $f->montant_total - $f->montant_regle);

                // Calculer la date d'échéance
                if (isset($f->date_echeance) && $f->date_echeance) {
                    $dateEcheance = $f->date_echeance;
                } else {
                    $delai = (int)($f->fournisseur->delai_paiement ?? 0);
                    $dateEcheance = Carbon::parse($f->date_facture)->addDays($delai)->toDateString();
                    $f->date_echeance = $dateEcheance;
                }

                // Déterminer le statut
                $f->en_retard = $f->reste_a_payer > 0 && $dateEcheance < now()->toDateString();

                if ($f->reste_a_payer <= 0) {
                    $f->statut = 'Payée';
                } elseif ($f->reste_a_payer < $f->montant_total) {
                    $f->statut = 'Partiellement payée';
                } else {
                    $f->statut = $f->en_retard ? 'En retard' : 'En attente';
                }

                $f->type = 'fournisseur';
                $f->nom_entite = $f->fournisseur->nom ?? '';
                $f->dernier_reglement = $f->reglements()->latest('date_reglement')->first();

                return $f;
            });

        // Fusionner les deux collections
        $factures = $facturesClients->concat($facturesFournisseurs);

        // Appliquer le filtre par type
        if ($type === 'client') {
            $factures = $factures->where('type', 'client');
        } elseif ($type === 'fournisseur') {
            $factures = $factures->where('type', 'fournisseur');
        }

        // Trier par date d'échéance
        $factures = $factures->sortBy('date_echeance')->values();

        return Inertia::render('Echeancier/Index', [
            'type' => $type,
            'factures' => $factures,
            'filters' => [
                'type' => $type,
            ],
            'modesPaiement' => ['espèces', 'virement', 'chèque'],
        ]);
    }
}
