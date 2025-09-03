# 🌱 Guide des Seeders - Données de Test FINDUCARR

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser les seeders pour générer des données de test complètes dans votre application de gestion des factures.

## 📊 Seeders disponibles

### 1. **FournisseurSeeder** - 5 fournisseurs
- SIGNA PLUS (comme dans votre image de facture)
- METAL INDUSTRIE
- CARROSSERIE EXPRESS
- FOURNITURES PRO
- INDUSTRIE MAROC

### 2. **ClientSeeder** - 5 clients
- GARAGE CENTRAL
- AUTO SERVICE PLUS
- CARROSSERIE MODERNE
- MECANIQUE EXPRESS
- ATELIER AUTOMOBILE

### 3. **ProduitSeeder** - 20 produits
- **Outillage** : Cutters, mèches, etc.
- **Fixation** : Chevilles, vis, écrous
- **Mécanique** : Roulements
- **Étanchéité** : Joints O-Ring
- **Hydraulique** : Tuyaux

### 4. **BLFournisseurSeeder** - Bons de livraison
- 2-3 BL par fournisseur
- 3-6 produits par BL
- Quantités et prix réalistes

### 5. **FactureFournisseurSeeder** - Factures
- Factures automatiquement créées
- BL associés aux factures
- Montants calculés automatiquement

## 🚀 Comment utiliser

### **Option 1 : Exécuter tous les seeders d'un coup**
```bash
php artisan db:seed
```

### **Option 2 : Exécuter les seeders individuellement**
```bash
# Dans l'ordre recommandé
php artisan db:seed --class=FournisseurSeeder
php artisan db:seed --class=ClientSeeder
php artisan db:seed --class=ProduitSeeder
php artisan db:seed --class=BLFournisseurSeeder
php artisan db:seed --class=FactureFournisseurSeeder
```

### **Option 3 : Réinitialiser la base et exécuter**
```bash
php artisan migrate:fresh --seed
```

## 📋 Données créées

### **Fournisseurs (5)**
```
✅ SIGNA PLUS - 14, Bd Chefchaouni Q.1, Casablanca
✅ METAL INDUSTRIE - 25, Rue Hassan II, Casablanca
✅ CARROSSERIE EXPRESS - 8, Avenue Mohammed V, Rabat
✅ FOURNITURES PRO - 12, Boulevard Zerktouni, Casablanca
✅ INDUSTRIE MAROC - 45, Rue Ibn Batouta, Tanger
```

### **Clients (5)**
```
✅ GARAGE CENTRAL - 67, Rue Ibn Sina, Casablanca
✅ AUTO SERVICE PLUS - 23, Boulevard Mohammed V, Rabat
✅ CARROSSERIE MODERNE - 89, Avenue Hassan II, Tanger
✅ MECANIQUE EXPRESS - 34, Rue Ibn Khaldoun, Fès
✅ ATELIER AUTOMOBILE - 56, Boulevard Mohammed VI, Marrakech
```

### **Produits (20)**
```
✅ CUTTER-GM - 28.00 DH
✅ CUTTER-PM - 13.00 DH
✅ LAMES-GM - 2.00 DH
✅ CHEVILLE-10-120 - 2.40 DH
✅ CHEVILLE-12-120 - 3.40 DH
✅ MECHE-INOX-10 - 24.93 DH
✅ MECHE-INOX-12 - 42.00 DH
✅ MECHE-INOX-8 - 22.00 DH
✅ MECHE-INOX-3 - 5.40 DH
✅ MECHE-INOX-4 - 6.40 DH
✅ VIS-TETE-FRAISEE-6 - 0.85 DH
✅ ECROU-6 - 0.45 DH
✅ ROULEMENT-6205 - 45.00 DH
✅ JOINT-ORING-20 - 1.20 DH
✅ TUYAU-HYDRAULIQUE-8 - 15.50 DH
```

## 🧪 Test du système d'impression

### **1. Accéder aux factures**
- Allez dans votre interface de gestion des factures
- Vous devriez voir des factures avec des données réalistes

### **2. Tester l'impression**
- Cliquez sur l'icône 🖨️ dans une ligne de facture
- La facture s'ouvre dans un nouvel onglet
- Vérifiez que l'affichage correspond à votre design

### **3. Vérifier les données**
- Les produits correspondent à ceux de votre image
- Les fournisseurs ont des informations complètes
- Les montants sont calculés automatiquement

## 🔧 Personnalisation

### **Modifier les données**
Éditez les fichiers dans `database/seeders/` :
- `FournisseurSeeder.php` - Ajouter/modifier des fournisseurs
- `ClientSeeder.php` - Ajouter/modifier des clients
- `ProduitSeeder.php` - Ajouter/modifier des produits

### **Ajouter de nouveaux seeders**
```bash
php artisan make:seeder NomDuSeeder
```

## 📝 Exemple de données créées

### **Facture SIGNA PLUS**
- Numéro : FC00001-25
- Date : Aujourd'hui - X jours
- Produits : Cutters, mèches, chevilles
- Montant : Calculé automatiquement
- Statut : En attente

### **Structure des données**
```
Fournisseur → BL → Détails → Produits
     ↓
Facture ← BL associés
```

## ⚠️ Notes importantes

1. **Ordre d'exécution** : Respectez l'ordre des seeders
2. **Dépendances** : Les seeders vérifient les données existantes
3. **Base de données** : Assurez-vous que les migrations sont à jour
4. **Données de test** : Ces données sont pour le développement uniquement

## 🎉 Résultat attendu

Après exécution des seeders, vous aurez :
- ✅ 5 fournisseurs avec informations complètes
- ✅ 5 clients avec informations complètes
- ✅ 20 produits avec prix et descriptions
- ✅ Bons de livraison avec détails
- ✅ Factures prêtes pour l'impression
- ✅ Système d'impression testable immédiatement

---

**🚀 Vos seeders sont prêts ! Exécutez `php artisan db:seed` pour commencer.**
