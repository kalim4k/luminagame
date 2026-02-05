

# Plan: Notifications Push pour le Chat Social

## Apercu

Implementation des notifications push serveur (Web Push) pour notifier les utilisateurs des nouveaux messages dans le chat social, meme quand l'application est fermee.

## Architecture

L'implementation Web Push necessite 3 composants:
1. **Service Worker** - Recoit et affiche les notifications
2. **Frontend** - Demande la permission et s'abonne aux notifications  
3. **Backend (Edge Function)** - Envoie les notifications aux utilisateurs abonnes

```text
+----------------+     +------------------+     +-----------------+
|   Utilisateur  |     |   Edge Function  |     |  Push Service   |
|    (Browser)   |     |   (send-push)    |     | (Google/Mozilla)|
+----------------+     +------------------+     +-----------------+
        |                       |                       |
        | 1. S'abonner          |                       |
        |--------------------------------------------->|
        |                       |                       |
        | 2. Recevoir subscription                      |
        |<---------------------------------------------|
        |                       |                       |
        | 3. Envoyer subscription                       |
        |---------------------->| (stocke en BDD)       |
        |                       |                       |
        |                       | 4. Nouveau message    |
        |                       |---------------------->|
        |                       |                       |
        |                       | 5. Push notification  |
        |<---------------------------------------------|
```

## Etapes d'implementation

### 1. Generation des cles VAPID

Les cles VAPID (Voluntary Application Server Identification) sont necessaires pour authentifier votre serveur aupres des services de push.

**Action requise**: Vous devrez generer une paire de cles VAPID et les ajouter comme secrets:
- `VAPID_PUBLIC_KEY` - Cle publique (utilisee cote client)
- `VAPID_PRIVATE_KEY` - Cle privee (utilisee cote serveur)
- `VAPID_SUBJECT` - Email de contact (ex: mailto:contact@votresite.com)

### 2. Base de donnees - Table `push_subscriptions`

```sql
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS policies
CREATE POLICY "Users can manage their subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Index pour recherche rapide
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
```

### 3. Service Worker personnalise

Configuration de vite-plugin-pwa pour injecter le code de gestion des notifications push:

```javascript
// sw.js - Service Worker
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'social-message',
    data: { url: data.url || '/' }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'LUMI GAMES', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### 4. Hook React `usePushNotifications`

```typescript
// src/hooks/usePushNotifications.ts
export const usePushNotifications = (userId: string | null) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  // Verifie le support
  // Demande la permission
  // S'abonne au push
  // Enregistre la subscription en BDD
  
  return { isSubscribed, isSupported, subscribe, unsubscribe };
};
```

### 5. Edge Function `send-push`

```typescript
// supabase/functions/send-push/index.ts
import webpush from 'web-push';

// Configure VAPID
webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT'),
  Deno.env.get('VAPID_PUBLIC_KEY'),
  Deno.env.get('VAPID_PRIVATE_KEY')
);

// Recoit les nouveaux messages et envoie les notifications
// a tous les utilisateurs abonnes (sauf l'expediteur)
```

### 6. Integration dans le Chat Social

Modification de `SocialChat.tsx` pour:
- Afficher un bouton pour activer les notifications
- Appeler l'edge function `send-push` apres chaque nouveau message

### 7. Composant UI pour activer les notifications

Un bouton discret dans le header du chat permettant d'activer/desactiver les notifications.

---

## Fichiers a creer/modifier

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer table `push_subscriptions` |
| `public/sw-push.js` | Service worker pour push |
| `vite.config.ts` | Configurer injection du SW push |
| `src/hooks/usePushNotifications.ts` | Hook de gestion des notifications |
| `supabase/functions/send-push/index.ts` | Edge function pour envoyer les notifications |
| `src/components/social/SocialChat.tsx` | Ajouter bouton activation + appel edge function |
| `.env` | Ajouter `VITE_VAPID_PUBLIC_KEY` |

---

## Secrets a configurer

Avant l'implementation, vous devrez ajouter ces secrets:

1. **VAPID_PUBLIC_KEY** - Cle publique VAPID
2. **VAPID_PRIVATE_KEY** - Cle privee VAPID  
3. **VAPID_SUBJECT** - Email de contact (format: mailto:email@example.com)

Pour generer les cles VAPID, vous pouvez utiliser:
```bash
npx web-push generate-vapid-keys
```

---

## Limitations et considerations

- Les notifications push ne fonctionnent que sur les navigateurs modernes (Chrome, Firefox, Edge, Safari 16+)
- Sur iOS, les notifications push ne sont supportees que si l'app est installee en PWA
- L'utilisateur doit explicitement accepter les notifications
- Les notifications sont envoyees a tous les utilisateurs abonnes (sauf l'expediteur du message)

