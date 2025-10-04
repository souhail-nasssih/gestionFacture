import React, { useState, useEffect } from 'react';

export default function FacturesTable({
  filteredFactures,
  getStatusBadge,
  setSelectedFacture,
  setEditingId,
  form,
  openHistory,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Détection de la taille d'écran
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Fonction de tri
  const sortedFactures = [...filteredFactures].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Demander le tri
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Toggle l'expansion d'une ligne
  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Formater la monnaie
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' DHS';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('numero_facture')}
              >
                <div className="flex items-center">
                  N° Facture
                  {sortConfig.key === 'numero_facture' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('type')}
              >
                <div className="flex items-center">
                  Type
                  {sortConfig.key === 'type' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('nom_entite')}
              >
                <div className="flex items-center">
                  Client/Fournisseur
                  {sortConfig.key === 'nom_entite' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date_facture')}
              >
                <div className="flex items-center">
                  Date Facture
                  {sortConfig.key === 'date_facture' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date_echeance')}
              >
                <div className="flex items-center">
                  Date d'échéance
                  {sortConfig.key === 'date_echeance' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('montant_total')}
              >
                <div className="flex items-center justify-end">
                  Montant Total
                  {sortConfig.key === 'montant_total' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('montant_regle')}
              >
                <div className="flex items-center justify-end">
                  Montant Payé
                  {sortConfig.key === 'montant_regle' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('reste_a_payer')}
              >
                <div className="flex items-center justify-end">
                  Reste à Payer
                  {sortConfig.key === 'reste_a_payer' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32 min-w-[120px]">
                Statut
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-36 min-w-[140px]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedFactures.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Aucune facture trouvée.
                </td>
              </tr>
            ) : (
              sortedFactures.map((f, index) => {
                // use a composite key (id + index) to guarantee uniqueness even if f.id repeats
                const rowKey = `${f.id ?? 'noid'}-${index}`;
                return (
                  <React.Fragment key={`facture-${rowKey}`}>
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleRowExpansion(f.id || rowKey)}
                          className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {expandedRows.has(f.id || rowKey) ? '▼' : '►'}
                        </button>
                        {f.numero_facture}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          f.type === "client"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
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
                      {formatDate(f.date_facture)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      <div className={f.statut === "En retard" ? "text-red-600 dark:text-red-400" : ""}>
                        {formatDate(f.date_echeance)}
                      </div>
                      {f.statut === "En retard" && (
                        <div className="text-xs text-red-500">
                          Dépassée
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(f.montant_total)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(f.montant_regle)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(f.reste_a_payer)}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{
                            width: `${(f.montant_regle / f.montant_total) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center w-32 min-w-[120px]">
                      {getStatusBadge(f)}
                    </td>
                    <td className="px-4 py-4 text-center space-x-1 w-36 min-w-[140px]">
                      {f.reste_a_payer > 0 && f.statut !== 'Payée' && (
                        <button
                          onClick={() => {
                            setSelectedFacture(f);
                            setEditingId(null);
                            form.clearErrors();
                            form.setData({
                              ...form.data,
                              facture_id: f.id,
                              montant_paye: f.reste_a_payer,
                              type_reglement: "espèces",
                              date_reglement: new Date()
                                .toISOString()
                                .slice(0, 10),
                              date_reglement_at: new Date().toISOString(),
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
                  {expandedRows.has(f.id || rowKey) && (
                    <tr key={`expanded-${rowKey}`} className="bg-gray-50 dark:bg-gray-900">
                      <td colSpan={10} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Montant Total:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formatCurrency(f.montant_total)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Montant Payé:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formatCurrency(f.montant_regle)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Reste à Payer:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formatCurrency(f.reste_a_payer)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Progression:</span>
                            <div className="flex items-center mt-1">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-indigo-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${(f.montant_regle / f.montant_total) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                {((f.montant_regle / f.montant_total) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
