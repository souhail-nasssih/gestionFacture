<?php

namespace App\Http\Controllers;

use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EcheancierController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'client');

        if ($type === 'fournisseur') {
            $factures = FactureFournisseur::with('fournisseur')
                ->get()
                ->map(function ($f) {
                    $f->montant_regle = $f->reglements()->sum('montant_paye');
                    $f->reste_a_payer = max(0, $f->montant_total - $f->montant_regle);
                    // Utiliser la date_echeance stockée si présente; sinon la calculer depuis delai_paiement fournisseur
                    if (isset($f->date_echeance) && $f->date_echeance) {
                        $dateEcheance = $f->date_echeance;
                    } else {
                        $delai = (int)($f->fournisseur->delai_paiement ?? 0);
                        $dateEcheance = \Carbon\Carbon::parse($f->date_facture)->addDays($delai)->toDateString();
                        $f->date_echeance = $dateEcheance;
                    }
                    $f->date_echeance = $dateEcheance;
                    $f->en_retard = isset($f->date_echeance) && $f->reste_a_payer > 0 && $f->date_echeance < now()->toDateString();
                    $f->statut_affiche = $f->reste_a_payer <= 0 ? 'Encaissée' : ($f->en_retard ? 'Échue' : 'En attente');
                    $f->dernier_reglement = $f->reglements()->latest('date_reglement')->first();
                    return $f;
                })
                ->sortBy('date_echeance')
                ->values();
        } else {
            $type = 'client';
            $factures = FactureClient::with('client')
                ->get()
                ->map(function ($f) {
                    $f->montant_regle = $f->reglements()->sum('montant_paye');
                    $f->reste_a_payer = max(0, $f->montant_total - $f->montant_regle);
                    $delai = $f->client->delai_paiement ?? 0;
                    $f->date_echeance = \Carbon\Carbon::parse($f->date_facture)->addDays((int)$delai)->toDateString();
                    $f->en_retard = isset($f->date_echeance) && $f->reste_a_payer > 0 && $f->date_echeance < now()->toDateString();
                    $f->statut_affiche = $f->reste_a_payer <= 0 ? 'Encaissée' : ($f->en_retard ? 'Échue' : 'En attente');
                    $f->dernier_reglement = $f->reglements()->latest('date_reglement')->first();
                    return $f;
                })
                ->sortBy('date_echeance')
                ->values();
        }

        return Inertia::render('Echeancier', [
            'type' => $type,
            'factures' => $factures,
            'modesPaiement' => ['espèces', 'virement', 'chèque'],
        ]);
    }
}


