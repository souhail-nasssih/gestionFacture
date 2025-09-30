# Page de Détail Client - Documentation

## Vue d'ensemble

La page de détail client permet d'afficher toutes les informations liées à un client sélectionné, incluant ses factures, règlements, et statistiques financières complètes.

## Fonctionnalités implémentées

### 1. Récupération des données depuis la base de données
- **Route**: `GET /clients/{id}/detail`
- **Contrôleur**: `ClientController@detail($id)`
- **Données récupérées**:
  - Informations du client (nom, coordonnées, délai de paiement)
  - Toutes les factures du client avec leurs règlements
  - Tous les règlements du client avec leurs factures associées
  - Statistiques financières calculées automatiquement

### 2. Affichage des informations

#### Informations du client
- Nom, téléphone, email, adresse
- Délai de paiement en jours
- Statistiques financières (montant total factures, montant payé, reste à payer)

#### Situation financière
- Montant total des factures
- Montant total payé
- Reste à payer
- Nombre de factures et règlements

#### Tableaux détaillés
- **Tableau des factures**: numéro, dates, statut, montants
- **Tableau des règlements**: numéro, date, type, montant, description, facture associée

### 3. Fonctionnalités supplémentaires

#### Barre de recherche et pagination
- Recherche en temps réel dans chaque tableau
- Pagination avec 10 éléments par page
- Navigation entre les pages

#### Boutons d'export et d'impression
- **Imprimer**: Impression directe de la page actuelle
- **Export PDF**: Génération d'un PDF complet avec toutes les données
- **Export Excel**: Export en format Excel avec plusieurs feuilles

### 4. Techniques utilisées

#### Backend (Laravel)
- **Modèle Client**: Relations avec FactureClient et Reglement
- **Contrôleur**: Méthodes `detail()`, `exportPdf()`, `exportExcel()`
- **Export PDF**: Package `barryvdh/laravel-dompdf`
- **Export Excel**: Package `maatwebsite/excel`

#### Frontend (React + Inertia)
- **Page**: `resources/js/Pages/Client/Detail.jsx`
- **Composants**: Tableaux avec recherche et pagination
- **Design**: Tailwind CSS avec support du mode sombre
- **Navigation**: Onglets pour basculer entre factures et règlements

## Structure des fichiers

### Backend
```
app/
├── Http/Controllers/ClientController.php (méthodes detail, exportPdf, exportExcel)
├── Models/Client.php (relations et calculs financiers)
├── Exports/ClientDetailExport.php (export Excel multi-feuilles)
└── resources/views/pdf/client-detail.blade.php (template PDF)
```

### Frontend
```
resources/js/
├── Pages/Client/Detail.jsx (page principale)
└── Components/Client/constants.jsx (lien vers détail)
```

### Routes
```
routes/web.php
├── GET /clients/{id}/detail (affichage)
├── GET /clients/{id}/export-pdf (export PDF)
└── GET /clients/{id}/export-excel (export Excel)
```

## Utilisation

### Accès à la page
1. Aller sur la liste des clients (`/clients`)
2. Cliquer sur l'icône "Détails" (📄) à côté du client souhaité
3. La page de détail s'ouvre avec toutes les informations

### Navigation
- **Onglet "Situation Factures"**: Affiche toutes les factures du client
- **Onglet "Événements Règlement"**: Affiche tous les règlements du client

### Fonctionnalités d'export
- **Imprimer**: Utilise la fonction d'impression du navigateur
- **PDF**: Télécharge un PDF complet avec toutes les données
- **Excel**: Télécharge un fichier Excel avec 3 feuilles (infos client, factures, règlements)

## Exemple de données affichées

### Client "GARAGE CENTRAL"
- **Téléphone**: 0522000101
- **Email**: contact@garage-central.ma
- **Adresse**: 67, Rue Ibn Sina, Casablanca
- **Délai de paiement**: 30 jours

### Statistiques
- **Montant total factures**: 10,80 €
- **Montant total payé**: 0,00 €
- **Reste à payer**: 10,80 €
- **Nombre de factures**: 1
- **Nombre de règlements**: 0

## Améliorations futures possibles

1. **Filtres avancés**: Par date, montant, statut
2. **Graphiques**: Visualisation des tendances de paiement
3. **Notifications**: Alertes pour factures en retard
4. **Historique**: Suivi des modifications
5. **Export personnalisé**: Choix des colonnes à exporter

## Support technique

Pour toute question ou problème concernant cette fonctionnalité, vérifiez :
1. Que les packages `barryvdh/laravel-dompdf` et `maatwebsite/excel` sont installés
2. Que les relations dans le modèle Client sont correctement définies
3. Que les routes sont bien enregistrées
4. Que les permissions d'écriture sont accordées pour les exports
