import React from "react";
import { Link } from "@inertiajs/react";
import {
    ArrowLeft,
    Calendar,
    Package,
    TrendingUp,
    DollarSign,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Historique({ produit, historique }) {
    const achats = historique ?? []; // utiliser la prop correcte
    console.log("Historique:", historique);
    console.log("Produit:", produit);

    // Calcul des statistiques
    const totalAchat = achats.reduce(
        (total, achat) => total + achat.quantite,
        0
    );
    const depenseTotale = achats.reduce(
        (total, achat) =>
            total + achat.quantite * parseFloat(achat.prix_unitaire),
        0
    );
    const prixMoyen =
        achats.length > 0 ? (depenseTotale / totalAchat).toFixed(2) : 0;

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* En-tête avec bouton de retour */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route("produits.index")}
                                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Historique des achats
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {produit.nom} - #{produit.id}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Stock actuel
                                    </p>
                                    <p
                                        className={`text-lg font-semibold ${
                                            produit.stock > 10
                                                ? "text-green-600 dark:text-green-400"
                                                : produit.stock > 0
                                                ? "text-yellow-600 dark:text-yellow-400"
                                                : "text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {produit.stock} {produit.unite}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques résumées */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Total acheté */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total acheté
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {totalAchat} {produit.unite}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dépense totale */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Dépense totale
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {depenseTotale.toFixed(2)} DHS
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prix d'achat moyen */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Prix d'achat moyen
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {prixMoyen} DHS
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste de l'historique */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Détail des achats
                        </h2>

                        {achats.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Quantité
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Prix unitaire
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Fournisseur
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {achats.map((achat) => (
                                            <tr key={achat.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                            {achat.bon_livraison
                                                                ?.date_bl
                                                                ? new Date(
                                                                      achat.bon_livraison.date_bl
                                                                  ).toLocaleDateString()
                                                                : "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {achat.quantite}{" "}
                                                        {produit.unite}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {parseFloat(
                                                            achat.prix_unitaire
                                                        ).toFixed(2)}{" "}
                                                        DHS
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {(
                                                            achat.quantite *
                                                            parseFloat(
                                                                achat.prix_unitaire
                                                            )
                                                        ).toFixed(2)}{" "}
                                                        DHS
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {achat.bon_livraison
                                                            ?.fournisseur
                                                            ?.nom || "N/A"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aucun achat enregistré pour ce produit.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
