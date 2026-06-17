# 🧾 GestionFacture

<p align="center">
  Application web complète de gestion de facturation permettant aux entreprises de gérer leurs clients, produits, factures, paiements et statistiques depuis une interface moderne.
</p>

---

## 🚀 Présentation

**GestionFacture** est une application Full Stack conçue pour digitaliser et simplifier la gestion commerciale des entreprises.

Elle permet de gérer efficacement :

- Les clients
- Les produits
- Les factures
- Les paiements
- Les utilisateurs
- Les statistiques commerciales

L'objectif principal est de centraliser les opérations de facturation, réduire les erreurs manuelles et améliorer le suivi financier.

---

# ✨ Fonctionnalités

## 👥 Gestion des clients

- Création des clients
- Modification des informations
- Suppression des clients
- Recherche avancée
- Historique des factures associées

---

## 📄 Gestion des factures

- Création des factures
- Ajout de plusieurs produits
- Calcul automatique des montants
- Numérotation automatique
- Modification et suppression
- Gestion des statuts :

  - Payée
  - Impayée
  - Paiement partiel

---

## 📦 Gestion des produits

- Création des produits
- Modification des informations
- Gestion des prix
- Gestion des catégories
- Suivi du stock

---

## 💰 Gestion des paiements

- Enregistrement des paiements
- Paiement complet
- Paiement partiel
- Historique des règlements
- Suivi des factures impayées

---

## 📊 Tableau de bord

Dashboard avec :

- Chiffre d'affaires
- Nombre total de factures
- Revenus générés
- Factures en attente
- Statistiques globales

---

## 🔐 Gestion des utilisateurs

- Authentification sécurisée
- Gestion des rôles
- Gestion des permissions
- Contrôle des accès

---

# 🛠️ Technologies utilisées

## Frontend

- React.js
- Bootstrap
- Axios
- JavaScript ES6+

## Backend

- Laravel
- PHP 8+

## Base de données

- MySQL

## Outils

- Git
- Composer
- NPM

---

# 🏗️ Architecture du projet

```
gestionFacture/

├── app/
│   ├── Models
│   ├── Controllers
│   └── Http

├── database/
│   ├── migrations
│   └── seeders

├── routes/
│   └── api.php

├── resources/

├── public/

├── storage/

├── composer.json
├── package.json
└── README.md
```

---

# ⚙️ Installation

## Cloner le projet

```bash
git clone https://github.com/souhail-nasssih/gestionFacture.git

cd gestionFacture
```

---

# Backend Laravel

Installer les dépendances :

```bash
composer install
```

Créer le fichier environnement :

```bash
cp .env.example .env
```

Générer la clé Laravel :

```bash
php artisan key:generate
```

---

## Configuration Base de données

Modifier le fichier `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_facture
DB_USERNAME=root
DB_PASSWORD=
```

---

Lancer les migrations :

```bash
php artisan migrate --seed
```

---

Démarrer Laravel :

```bash
php artisan serve
```

Backend disponible :

```
http://127.0.0.1:8000
```

---

# Frontend React

Installer les dépendances :

```bash
npm install
```

Lancer l'application :

```bash
npm run dev
```

---

# 📌 Modules du système

| Module | Description |
|---|---|
| Authentification | Connexion et sécurité |
| Clients | Gestion complète des clients |
| Produits | Gestion du catalogue |
| Factures | Création et suivi |
| Paiements | Gestion financière |
| Dashboard | Statistiques |
| Utilisateurs | Gestion des accès |

---

# 🔒 Sécurité

Le projet utilise :

- Validation des données
- Authentification sécurisée
- Protection CSRF
- Middleware Laravel
- Gestion des permissions
- Sécurisation des routes

---

# 📸 Captures d'écran

## Dashboard

Ajouter une capture ici.

---

## Gestion des clients

Ajouter une capture ici.

---

## Gestion des factures

Ajouter une capture ici.

---

## Statistiques

Ajouter une capture ici.

---

# 🎯 Objectifs du projet

- Digitaliser la gestion de facturation
- Centraliser les données commerciales
- Simplifier le suivi financier
- Réduire les erreurs administratives
- Améliorer la productivité

---

# 🚀 Améliorations possibles

- Génération PDF des factures
- Envoi des factures par email
- Export Excel
- Notifications
- Historique des actions
- Graphiques avancés

---

# 👨‍💻 Auteur

**Souhail NASSIH**

Développeur Full Stack

GitHub :

https://github.com/souhail-nasssih

---

# 📄 Licence

Projet développé à des fins professionnelles.

© 2026 Souhail NASSIH
