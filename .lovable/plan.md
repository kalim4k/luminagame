

# Plan de correction des notifications push OneSignal

## Diagnostic

L'analyse des logs révèle plusieurs problèmes :

1. **Player IDs invalides dans la base de données** - Des anciens IDs qui ne sont plus reconnus par OneSignal
2. **Entrées multiples par utilisateur** - Un même utilisateur peut avoir plusieurs `player_id` (un seul est valide)
3. **Synchronisation défaillante** - Quand un utilisateur se réabonne, l'ancien ID n'est pas supprimé

## Solution proposée

### 1. Nettoyer la table des subscriptions

Modifier la logique de sauvegarde pour :
- Supprimer les anciens `player_id` d'un utilisateur avant d'en ajouter un nouveau
- Garantir qu'un utilisateur n'a qu'une seule subscription active

### 2. Améliorer le hook useOneSignal

```text
┌─────────────────────────────────────────────────────────┐
│                    saveSubscription()                    │
├─────────────────────────────────────────────────────────┤
│ 1. Supprimer toutes les anciennes subscriptions         │
│    de cet user_id                                       │
│                                                         │
│ 2. Insérer le nouveau player_id                         │
│                                                         │
│ 3. Supprimer aussi ce player_id s'il était associé      │
│    à un autre utilisateur                               │
└─────────────────────────────────────────────────────────┘
```

### 3. Nettoyer les données existantes

Exécuter une requête pour supprimer les doublons et ne garder que le `player_id` le plus récent par utilisateur.

### 4. Ajouter des logs de debug côté client

Pour mieux diagnostiquer les problèmes de réception sur mobile.

## Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/hooks/useOneSignal.ts` | Améliorer `saveSubscription()` pour supprimer les anciens IDs |
| Migration SQL | Nettoyer les doublons existants et ajouter une contrainte unique sur `user_id` |

## Note importante sur les notifications mobiles

Les notifications web push ont des limitations :
- **Android** : Fonctionne sur Chrome si le site est en HTTPS
- **iOS** : Nécessite iOS 16.4+ ET que le site soit ajouté à l'écran d'accueil en tant que PWA

Si tu testes sur iPhone sans avoir ajouté le site en PWA, les notifications ne fonctionneront pas.

