# 📅 Système de Notifications - Dates d'Échéance

## 📋 Vue d'ensemble

Le système de notifications pour les dates d'échéance a été intégré pour alerter automatiquement les utilisateurs lorsque des factures arrivent à échéance ou sont en retard de paiement.

## 🚀 Fonctionnalités

### ✅ Notifications Automatiques
- **Factures échues** : Alerte quand une facture dépasse sa date d'échéance
- **Échéances proches** : Alerte quand une facture arrive à échéance dans les 3 prochains jours
- **Support client et fournisseur** : Gestion des factures clients et fournisseurs

### ✅ Types de Notifications

#### 🚨 Factures Échues (`due_date.client` / `due_date.fournisseur`)
- **Déclencheur** : Date d'échéance dépassée ET montant restant > 0
- **Icône** : 🚨 (alerte urgente)
- **Couleur** : Rouge
- **Contenu** : Numéro de facture, montant restant, nombre de jours de retard

#### 📅 Échéances Proches (`due_date.upcoming.client` / `due_date.upcoming.fournisseur`)
- **Déclencheur** : Date d'échéance dans les 3 prochains jours ET montant restant > 0
- **Icône** : 📅 (calendrier)
- **Couleur** : Bleu
- **Contenu** : Numéro de facture, montant restant, nombre de jours restants

## 🔧 Configuration Technique

### Services
- **`NotificationService`** : Méthodes `checkDueDates()` et `checkUpcomingDueDates()`
- **`DueDateNotification`** : Classe de notification Laravel standard

### Commande Artisan
- **`notifications:check-due-dates`** : Commande pour vérifier les dates d'échéance
  - `--user=ID` : Notifier un utilisateur spécifique
  - `--upcoming` : Vérifier seulement les échéances proches

### Planification
- **Quotidienne** : Vérification complète à 9h00
- **Biquotidienne** : Vérification des échéances proches à 9h00 et 15h00

## 📊 Base de Données

### Tables Utilisées
- **`facture_clients`** : Factures clients avec `date_echeance`
- **`facture_fournisseurs`** : Factures fournisseurs avec `date_echeance`
- **`reglements`** : Paiements pour calculer le montant restant
- **`app_notifications`** : Stockage des notifications

### Logique de Vérification
```sql
-- Factures échues
WHERE date_echeance <= NOW() 
AND montant_total > SUM(montant_paye)

-- Échéances proches
WHERE date_echeance > NOW() 
AND date_echeance <= NOW() + INTERVAL 3 DAY
AND montant_total > SUM(montant_paye)
```

## 🎯 Utilisation

### Pour les Utilisateurs
1. **Voir les notifications** : Cliquer sur l'icône de cloche dans la barre de navigation
2. **Informations détaillées** : Chaque notification affiche :
   - Numéro de facture
   - Date d'échéance
   - Montant restant
   - Nombre de jours de retard ou restants
3. **Action rapide** : Bouton "Voir la facture" pour accéder directement à la facture
4. **Marquer comme lu** : Cliquer sur l'icône ✓
5. **Supprimer** : Cliquer sur l'icône poubelle

### Pour les Développeurs

#### Exécution Manuelle
```bash
# Vérification complète
php artisan notifications:check-due-dates

# Vérification des échéances proches seulement
php artisan notifications:check-due-dates --upcoming

# Notifier un utilisateur spécifique
php artisan notifications:check-due-dates --user=1
```

#### Planification Automatique
```bash
# Démarrer le scheduler Laravel
php artisan schedule:work

# Ou configurer un cron job
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

#### Intégration dans le Code
```php
use App\Services\NotificationService;

// Vérifier les dates d'échéance
$notifications = NotificationService::checkDueDates($userId);

// Vérifier les échéances proches
$upcomingNotifications = NotificationService::checkUpcomingDueDates($userId);
```

## 🎨 Interface Utilisateur

### Composant React
- **`NotificationCenter`** : Gestion complète des notifications
- **Icônes** : AlertCircle pour échéances, Calendar pour proches
- **Couleurs** : Rouge pour échéances, bleu pour proches
- **Actions** : Navigation directe vers les factures

### Affichage des Notifications
```
🚨 Facture client échue
Facture FC-2024-001 en retard de 5 jour(s)
Facture: FC-2024-001
Date d'échéance: 15/01/2024
Montant restant: 1,500.00 DHS
En retard de 5 jour(s)
[Voir la facture →]
```

## 🔄 Flux de Fonctionnement

1. **Planification** → Le scheduler Laravel exécute la commande
2. **Vérification** → Recherche des factures échues et proches
3. **Création** → Génération des notifications dans la base de données
4. **Affichage** → Le composant React récupère et affiche les notifications
5. **Actions** → L'utilisateur peut marquer comme lu, supprimer, ou voir la facture

## ⚙️ Configuration Avancée

### Modifier les Seuils
```php
// Dans NotificationService::checkUpcomingDueDates()
$upcomingDate = now()->addDays(3)->toDateString(); // Changer 3 jours
```

### Personnaliser les Messages
```php
// Dans NotificationService
$message = "Facture {$facture->numero_facture} " . 
    ($daysOverdue > 0 ? "en retard de {$daysOverdue} jour(s)" : "arrive à échéance");
```

### Ajouter de Nouveaux Types
1. Créer une nouvelle méthode dans `NotificationService`
2. Ajouter le type dans `NotificationCenter.jsx`
3. Configurer l'icône et la couleur appropriées

## 🚨 Dépannage

### Problèmes Courants
- **Notifications non envoyées** : Vérifier que le scheduler fonctionne
- **Données incorrectes** : Vérifier les relations entre factures et règlements
- **Interface non mise à jour** : Vérifier les appels API dans le composant React

### Commandes de Debug
```bash
# Voir les tâches planifiées
php artisan schedule:list

# Tester la commande
php artisan notifications:check-due-dates -v

# Vérifier les notifications en base
php artisan tinker
>>> App\Models\AppNotification::latest()->take(5)->get()
```

## 📈 Métriques et Monitoring

### Statistiques Utiles
- Nombre de notifications envoyées par jour
- Types de notifications les plus fréquents
- Utilisateurs les plus notifiés
- Factures les plus souvent en retard

### Logs
- Les commandes Artisan génèrent des logs dans `storage/logs/laravel.log`
- Utiliser `php artisan pail` pour surveiller en temps réel

## 🔐 Sécurité

### Bonnes Pratiques
- Les notifications sont liées aux utilisateurs authentifiés
- Validation des données avant création des notifications
- Protection CSRF sur les appels API
- Limitation du nombre de notifications par utilisateur

---

**Note** : Ce système s'intègre parfaitement avec le système de notifications existant pour les stocks bas et les ruptures de stock.
