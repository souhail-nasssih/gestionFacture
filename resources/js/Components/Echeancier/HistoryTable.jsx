export default function HistoryTable({ history, startEdit, form, historyFacture, openHistory }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">N° règlement</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Détails</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {history.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                Aucun règlement enregistré.
                            </td>
                        </tr>
                    )}
                    {history.map((r, index) => {
                        const infos = typeof r.infos_reglement === 'string'
                            ? JSON.parse(r.infos_reglement)
                            : (r.infos_reglement || {});

                        return (
                            <tr key={`reglement-${r.id}-${index}`}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {r.date_reglement_at
                                        ? (r.date_reglement_at.includes('T')
                                            ? `${r.date_reglement_at.split('T')[0]} ${r.date_reglement_at.split('T')[1].substring(0,5)}`
                                            : r.date_reglement_at)
                                        : r.date_reglement}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {r.type_reglement}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">{parseFloat(r.montant_paye).toFixed(2)} DHS</td>
                                <td className="px-4 py-3">{r.numero_reglement || '-'}</td>
                                <td className="px-4 py-3 max-w-xs truncate">
                                    {r.type_reglement === 'chèque'
                                        ? `Chèque ${infos.numero_cheque || ''} - ${infos.banque_nom || ''}`.trim()
                                        : r.type_reglement === 'virement'
                                            ? `${infos.banque_nom || ''} ${infos.iban_rib || ''} ${infos.reference_paiement || ''}`.trim()
                                            : '-'}
                                </td>
                                <td className="px-4 py-3 text-center space-x-1">
                                    <button
                                        title="Modifier le règlement"
                                        className="inline-flex items-center justify-center w-7 h-7 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                                        onClick={() => startEdit(r)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        title="Supprimer le règlement"
                                        className="inline-flex items-center justify-center w-7 h-7 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        onClick={() => {
                                            if (!confirm('Supprimer ce règlement ?')) return;
                                            form.delete(route('reglements.destroy', r.id), {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    openHistory(historyFacture);
                                                    router.reload();
                                                },
                                            });
                                        }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
