import HistoryTable from './HistoryTable';

export default function HistoryModal({
    historyFacture,
    setHistoryFacture,
    loadingHistory,
    history,
    startEdit,
    form,
    openHistory
}) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold flex items-center justify-between">
                    <span>Historique des paiements - {historyFacture.numero_facture}</span>
                    <button
                        className="text-sm p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        onClick={() => setHistoryFacture(null)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    {loadingHistory ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Montant facture</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">{parseFloat(historyFacture.montant_total).toFixed(2)} DHS</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total réglé</div>
                                    <div className="text-xl font-bold text-green-600 dark:text-green-400">{parseFloat(history.reduce((s, r) => s + parseFloat(r.montant_paye || 0), 0)).toFixed(2)} DHS</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Reste à payer</div>
                                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{parseFloat(historyFacture.reste_a_payer).toFixed(2)} DHS</div>
                                </div>
                            </div>

                            <HistoryTable
                                history={history}
                                startEdit={startEdit}
                                form={form}
                                historyFacture={historyFacture}
                                openHistory={openHistory}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
