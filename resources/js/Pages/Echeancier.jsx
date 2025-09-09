import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Echeancier({ type, factures, modesPaiement }) {
    const [selectedType, setSelectedType] = useState(type || 'client');
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [historyFacture, setHistoryFacture] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showOverdueBanner, setShowOverdueBanner] = useState(false);
    const [overdueCount, setOverdueCount] = useState(0);
    const [nearestOverdue, setNearestOverdue] = useState(null);
    const [activeTab, setActiveTab] = useState('toutes'); // Nouvel état pour les onglets

    const form = useForm({
        facture_id: '',
        type: selectedType,
        montant_paye: '',
        type_reglement: 'espèces',
        date_reglement: new Date().toISOString().slice(0,10),
        numero_reglement: '',
        numero_cheque: '',
        banque_nom: '',
        iban_rib: '',
        reference_paiement: '',
    });

    useEffect(()=>{
        form.setData('type', selectedType);
    }, [selectedType]);

    const reloadWithType = (t) => {
        window.location.href = route('echeancier.index', { type: t });
    };

    // Simple reminder notification for overdue invoices
    useEffect(() => {
        if (!Array.isArray(factures)) return;
        const overdue = factures.filter(f => f.statut_affiche === 'Échue');
        setOverdueCount(overdue.length);
        if (overdue.length > 0) {
            // find most overdue by date
            const sorted = [...overdue].sort((a,b)=> (a.date_echeance||'') > (b.date_echeance||'') ? 1 : -1);
            setNearestOverdue(sorted[0]);
            const snoozeKey = `ech_overdue_snooze_${selectedType}`;
            const snoozeUntil = localStorage.getItem(snoozeKey);
            const now = Date.now();
            if (!snoozeUntil || Number(snoozeUntil) < now) {
                setShowOverdueBanner(true);
                // Try browser notification once per snooze
                if ("Notification" in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('Factures échues', { body: `${overdue.length} facture(s) à relancer` });
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then((perm)=>{
                            if (perm === 'granted') {
                                new Notification('Factures échues', { body: `${overdue.length} facture(s) à relancer` });
                            }
                        });
                    }
                }
            }
        } else {
            setShowOverdueBanner(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [factures, selectedType]);

    function snoozeReminder(hours = 24) {
        const until = Date.now() + hours * 60 * 60 * 1000;
        localStorage.setItem(`ech_overdue_snooze_${selectedType}`, String(until));
        setShowOverdueBanner(false);
    }

    function openHistory(facture) {
        setHistoryFacture(facture);
        setLoadingHistory(true);
        fetch(route('reglements.byFacture', { type: selectedType, id: facture.id }))
            .then(r => r.json())
            .then(data => {
                setHistory((data || []).sort((a,b)=> (a.date_reglement||'') > (b.date_reglement||'') ? 1 : -1));
                setLoadingHistory(false);
            });
    }

    function renderInfos(r) {
        if (!r?.infos_reglement) return '-';
        try {
            const info = typeof r.infos_reglement === 'string' ? JSON.parse(r.infos_reglement) : r.infos_reglement;
            if (r.type_reglement === 'chèque') {
                return `Chèque ${info.numero_cheque || ''} - ${info.banque_nom || ''}`.trim();
            }
            if (r.type_reglement === 'virement') {
                return `${info.banque_nom || ''} ${info.iban_rib || ''} ${info.reference_paiement || ''}`.trim();
            }
            return '-';
        } catch (e) {
            return '-';
        }
    }

    function startEdit(r) {
        setEditingId(r.id);
        setSelectedFacture(historyFacture);
        form.setData({
            facture_id: r.facture_id,
            type: selectedType,
            montant_paye: r.montant_paye,
            type_reglement: r.type_reglement,
            date_reglement: r.date_reglement,
            numero_reglement: r.numero_reglement || '',
            numero_cheque: r.infos_reglement?.numero_cheque || '',
            banque_nom: r.infos_reglement?.banque_nom || '',
            iban_rib: r.infos_reglement?.iban_rib || '',
            reference_paiement: r.infos_reglement?.reference_paiement || '',
        });
    }

    function removeReglement(r) {
        if (!confirm('Supprimer ce règlement ?')) return;
        form.delete(route('reglements.destroy', r.id), {
            preserveScroll: true,
            onSuccess: () => { openHistory(historyFacture); reloadWithType(selectedType); },
        });
    }

    // Fonction pour déterminer le statut visuel d'une facture
    const getStatusBadge = (facture) => {
        const reste = Number(facture.reste_a_payer || 0);
        
        if (reste === 0) {
            return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Payée</span>;
        } else if (reste < Number(facture.montant_total || 0)) {
            return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Partiel</span>;
        } else {
            // Vérifier si la date d'échéance est dépassée
            const today = new Date();
            const echeance = new Date(facture.date_echeance);
            if (echeance < today) {
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">En retard</span>;
            }
            return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">En attente</span>;
        }
    };

    // Filtrer les factures selon l'onglet actif
    const filteredFactures = factures.filter(facture => {
        const reste = Number(facture.reste_a_payer || 0);
        
        if (activeTab === 'en-attente') {
            return reste > 0;
        } else if (activeTab === 'payees') {
            return reste === 0;
        } else if (activeTab === 'retard') {
            const today = new Date();
            const echeance = new Date(facture.date_echeance);
            return reste > 0 && echeance < today;
        }
        return true;
    });

    return (
        <AuthenticatedLayout header={'Échéancier'}>
            <div className="space-y-6">
                {showOverdueBanner && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded flex items-start justify-between">
                        <div className="pr-4">
                            <div className="font-semibold">Rappel: {overdueCount} facture(s) échue(s)</div>
                            {nearestOverdue && (
                                <div className="text-sm mt-1">
                                    Plus ancienne: {nearestOverdue.numero_facture} (échéance {nearestOverdue.date_echeance})
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={()=>reloadWithType(selectedType)} className="px-2 py-1 text-xs rounded bg-indigo-600 text-white">Voir</button>
                            <button onClick={()=>snoozeReminder(24)} className="px-2 py-1 text-xs rounded border">Me rappeler demain</button>
                            <button onClick={()=>setShowOverdueBanner(false)} className="px-2 py-1 text-xs rounded border">Fermer</button>
                        </div>
                    </div>
                )}
                {/* En-tête avec sélecteur de type */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gestion des échéances</h2>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <label className="font-medium text-gray-700 dark:text-gray-300">Type:</label>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button 
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${selectedType === 'client' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'}`}
                                    onClick={() => {setSelectedType('client'); reloadWithType('client')}}
                                >
                                    Clients
                                </button>
                                <button 
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${selectedType === 'fournisseur' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'}`}
                                    onClick={() => {setSelectedType('fournisseur'); reloadWithType('fournisseur')}}
                                >
                                    Fournisseurs
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredFactures.length} facture(s) {activeTab === 'en-attente' ? 'en attente' : activeTab === 'payees' ? 'payée(s)' : 'en retard'}
                        </div>
                    </div>
                </div>

                {/* Onglets de filtrage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('toutes')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${activeTab === 'toutes' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Toutes
                            </button>
                            <button
                                onClick={() => setActiveTab('en-attente')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${activeTab === 'en-attente' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                En attente
                            </button>
                            <button
                                onClick={() => setActiveTab('payees')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${activeTab === 'payees' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Payées
                            </button>
                            <button
                                onClick={() => setActiveTab('retard')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${activeTab === 'retard' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                En retard
                            </button>
                        </nav>
                    </div>

                    {/* Tableau des factures avec TOUS les attributs */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° Facture</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom Fournisseur</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Facture</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date d'échéance</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant Facture</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant payé Client</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant payé Fournisseur</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reste à payer</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mode paiement</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° Règlement</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date de Règlement</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredFactures.length === 0 && (
                                    <tr>
                                        <td colSpan={14} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Aucune facture {activeTab === 'en-attente' ? 'en attente' : activeTab === 'payees' ? 'payée' : 'en retard'}.
                                        </td>
                                    </tr>
                                )}
                                {filteredFactures.map((f)=> {
                                    const last = f.dernier_reglement;
                                    const reste = Number(f.reste_a_payer || 0);
                                    const montantTotal = Number(f.montant_total || 0);
                                    const pourcentagePaye = ((montantTotal - reste) / montantTotal) * 100;
                                    
                                    return (
                                        <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{f.numero_facture}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{f.client?.nom || ''}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{f.fournisseur?.nom || ''}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{f.date_facture}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                <div>{f.date_echeance}</div>
                                                {new Date(f.date_echeance) < new Date() && reste > 0 && (
                                                    <div className="text-xs text-red-500">Dépassée</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                                                {montantTotal.toFixed(2)} €
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                                                {selectedType === 'client' ? Number(f.montant_regle||0).toFixed(2) : '0.00'} €
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                                                {selectedType === 'fournisseur' ? Number(f.montant_regle||0).toFixed(2) : '0.00'} €
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{reste.toFixed(2)} €</div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                                    <div 
                                                        className="bg-indigo-600 h-1.5 rounded-full" 
                                                        style={{ width: `${pourcentagePaye}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center text-gray-900 dark:text-white">{last?.type_reglement || '-'}</td>
                                            <td className="px-4 py-4 text-sm text-center text-gray-900 dark:text-white">{last?.numero_reglement || '-'}</td>
                                            <td className="px-4 py-4 text-sm text-center text-gray-900 dark:text-white">{(last?.date_reglement_at ? (last.date_reglement_at.includes('T') ? `${last.date_reglement_at.split('T')[0]} ${last.date_reglement_at.split('T')[1].substring(0,5)}` : last.date_reglement_at) : (last?.date_reglement || '-'))}</td>
                                            <td className="px-4 py-4 text-center">
                                                {getStatusBadge(f)}
                                            </td>
                                            <td className="px-4 py-4 text-center space-x-2">
                                                {reste > 0 && (
                                                    <button 
                                                        onClick={() => { 
                                                            setSelectedFacture(f); 
                                                            setEditingId(null); 
                                                            form.clearErrors(); 
                                                            form.setData({ ...form.data, facture_id: f.id, type: selectedType, montant_paye: f.reste_a_payer, type_reglement: 'espèces', numero_reglement: '', numero_cheque: '', banque_nom: '', iban_rib: '', reference_paiement: '' }); 
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals pour historique et règlement (inchangés mais avec amélioration visuelle) */}
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
                                                <div className="text-xl font-bold text-gray-900 dark:text-white">{Number(historyFacture?.montant_total || 0).toFixed(2)} €</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Total réglé</div>
                                                <div className="text-xl font-bold text-green-600 dark:text-green-400">{Number(history.reduce((s, r) => s + Number(r.montant_paye || 0), 0)).toFixed(2)} €</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Reste à payer</div>
                                                <div className="text-xl font-bold text-red-600 dark:text-red-400">{Number((historyFacture?.montant_total || 0) - history.reduce((s, r) => s + Number(r.montant_paye || 0), 0)).toFixed(2)} €</div>
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
                                                    {history.map((r) => (
                                                        <tr key={r.id}>
                                                            <td className="px-4 py-3 whitespace-nowrap">{r.date_reglement}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                                    {r.type_reglement}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-medium">{Number(r.montant_paye).toFixed(2)} €</td>
                                                            <td className="px-4 py-3">{r.numero_reglement || '-'}</td>
                                                            <td className="px-4 py-3 max-w-xs truncate">{renderInfos(r)}</td>
                                                            <td className="px-4 py-3 text-center space-x-2">
                                                                <button 
                                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                                    onClick={() => startEdit(r)}
                                                                >
                                                                    Modifier
                                                                </button>
                                                                <button 
                                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                                    onClick={() => removeReglement(r)}
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
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
                                if (editingId) {
                                    form.put(route('reglements.update', editingId), { 
                                        onSuccess: () => { 
                                            setSelectedFacture(null); 
                                            setEditingId(null); 
                                            if (historyFacture) openHistory(historyFacture); 
                                        } 
                                    });
                                } else {
                                    form.post(route('reglements.store'), { 
                                        onSuccess: () => { 
                                            setSelectedFacture(null); 
                                            if (historyFacture) openHistory(historyFacture); 
                                        } 
                                    });
                                }
                            }} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Montant à payer</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                        value={form.data.montant_paye} 
                                        onChange={e => form.setData('montant_paye', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type de règlement</label>
                                    <select 
                                        className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                        value={form.data.type_reglement} 
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            form.setData({ ...form.data, type_reglement: v, numero_cheque: '', banque_nom: '', iban_rib: '', reference_paiement: '' });
                                        }}
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
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Banque</label>
                                            <input 
                                                type="text" 
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                                value={form.data.banque_nom} 
                                                onChange={e => form.setData('banque_nom', e.target.value)} 
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
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">IBAN/RIB</label>
                                            <input 
                                                type="text" 
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                                value={form.data.iban_rib} 
                                                onChange={e => form.setData('iban_rib', e.target.value)} 
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Référence</label>
                                            <input 
                                                type="text" 
                                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                                value={form.data.reference_paiement} 
                                                onChange={e => form.setData('reference_paiement', e.target.value)} 
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