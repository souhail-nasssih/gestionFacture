export function getStatusBadge(facture) {
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
