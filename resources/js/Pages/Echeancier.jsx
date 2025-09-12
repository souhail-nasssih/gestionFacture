import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function Echeancier({ factures: initialFactures, filters, modesPaiement }) {
    const [allFactures, setAllFactures] = useState(initialFactures);
    const [selectedType, setSelectedType] = useState(filters?.type || 'tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [historyFacture, setHistoryFacture] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Filtrer les factures en fonction du type sélectionné et du terme de recherche
    const filteredFactures = useMemo(() => {
        let filtered = allFactures;

        // Filtrer par type
        if (selectedType !== 'tous') {
            filtered = filtered.filter(f => f.type === selectedType);
        }

        // Filtrer par terme de recherche
        if (searchTerm) {
            const term = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(f =>
                f.numero_facture.toLowerCase().includes(term) ||
                (f.nom_entite && f.nom_entite.toLowerCase().includes(term))
            );
        }

        return filtered;
    }, [allFactures, selectedType, searchTerm]);

    // Mettre à jour l'URL quand le type change
    useEffect(() => {
        const params = {};
        if (selectedType !== 'tous') params.type = selectedType;

        router.get(route('echeancier.index'), params, {
            preserveState: true,
            replace: true,
        });
    }, [selectedType]);

    const form = useForm({
        facture_id: '',
        type_reglement: 'espèces',
        montant_paye: '',
        date_reglement: new Date().toISOString().slice(0,10),
        date_reglement_at: new Date().toISOString(),
        numero_reglement: '',
        numero_cheque: '',
        banque_nom: '',
        iban_rib: '',
        reference_paiement: '',
        infos_reglement: {},
    });

    useEffect(() => {
        if (form.data.type_reglement === 'espèces') {
            form.setData({
                numero_cheque: '',
                banque_nom: '',
                iban_rib: '',
                reference_paiement: '',
                infos_reglement: {},
            });
        }
    }, [form.data.type_reglement]);

    function openHistory(facture) {
        setHistoryFacture(facture);
        setLoadingHistory(true);
        fetch(route('reglements.byFacture', { id: facture.id }))
            .then(r => r.json())
            .then(data => {
                setHistory((data || []).sort((a,b) => (a.date_reglement||'') > (b.date_reglement||'') ? 1 : -1));
                setLoadingHistory(false);
            });
    }

    function startEdit(r) {
        setEditingId(r.id);
        setSelectedFacture(historyFacture);

        const infos = typeof r.infos_reglement === 'string'
            ? JSON.parse(r.infos_reglement)
            : (r.infos_reglement || {});

        form.setData({
            facture_id: r.facture_id,
            type_reglement: r.type_reglement,
            montant_paye: r.montant_paye,
            date_reglement: r.date_reglement,
            date_reglement_at: r.date_reglement_at,
            numero_reglement: r.numero_reglement || '',
            numero_cheque: infos.numero_cheque || '',
            banque_nom: infos.banque_nom || '',
            iban_rib: infos.iban_rib || '',
            reference_paiement: infos.reference_paiement || '',
            infos_reglement: infos,
        });
    }

    function submitReglement() {
        // Préparer les infos de règlement selon le type
        const infos = {};
        if (form.data.type_reglement === 'chèque') {
            infos.numero_cheque = form.data.numero_cheque;
            infos.banque_nom = form.data.banque_nom;
        } else if (form.data.type_reglement === 'virement') {
            infos.banque_nom = form.data.banque_nom;
            infos.iban_rib = form.data.iban_rib;
            infos.reference_paiement = form.data.reference_paiement;
        }

        form.setData('infos_reglement', infos);

        if (editingId) {
            form.put(route('reglements.update', editingId), {
                onSuccess: () => {
                    setSelectedFacture(null);
                    setEditingId(null);
                    if (historyFacture) openHistory(historyFacture);
                    router.reload();
                }
            });
        } else {
            form.post(route('reglements.store'), {
                onSuccess: () => {
                    setSelectedFacture(null);
                    if (historyFacture) openHistory(historyFacture);
                    router.reload();
                }
            });
        }
    }

    function getStatusBadge(facture) {
        switch(facture.statut) {
            case 'Payée':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Payée</span>;
            case 'Partiellement payée':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Partiel</span>;
            case 'En retard':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">En retard</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">En attente</span>;
        }
    }

    return (
        <AuthenticatedLayout header={'Échéancier'}>
            <div className="space-y-6">
                {/* En-tête avec filtres */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gestion des échéances</h2>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="font-medium text-gray-700 dark:text-gray-300">Filtrer par type:</label>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${selectedType === 'tous' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'}`}
                                    onClick={() => setSelectedType('tous')}
                                >
                                    Tous
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${selectedType === 'client' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'}`}
                                    onClick={() => setSelectedType('client')}
                                >
                                    Clients
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${selectedType === 'fournisseur' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'}`}
                                    onClick={() => setSelectedType('fournisseur')}
                                >
                                    Fournisseurs
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Rechercher par nom ou n° facture"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tableau des factures */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° Facture</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client/Fournisseur</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Facture</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date d'échéance</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant Total</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant Payé</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reste à Payer</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredFactures.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Aucune facture trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFactures.map((f, index) => (
                                        <tr key={`facture-${f.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{f.numero_facture}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${f.type === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {f.type === 'client' ? 'Client' : 'Fournisseur'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{f.nom_entite}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{f.date_facture}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                <div>{f.date_echeance}</div>
                                                {f.statut === 'En retard' && (
                                                    <div className="text-xs text-red-500">Dépassée</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                                                {parseFloat(f.montant_total).toFixed(2)} DHS
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                                                {parseFloat(f.montant_regle).toFixed(2)} DHS
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{parseFloat(f.reste_a_payer).toFixed(2)} DHS</div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-indigo-600 h-1.5 rounded-full"
                                                        style={{ width: `${(f.montant_regle / f.montant_total) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {getStatusBadge(f)}
                                            </td>
                                            <td className="px-4 py-4 text-center space-x-2">
                                                {f.reste_a_payer > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedFacture(f);
                                                            setEditingId(null);
                                                            form.clearErrors();
                                                            form.setData({
                                                                ...form.data,
                                                                facture_id: f.id,
                                                                montant_paye: f.reste_a_payer,
                                                                type_reglement: 'espèces',
                                                                date_reglement: new Date().toISOString().slice(0,10),
                                                                date_reglement_at: new Date().toISOString(),
                                                                numero_reglement: '',
                                                                numero_cheque: '',
                                                                banque_nom: '',
                                                                iban_rib: '',
                                                                reference_paiement: '',
                                                                infos_reglement: {}
                                                            });
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Régler
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openHistory(f)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Historique
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals pour historique et règlement */}
                {historyFacture && (
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
                                                                <td className="px-4 py-3 text-center space-x-2">
                                                                    <button
                                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                                        onClick={() => startEdit(r)}
                                                                    >
                                                                        Modifier
                                                                    </button>
                                                                    <button
                                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
                                                                        Supprimer
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedFacture && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold flex items-center justify-between">
                                <span>{editingId ? 'Modifier le' : 'Nouveau'} règlement - {selectedFacture.numero_facture}</span>
                                <button
                                    className="text-sm p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    onClick={() => { setSelectedFacture(null); setEditingId(null); }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                submitReglement();
                            }} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Montant à payer</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={selectedFacture.reste_a_payer}
                                        className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={form.data.montant_paye}
                                        onChange={e => form.setData('montant_paye', e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Reste à payer: {parseFloat(selectedFacture.reste_a_payer).toFixed(2)} DHS
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type de règlement</label>
                                    <select
                                        className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={form.data.type_reglement}
                                        onChange={(e) => form.setData('type_reglement', e.target.value)}
                                        required
                                    >
                                        {modesPaiement.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>

                                {form.data.type_reglement === 'chèque' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">N° Chèque</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={form.data.numero_cheque}
                                                onChange={e => form.setData('numero_cheque', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Banque</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={form.data.banque_nom}
                                                onChange={e => form.setData('banque_nom', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {form.data.type_reglement === 'virement' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Banque</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={form.data.banque_nom}
                                                onChange={e => form.setData('banque_nom', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">IBAN/RIB</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={form.data.iban_rib}
                                                onChange={e => form.setData('iban_rib', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Référence</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={form.data.reference_paiement}
                                                onChange={e => form.setData('reference_paiement', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date de paiement</label>
                                        <input
                                            type="date"
                                            className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={form.data.date_reglement}
                                            onChange={e => {
                                                form.setData('date_reglement', e.target.value);
                                                // keep datetime in sync if time already set
                                                const time = form.data.date_reglement_at?.split('T')[1] || '00:00:00';
                                                form.setData('date_reglement_at', `${e.target.value}T${time}`);
                                            }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Heure</label>
                                        <input
                                            type="time"
                                            className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={(form.data.date_reglement_at && form.data.date_reglement_at.split('T')[1]?.substring(0,5)) || ''}
                                            onChange={e => {
                                                const time = e.target.value || '00:00';
                                                const date = form.data.date_reglement || new Date().toISOString().slice(0,10);
                                                form.setData('date_reglement_at', `${date}T${time}:00`);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">N° Règlement (optionnel)</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={form.data.numero_reglement}
                                        onChange={e => form.setData('numero_reglement', e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedFacture(null); setEditingId(null); }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {editingId ? 'Modifier' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
