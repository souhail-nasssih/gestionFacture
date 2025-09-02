# Système d'Impression des Factures - FINDUCARR

## Vue d'ensemble

Ce système permet d'imprimer les factures fournisseurs et clients avec un design professionnel et optimisé pour l'impression.

## Fonctionnalités

### ✅ Factures Fournisseurs
- Impression des factures fournisseurs
- Calcul automatique des totaux (HT, TVA, TTC)
- Conversion des montants en lettres françaises
- Affichage des informations du fournisseur
- Détail des articles avec bons de livraison associés

### ✅ Factures Clients
- Impression des factures clients
- Même format que les factures fournisseurs
- Adaptation des informations pour les clients

## Routes d'impression

### Factures Fournisseurs
```
GET /facture-fournisseurs/{id}/print
Nom de route: facture-fournisseurs.print
```

### Factures Clients
```
GET /facture-clients/{id}/print
Nom de route: facture-clients.print
```

## Utilisation

### 1. Depuis le navigateur
Accédez directement à l'URL d'impression :
```
http://votre-site.com/facture-fournisseurs/1/print
http://votre-site.com/facture-clients/1/print
```

### 2. Depuis le code
```php
// Dans un contrôleur ou une vue
<a href="{{ route('facture-fournisseurs.print', $facture->id) }}" target="_blank">
    Imprimer la facture
</a>

// Ou avec auto-impression
<a href="{{ route('facture-fournisseurs.print', $facture->id) }}?autoprint=1" target="_blank">
    Imprimer automatiquement
</a>
```

### 3. Bouton d'impression
Chaque page d'impression contient un bouton "🖨️ Imprimer" en haut à droite qui déclenche l'impression.

## Fonctionnalités d'impression

### Auto-impression
Ajoutez `?autoprint=1` à l'URL pour déclencher l'impression automatiquement après 1 seconde.

### Optimisations d'impression
- Format A4 optimisé
- Marges réduites (15mm)
- Bouton d'impression masqué à l'impression
- Tailles de police adaptées
- Couleurs optimisées pour l'impression

## Structure des vues

### Fichiers de vues
- `resources/views/factures/print.blade.php` - Factures fournisseurs
- `resources/views/factures/print-client.blade.php` - Factures clients

### Helper utilisé
- `app/Helpers/NumberToWords.php` - Conversion des nombres en lettres françaises

## Personnalisation

### Informations de l'entreprise
Modifiez les informations dans les vues :
```html
<div class="company-name">VOTRE_NOM_ENTREPRISE</div>
<div class="company-subtitle">VOTRE_SOUS_TITRE</div>
<div class="company-details">
    Votre adresse<br>
    Tél: Votre téléphone | Email: votre@email.com<br>
    ICE: Votre ICE | RC: Votre RC | CNSS: Votre CNSS
</div>
```

### Couleurs et style
Les couleurs principales sont définies dans le CSS :
- Couleur principale : `#2c3e50` (bleu foncé)
- Couleur secondaire : `#7f8c8d` (gris)
- Couleurs de statut : 
  - Payé : `#27ae60` (vert)
  - En attente : `#f39c12` (orange)
  - En retard : `#e74c3c` (rouge)

### TVA
Le taux de TVA est actuellement fixé à 20%. Pour le modifier, changez cette ligne dans les vues :
```php
$tva = $montantHT * 0.2; // Changez 0.2 par votre taux
```

## Dépannage

### Problème d'autoload du helper
Si le helper `NumberToWords` n'est pas reconnu :
1. Vérifiez que le fichier est bien dans `app/Helpers/`
2. Exécutez : `composer dump-autoload`
3. Vérifiez la configuration dans `composer.json`

### Problème d'affichage
- Vérifiez que les relations sont bien chargées dans les contrôleurs
- Assurez-vous que les modèles ont les bonnes relations définies

### Problème d'impression
- Vérifiez les paramètres d'impression du navigateur
- Testez avec différents navigateurs
- Vérifiez que le CSS d'impression est bien appliqué

## Sécurité

- Toutes les routes d'impression sont protégées par le middleware `auth`
- Vérifiez les permissions utilisateur si nécessaire
- Validez les données avant affichage

## Support

Pour toute question ou problème :
- Vérifiez les logs Laravel
- Testez avec des données simples
- Consultez la documentation Laravel sur les vues et l'impression
