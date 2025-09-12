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

        return Inertia::render('Echeancier', [
            'type' => $type,
            'factures' => $factures,
            'filters' => [
                'type' => $type,
            ],
            'modesPaiement' => ['espèces', 'virement', 'chèque'],
        ]);
    }
}
