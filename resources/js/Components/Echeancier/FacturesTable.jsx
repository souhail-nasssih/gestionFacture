export default function FacturesTable({
    filteredFactures,
    getStatusBadge,
    setSelectedFacture,
    setEditingId,
    form,
    openHistory,
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                N° Facture
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Client/Fournisseur
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date Facture
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date d'échéance
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Montant Total
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Montant Payé
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Reste à Payer
                            </th>

                            {/* Statut column with min width */}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32 min-w-[120px]">
                                Statut
                            </th>

                            {/* Actions column with min width */}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-36 min-w-[140px]">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredFactures.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={10}
                                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Aucune facture trouvée.
                                </td>
                            </tr>
                        ) : (
                            filteredFactures.map((f, index) => (
                                <tr
                                    key={`facture-${f.id}-${index}`}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {f.numero_facture}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                f.type === "client"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-purple-100 text-purple-800"
                                            }`}
                                        >
                                            {f.type === "client"
                                                ? "Client"
                                                : "Fournisseur"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                        {f.nom_entite}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                        {f.date_facture}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                        <div>{f.date_echeance}</div>
                                        {f.statut === "En retard" && (
                                            <div className="text-xs text-red-500">
                                                Dépassée
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                                        {parseFloat(f.montant_total).toFixed(2)}{" "}
                                        DHS
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                                        {parseFloat(f.montant_regle).toFixed(2)}{" "}
                                        DHS
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {parseFloat(
                                                f.reste_a_payer
                                            ).toFixed(2)}{" "}
                                            DHS
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                            <div
                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                style={{
                                                    width: `${
                                                        (f.montant_regle /
                                                            f.montant_total) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center w-32 min-w-[120px]">
                                        {getStatusBadge(f)}
                                    </td>
                                    <td className="px-4 py-4 text-center space-x-1 w-36 min-w-[140px]">
                                        {f.reste_a_payer > 0 && (
                                            <button
                                                onClick={() => {
                                                    setSelectedFacture(f);
                                                    setEditingId(null);
                                                    form.clearErrors();
                                                    form.setData({
                                                        ...form.data,
                                                        facture_id: f.id,
                                                        montant_paye:
                                                            f.reste_a_payer,
                                                        type_reglement:
                                                            "espèces",
                                                        date_reglement:
                                                            new Date()
                                                                .toISOString()
                                                                .slice(0, 10),
                                                        date_reglement_at:
                                                            new Date().toISOString(),
                                                        numero_reglement: "",
                                                        numero_cheque: "",
                                                        banque_nom: "",
                                                        iban_rib: "",
                                                        reference_paiement: "",
                                                        infos_reglement: {},
                                                    });
                                                }}
                                                title="Régler la facture"
                                                className="inline-flex items-center justify-center w-8 h-8 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openHistory(f)}
                                            title="Voir l'historique des paiements"
                                            className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
