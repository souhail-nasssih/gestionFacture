<?php

namespace App\Http\Controllers;

use App\Models\BLClient;
use App\Models\BLFournisseur;
use App\Models\Client;
use App\Models\FactureClient;
use App\Models\FactureFournisseur;
use App\Models\Fournisseur;
use App\Models\Produit;
use App\Models\Reglement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrashController extends Controller
{
    public function index()
    {
        // Récupérer tous les éléments supprimés
        $deletedBLs = BLClient::onlyTrashed()->with(['client', 'facture'])->get();
        $deletedBLFournisseurs = BLFournisseur::onlyTrashed()->with(['fournisseur', 'facture'])->get();
        $deletedFactures = FactureClient::onlyTrashed()->with(['client'])->get();
        $deletedFactureFournisseurs = FactureFournisseur::onlyTrashed()->with(['fournisseur'])->get();
        $deletedClients = Client::onlyTrashed()->get();
        $deletedFournisseurs = Fournisseur::onlyTrashed()->get();
        $deletedProduits = Produit::onlyTrashed()->get();
        $deletedReglements = Reglement::onlyTrashed()->get();

        return inertia('Trash/Index', [
            'deletedBLs' => $deletedBLs,
            'deletedBLFournisseurs' => $deletedBLFournisseurs,
            'deletedFactures' => $deletedFactures,
            'deletedFactureFournisseurs' => $deletedFactureFournisseurs,
            'deletedClients' => $deletedClients,
            'deletedFournisseurs' => $deletedFournisseurs,
            'deletedProduits' => $deletedProduits,
            'deletedReglements' => $deletedReglements,
        ]);
    }

    public function restoreBL($id)
    {
        try {
            DB::beginTransaction();

            $bl = BLClient::onlyTrashed()->findOrFail($id);
            $bl->restore(); // La restauration des détails est automatique grâce au modèle

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "BL Client {$bl->numero_bl} restauré avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function restoreFacture($id)
    {
        try {
            DB::beginTransaction();

            $facture = FactureClient::onlyTrashed()->findOrFail($id);
            $facture->restore();

            // Restaurer aussi les BLs associés
            $facture->bonsLivraison()->onlyTrashed()->restore();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Facture {$facture->numero_facture} restaurée avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function restoreClient($id)
    {
        try {
            DB::beginTransaction();

            $client = Client::onlyTrashed()->findOrFail($id);
            $client->restore();

            // Restaurer aussi les factures et BLs du client
            $client->factures()->onlyTrashed()->restore();
            $client->bonsLivraison()->onlyTrashed()->restore();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Client {$client->nom} restauré avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function restoreProduit($id)
    {
        try {
            $produit = Produit::onlyTrashed()->findOrFail($id);
            $produit->restore();

            return redirect()->route('trash.index')
                ->with('success', "Produit {$produit->nom} restauré avec succès.");

        } catch (\Exception $e) {
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function forceDeleteBL($id)
    {
        try {
            DB::beginTransaction();

            $bl = BLClient::onlyTrashed()->findOrFail($id);
            $numeroBl = $bl->numero_bl;

            // Supprimer définitivement les détails
            $bl->details()->onlyTrashed()->forceDelete();

            // Supprimer définitivement le BL
            $bl->forceDelete();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "BL Client {$numeroBl} supprimé définitivement.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }

    public function forceDeleteFacture($id)
    {
        try {
            DB::beginTransaction();

            $facture = FactureClient::onlyTrashed()->findOrFail($id);
            $numeroFacture = $facture->numero_facture;

            // Supprimer définitivement les BLs associés
            $facture->bonsLivraison()->onlyTrashed()->forceDelete();

            // Supprimer définitivement la facture
            $facture->forceDelete();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Facture {$numeroFacture} supprimée définitivement.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }

    public function forceDeleteClient($id)
    {
        try {
            DB::beginTransaction();

            $client = Client::onlyTrashed()->findOrFail($id);
            $nomClient = $client->nom;

            // Supprimer définitivement les factures et BLs du client
            $client->factures()->onlyTrashed()->forceDelete();
            $client->bonsLivraison()->onlyTrashed()->forceDelete();

            // Supprimer définitivement le client
            $client->forceDelete();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Client {$nomClient} supprimé définitivement.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }

    public function forceDeleteProduit($id)
    {
        try {
            $produit = Produit::onlyTrashed()->findOrFail($id);
            $nomProduit = $produit->nom;

            $produit->forceDelete();

            return redirect()->route('trash.index')
                ->with('success', "Produit {$nomProduit} supprimé définitivement.");

        } catch (\Exception $e) {
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }

    public function emptyTrash()
    {
        try {
            DB::beginTransaction();

            // Supprimer définitivement tous les éléments de la poubelle
            BLClient::onlyTrashed()->forceDelete();
            BLFournisseur::onlyTrashed()->forceDelete();
            FactureClient::onlyTrashed()->forceDelete();
            FactureFournisseur::onlyTrashed()->forceDelete();
            Client::onlyTrashed()->forceDelete();
            Fournisseur::onlyTrashed()->forceDelete();
            Produit::onlyTrashed()->forceDelete();
            Reglement::onlyTrashed()->forceDelete();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', 'Poubelle vidée avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors du vidage de la poubelle : ' . $e->getMessage());
        }
    }

    // Méthodes pour BL Fournisseurs
    public function restoreBLFournisseur($id)
    {
        try {
            DB::beginTransaction();

            $bl = BLFournisseur::onlyTrashed()->findOrFail($id);
            $bl->restore();

            // Restaurer aussi les détails du BL
            $bl->details()->onlyTrashed()->restore();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "BL Fournisseur {$bl->numero_bl} restauré avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function forceDeleteBLFournisseur($id)
    {
        try {
            DB::beginTransaction();

            $bl = BLFournisseur::onlyTrashed()->findOrFail($id);
            $numeroBl = $bl->numero_bl;

            // Supprimer définitivement les détails
            $bl->details()->onlyTrashed()->forceDelete();

            // Supprimer définitivement le BL
            $bl->forceDelete();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "BL Fournisseur {$numeroBl} supprimé définitivement.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }

    // Méthodes pour Factures Fournisseurs
    public function restoreFactureFournisseur($id)
    {
        try {
            DB::beginTransaction();

            $facture = FactureFournisseur::onlyTrashed()->findOrFail($id);
            $facture->restore();

            // Restaurer aussi les BLs associés
            $facture->bonsLivraison()->onlyTrashed()->restore();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Facture Fournisseur {$facture->numero_facture} restaurée avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function forceDeleteFactureFournisseur($id)
    {
        try {
            DB::beginTransaction();

            $facture = FactureFournisseur::onlyTrashed()->findOrFail($id);
            $numeroFacture = $facture->numero_facture;

            // Supprimer définitivement les BLs associés
            $facture->bonsLivraison()->onlyTrashed()->forceDelete();

            // Supprimer définitivement la facture
            $facture->forceDelete();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Facture Fournisseur {$numeroFacture} supprimée définitivement.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }

    // Méthodes pour Fournisseurs
    public function restoreFournisseur($id)
    {
        try {
            DB::beginTransaction();

            $fournisseur = Fournisseur::onlyTrashed()->findOrFail($id);
            $fournisseur->restore();

            // Restaurer aussi les factures et BLs du fournisseur
            $fournisseur->factures()->onlyTrashed()->restore();
            $fournisseur->bonsLivraison()->onlyTrashed()->restore();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Fournisseur {$fournisseur->nom} restauré avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function forceDeleteFournisseur($id)
    {
        try {
            DB::beginTransaction();

            $fournisseur = Fournisseur::onlyTrashed()->findOrFail($id);
            $nomFournisseur = $fournisseur->nom;

            // Supprimer définitivement les factures et BLs du fournisseur
            $fournisseur->factures()->onlyTrashed()->forceDelete();
            $fournisseur->bonsLivraison()->onlyTrashed()->forceDelete();

            // Supprimer définitivement le fournisseur
            $fournisseur->forceDelete();

            DB::commit();

            return redirect()->route('trash.index')
                ->with('success', "Fournisseur {$nomFournisseur} supprimé définitivement.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }

    // Méthodes pour Règlements
    public function restoreReglement($id)
    {
        try {
            $reglement = Reglement::onlyTrashed()->findOrFail($id);
            $reglement->restore();

            return redirect()->route('trash.index')
                ->with('success', "Règlement {$reglement->numero_reglement} restauré avec succès.");

        } catch (\Exception $e) {
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la restauration : ' . $e->getMessage());
        }
    }

    public function forceDeleteReglement($id)
    {
        try {
            $reglement = Reglement::onlyTrashed()->findOrFail($id);
            $numeroReglement = $reglement->numero_reglement;

            $reglement->forceDelete();

            return redirect()->route('trash.index')
                ->with('success', "Règlement {$numeroReglement} supprimé définitivement.");

        } catch (\Exception $e) {
            return redirect()->route('trash.index')
                ->with('error', 'Erreur lors de la suppression définitive : ' . $e->getMessage());
        }
    }
}
