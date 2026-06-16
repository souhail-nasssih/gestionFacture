# 📄 GestionFacture

Application web de gestion de facturation permettant la création, le suivi et l'administration des factures, clients et paiements.

---

## 🚀 Présentation

GestionFacture est une application conçue pour simplifier la gestion commerciale des entreprises et des indépendants.

Elle permet de créer des factures professionnelles, gérer les clients, suivre les paiements et générer des statistiques de vente.

---

## ✨ Fonctionnalités

### 👥 Gestion des clients

- Ajout de clients
- Modification des informations
- Historique des factures
- Recherche avancée

### 📄 Gestion des factures

- Création de factures
- Modification et suppression
- Numérotation automatique
- Statuts des factures

### 💰 Gestion des paiements

- Factures payées
- Factures impayées
- Paiements partiels
- Historique des règlements

### 📦 Gestion des produits

- Création des produits
- Gestion des prix
- Gestion du stock
- Catégorisation

### 📊 Tableau de bord

- Chiffre d'affaires
- Nombre de factures
- Factures en attente
- Statistiques globales

### 🔐 Gestion des utilisateurs

- Authentification sécurisée
- Gestion des rôles
- Contrôle des permissions

---

## 🛠️ Technologies utilisées

### Frontend

- React.js
- Bootstrap
- Axios

### Backend

- Laravel
- PHP 8+

### Base de données

- MySQL

---

## 📂 Structure du projet

```bash
gestionFacture/
│
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
├── resources/
├── routes/
├── storage/
├── tests/
│
├── composer.json
├── package.json
└── README.md
```

---

## ⚙️ Installation

### Cloner le projet

```bash
git clone https://github.com/souhail-nasssih/gestionFacture.git
cd gestionFacture
```

### Installer les dépendances Laravel

```bash
composer install
```

### Configurer l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

### Configurer la base de données

Modifier :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_facture
DB_USERNAME=root
DB_PASSWORD=
```

Puis :

```bash
php artisan migrate --seed
```

### Lancer l'application

```bash
php artisan serve
```

---

## 📊 Fonctionnalités principales

| Module | Description |
|----------|------------|
| Clients | Gestion complète des clients |
| Produits | Gestion du catalogue |
| Factures | Création et suivi |
| Paiements | Gestion des règlements |
| Dashboard | Statistiques et rapports |
| Utilisateurs | Gestion des accès |

---

## 🔒 Sécurité

- Authentification sécurisée
- Validation des données
- Protection CSRF
- Gestion des permissions

---

## 📸 Captures d'écran

### Tableau de bord

Ajouter une capture ici.

### Gestion des clients

Ajouter une capture ici.

### Gestion des factures

Ajouter une capture ici.

### Statistiques

Ajouter une capture ici.

---

## 🎯 Objectifs du projet

- Digitaliser le processus de facturation
- Réduire les erreurs de gestion
- Centraliser les données commerciales
- Améliorer le suivi financier
- Automatiser certaines tâches administratives

---

## 👨‍💻 Auteur

**Souhail NASSIH**

Développeur Full Stack

GitHub :

https://github.com/souhail-nasssih

---

## 📄 Licence

Projet développé à des fins professionnelles.

© 2026 Souhail NASSIH
