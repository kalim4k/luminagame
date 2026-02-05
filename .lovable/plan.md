
Objectif : expliquer pourquoi OneSignal affiche “Delivered” mais ton téléphone ne reçoit rien, puis corriger durablement.

## 1) Analyse complète (ce qui est très probablement cassé)

### A. Conflit de Service Worker (cause n°1 dans ton contexte)
Tu utilises :
- Une PWA (vite-plugin-pwa) qui enregistre automatiquement un Service Worker à la racine (scope “/”).
- OneSignal qui a aussi besoin d’un Service Worker à la racine (par défaut `/OneSignalSDKWorker.js`).

Sur le Web, **un seul Service Worker peut gérer le scope “/”**.  
Résultat typique :
- Le SW de la PWA prend le contrôle.
- OneSignal pense avoir “envoyé/delivered” (côté serveur), mais **le push n’est pas affiché côté device** car le SW actif ne gère pas correctement l’événement `push` (ou n’importe pas OneSignal).
- Ça colle parfaitement avec “je reçois juste une notif après abonnement” (souvent un feedback local/permission) puis plus rien ensuite.

=> Tant qu’on n’a pas un Service Worker unique (ou correctement “fusionné”), les campagnes et les notifications trigger (chat/retraits) peuvent être “delivered” sans apparaître.

### B. Domaines/Origines (déjà vu dans tes logs)
Tes logs montraient : “Can only be used on: https://luminagames.netlify.app”.  
Tu testes maintenant sur Netlify, donc ça devrait être OK, mais on va quand même ajouter une détection/affichage d’erreur claire dans l’UI si ça se reproduit sur une autre URL (preview / lovable domain).

### C. Données d’abonnement (déjà amélioré)
On a déjà :
- Nettoyé les doublons en base + contrainte unique `user_id`.
- Changé `saveSubscription` pour supprimer les anciennes lignes.

Ça réduit les “invalid_player_ids”, mais **ça ne règle pas le problème de réception** si le Service Worker actif n’est pas celui attendu.

## 2) Changements à implémenter (solution)

### Étape 1 — Créer un Service Worker unique compatible PWA + OneSignal
But : faire en sorte que le Service Worker utilisé par la PWA **importe aussi OneSignal**.

Approche recommandée :
- Passer `vite-plugin-pwa` en mode `injectManifest` (au lieu du SW auto généré opaque).
- Ajouter un fichier SW source (ex: `src/sw.ts`) qui :
  1) inclut le precache Workbox (`precacheAndRoute(self.__WB_MANIFEST)`),
  2) et **importe OneSignal** via :
     `importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");`

Résultat : un seul SW à la racine, qui gère à la fois :
- cache/offline PWA
- réception et affichage des push OneSignal

Fichiers à modifier/ajouter (côté code) :
- `vite.config.ts` : configurer VitePWA en `strategies: 'injectManifest'`, pointer vers le SW source.
- Nouveau fichier SW (ex: `src/sw.ts` ou `src/service-worker/sw.ts`) : Workbox + importScripts OneSignal.

Points d’attention :
- Le SW doit rester au scope “/”.
- Garder `clientsClaim/skipWaiting` si on veut forcer les updates.
- Vérifier que le build génère bien `/sw.js` (ou le nom choisi).

### Étape 2 — Aligner `useOneSignal` sur le bon Service Worker
Actuellement :
```ts
serviceWorkerPath: '/OneSignalSDKWorker.js'
```
Après la fusion, OneSignal doit s’appuyer sur le SW racine unique (celui de la PWA). On mettra :
- soit `serviceWorkerPath: '/sw.js'` (si c’est le fichier final),
- soit on retire la config si OneSignal détecte correctement, mais je préfère être explicite.

On ajoutera aussi :
- un état `initError` dans le hook (message lisible),
- et un log diagnostic des SW enregistrés :
  - `navigator.serviceWorker.getRegistrations()`
  - afficher le scriptURL + scope dans la console (et éventuellement dans l’écran Profil en mode debug).

### Étape 3 — Ajouter un panneau “Diagnostic Notifications” (pour arrêter de “deviner”)
Sur la page Profil (là où tu gères les notifs), ajouter un bloc (visible pour “michel” ou pour tous en mode debug) qui affiche :
- Permission navigateur (`Notification.permission`)
- Mode PWA détecté (`display-mode: standalone`)
- OneSignal `subscriptionId` (PushSubscription.id)
- `optedIn`
- Service worker actif (scriptURL + scope)
- Bouton “Envoyer une notification test à moi” (optionnel mais très utile)

Ce bouton peut appeler une fonction backend simple qui envoie un push uniquement au `player_id` de l’utilisateur courant (pour isoler tout le reste).

### Étape 4 — Vérifier le flux “chat social” + “retraits”
Une fois le push rétabli côté device (SW OK) :
- Chat social : confirmer que l’appel à `send-push-notification` est bien exécuté et ne retourne pas d’erreur.
  - On ajoutera un `console.log`/toast côté client si la function répond avec `{error:...}`.
  - Et on vérifiera les logs backend de la function sur les envois.
- Retraits : si tu as un système de retraits qui doit notifier, il faut identifier l’endroit exact où l’événement “retrait effectué” est déclenché (front ou backend) et brancher l’envoi push (probablement via une fonction backend pour garder les secrets).

## 3) Comment on saura que c’est corrigé (critères de succès)
Sur Android, PWA installée, URL Netlify :
1) Après opt-in :
   - le panneau diagnostic montre un `subscriptionId` non vide
   - et le SW actif = `/sw.js` (ou celui configuré), scope “/”
2) Une campagne OneSignal “Delivered” se voit réellement sur le téléphone.
3) Un message chat déclenche une notification reçue (pas seulement log “delivered”).
4) Le bouton broadcast (michel) envoie une notif reçue.

## 4) Séquencement concret
1) Implémenter la fusion Service Worker (PWA + OneSignal).
2) Mettre à jour `useOneSignal` pour pointer sur le SW final + ajouter `initError` + logs.
3) Ajouter panneau diagnostic sur Profil.
4) Tester campagnes + test push direct + chat + broadcast.
5) Si encore KO : on analyse avec les infos du panneau (SW/permission/id) au lieu de “delivered”.

## 5) Risques / pièges connus
- Si un ancien SW est déjà installé, il peut rester actif : il faudra forcer une mise à jour (`skipWaiting/clientsClaim` + “hard refresh” + parfois désinstaller/réinstaller la PWA).
- Sur Android, certains modes économie d’énergie/optimisation batterie peuvent retarder l’affichage, mais ça n’explique pas “jamais” sur campagnes.
- Si tu testes parfois sur preview/lovable domain : OneSignal peut refuser (comme vu dans les logs). On affichera l’erreur clairement.

## Fichiers concernés (prévision)
- `vite.config.ts` (config PWA injectManifest)
- Nouveau fichier Service Worker (ex: `src/sw.ts`)
- `src/hooks/useOneSignal.ts` (serviceWorkerPath + diagnostics + initError)
- `src/components/profile/NotificationSettings.tsx` (UI diagnostic)
- Optionnel : une fonction backend “send-test-notification” (si on veut un test ciblé)

