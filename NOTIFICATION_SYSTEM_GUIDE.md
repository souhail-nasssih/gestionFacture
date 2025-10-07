# 🔔 Système de Notifications - Guide d'Utilisation

## 📋 Vue d'ensemble

Le système de notifications a été implémenté pour alerter automatiquement les utilisateurs lorsque les produits sont en rupture de stock ou en stock bas.

## 🚀 Fonctionnalités

### ✅ Notifications Automatiques
- **Stock Bas** : Alerte quand le stock d'un produit descend en dessous du seuil d'alerte
- **Rupture de Stock** : Alerte quand le stock d'un produit atteint 0

### ✅ Interface Utilisateur
- **Badge de notification** : Affiche le nombre de notifications non lues
- **Panneau de notifications** : Interface déroulante pour voir toutes les notifications
- **Actions** : Marquer comme lu, supprimer, marquer toutes comme lues
- **Design responsive** : Compatible avec le thème sombre/clair

### ✅ Types de Notifications

#### 🟡 Stock Bas (`LowStockNotification`)
- **Déclencheur** : Stock ≤ seuil d'alerte ET stock > 0
- **Icône** : ⚠️ (triangle d'alerte)
- **Couleur** : Jaune
- **Contenu** : Nom du produit, stock actuel, seuil d'alerte

#### 🔴 Rupture de Stock (`OutOfStockNotification`)
- **Déclencheur** : Stock = 0
- **Icône** : 🚨 (alerte urgente)
- **Couleur** : Rouge
- **Contenu** : Nom du produit, référence, stock = 0

## 🔧 Configuration Technique

### Modèles Modifiés
- **`Produit`** : Ajout des événements `updated` et `created` pour déclencher les notifications
- **`User`** : Utilise les notifications Laravel standard

### Contrôleur
- **`NotificationController`** : Gère les API endpoints pour les notifications
  - `GET /api/notifications` : Liste des notifications
  - `GET /api/notifications/unread-count` : Nombre de notifications non lues
  - `POST /api/notifications/{id}/read` : Marquer comme lu
  - `POST /api/notifications/read-all` : Marquer toutes comme lues
  - `DELETE /api/notifications/{id}` : Supprimer une notification

### Composant React
- **`NotificationCenter`** : Composant principal pour l'affichage des notifications
  - Auto-refresh toutes les 30 secondes
  - Gestion des états (lu/non lu)
  - Actions utilisateur (marquer lu, supprimer)

## 📊 Base de Données

### Table `notifications`
- **Structure** : Table Laravel standard pour les notifications
- **Colonnes** : `id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`

## 🎯 Utilisation

### Pour les Utilisateurs
1. **Voir les notifications** : Cliquer sur l'icône de cloche dans la barre de navigation
2. **Marquer comme lu** : Cliquer sur l'icône ✓ à côté d'une notification
3. **Supprimer** : Cliquer sur l'icône poubelle
4. **Marquer toutes comme lues** : Bouton "Tout marquer comme lu"

### Pour les Développeurs
1. **Notifications automatiques** : Se déclenchent lors de la modification du stock
2. **Notifications manuelles** : Utiliser `$user->notify(new NotificationClass($data))`
3. **Personnalisation** : Modifier les seuils dans le modèle `Produit`

## 🔄 Flux de Fonctionnement

1. **Modification du stock** → Événement `updated` déclenché
2. **Vérification des conditions** → Comparaison avec le seuil d'alerte
3. **Envoi de notification** → Création dans la base de données
4. **Affichage en temps réel** → Le composant React récupère les nouvelles notifications
5. **Actions utilisateur** → Marquer comme lu, supprimer, etc.

## 🎨 Personnalisation

### Modifier les Seuils
```php
// Dans le modèle Produit
$produit->seuil_alerte = 10; // Nouveau seuil
```

### Ajouter de Nouveaux Types de Notifications
1. Créer une nouvelle classe de notification
2. Ajouter la logique dans le modèle `Produit`
3. Mettre à jour le composant React pour gérer le nouveau type

### Modifier l'Apparence
- **Couleurs** : Modifier les classes CSS dans `NotificationCenter.jsx`
- **Icônes** : Remplacer les icônes Lucide React
- **Messages** : Modifier les textes dans les classes de notification

## 🚨 Points d'Attention

1. **Performance** : Les notifications sont synchrones (pas de queue)
2. **Utilisateurs multiples** : Toutes les notifications sont envoyées à tous les utilisateurs
3. **Base de données** : Les notifications s'accumulent, prévoir un nettoyage périodique
4. **Email** : Les notifications email sont configurées mais nécessitent une configuration SMTP

## 🔧 Maintenance

### Nettoyage des Anciennes Notifications
```php
// Supprimer les notifications de plus de 30 jours
DB::table('notifications')
    ->where('created_at', '<', now()->subDays(30))
    ->delete();
```

### Monitoring
- Vérifier les logs Laravel pour les erreurs de notification
- Surveiller la taille de la table `notifications`
- Tester régulièrement le système avec des produits de test

---

**Système implémenté avec succès !** 🎉
