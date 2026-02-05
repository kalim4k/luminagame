
# Plan : Corriger le système de notifications push

## Résumé du problème
Les notifications broadcast ne sont pas reçues car :
1. OneSignal renvoie l'erreur "All included players are not subscribed"
2. La base de données locale contient 3 `player_id` qui ne correspondent pas aux 9 abonnés actifs dans OneSignal
3. Il y a probablement un problème de configuration ou de synchronisation entre le site et OneSignal

---

## Étape 1 : Vérifier et corriger la configuration OneSignal

### Actions requises dans le dashboard OneSignal
Tu devras vérifier ces éléments dans OneSignal :
- **App ID** : Confirmer que c'est bien `15b4ea8d-7db6-46eb-86e0-1b3a1046c2af`
- **Domaine Web** : Vérifier que `luminagame.lovable.app` est configuré (pas le domaine preview)
- **Service Worker Scope** : Doit être `/` (racine)

---

## Étape 2 : Améliorer la sauvegarde des abonnements

### Problème actuel
La fonction `saveSubscription` n'est appelée que lors du changement d'état (`addEventListener('change')`), ce qui peut rater des abonnements existants.

### Modifications à apporter

**Fichier : `src/hooks/useOneSignal.ts`**
- Ajouter une sauvegarde immédiate lors de l'initialisation si l'utilisateur est déjà abonné
- Ajouter une vérification et synchronisation au chargement de la page
- Améliorer les logs pour le débogage

```text
┌─────────────────────────────────────────┐
│         Initialisation OneSignal        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   L'utilisateur est-il déjà abonné ?    │
│        (optedIn === true)               │
└─────────────────────────────────────────┘
           │                    │
          OUI                  NON
           │                    │
           ▼                    ▼
┌─────────────────┐   ┌─────────────────┐
│  Récupérer le   │   │   Attendre le   │
│   player_id     │   │   subscribe()   │
└─────────────────┘   └─────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│    Sauvegarder dans la base de données  │
│    (UPSERT onesignal_subscriptions)     │
└─────────────────────────────────────────┘
```

---

## Étape 3 : Améliorer l'Edge Function broadcast

### Modifications à apporter

**Fichier : `supabase/functions/send-broadcast-notification/index.ts`**
- Ajouter un fallback : si `included_segments` échoue, essayer avec `include_subscription_ids`
- Ajouter plus de logs pour comprendre la réponse OneSignal
- Retourner le détail de l'erreur au frontend pour debugging

---

## Étape 4 : Ajouter un bouton de resynchronisation

### Nouveau composant sur la page Profil
Un bouton "Resynchroniser mes notifications" qui :
1. Récupère le `player_id` actuel depuis OneSignal
2. Le sauvegarde en base de données
3. Confirme la synchronisation à l'utilisateur

---

## Détails techniques

### Fichiers à modifier
| Fichier | Modification |
|---------|-------------|
| `src/hooks/useOneSignal.ts` | Ajouter sauvegarde à l'init + bouton resync |
| `supabase/functions/send-broadcast-notification/index.ts` | Améliorer gestion d'erreur et logs |
| `src/components/profile/NotificationSettings.tsx` | Ajouter bouton de resynchronisation |

### Points clés de l'implémentation
1. **Sauvegarde proactive** : Sauvegarder le `player_id` dès qu'on détecte un abonnement actif, pas seulement lors du changement
2. **Logs détaillés** : Ajouter des `console.log` côté client pour suivre le processus
3. **Feedback utilisateur** : Afficher clairement si la synchro a réussi ou échoué

---

## Vérification manuelle requise

Avant d'implémenter, tu dois vérifier dans OneSignal :

1. **Aller dans OneSignal → Settings → Web Configuration**
   - Vérifier que le "Site URL" est `https://luminagame.lovable.app`
   
2. **Aller dans OneSignal → Audience → All Users**
   - Cliquer sur un abonné et vérifier son "Player ID"
   - Vérifier que le "Subscription Status" est "Subscribed"

3. **Aller dans OneSignal → Segments**
   - Vérifier que "Subscribed Users" contient bien les 9 utilisateurs

Si le domaine configuré n'est pas le bon (par exemple s'il pointe vers le preview), c'est la cause du problème.
