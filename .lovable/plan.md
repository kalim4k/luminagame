

# Plan: Feature "Social" - Chat de groupe

## Apercu

Ajout d'un nouvel onglet "Social" dans la barre de navigation mobile qui permet aux utilisateurs de discuter dans un chat de groupe style WhatsApp. Seuls les utilisateurs ayant une configuration valide (API Key + IP Proxy corrects) peuvent envoyer des messages.

## Architecture

### 1. Base de donnees - Nouvelle table `social_messages`

Creation d'une table pour stocker les messages du chat:

```sql
CREATE TABLE public.social_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pseudo text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Tout le monde peut lire les messages
CREATE POLICY "Anyone can view messages"
  ON public.social_messages FOR SELECT
  USING (true);

-- RLS: Seuls les utilisateurs authentifies peuvent envoyer des messages
CREATE POLICY "Authenticated users can insert messages"
  ON public.social_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Activer le realtime pour les mises a jour instantanees
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_messages;
```

### 2. Types TypeScript

Ajout d'un nouveau Tab et interface:

```typescript
// Dans src/types/index.ts
export enum Tab {
  DASHBOARD = 'dashboard',
  GAMES = 'games',
  WALLET = 'wallet',
  PROFILE = 'profile',
  CONFIGURATION = 'configuration',
  SOCIAL = 'social'  // Nouveau
}

export interface SocialMessage {
  id: string;
  userId: string;
  pseudo: string;
  message: string;
  createdAt: string;
}
```

### 3. Interface utilisateur - Page Social

Design moderne et epure avec:

**Zone de messages:**
- Liste scrollable des messages
- Chaque message affiche: pseudo, contenu, heure
- Messages de l'utilisateur courant alignes a droite (style WhatsApp)
- Bulles de messages avec couleurs differenciees
- Scroll automatique vers le bas pour les nouveaux messages

**Zone de saisie (visible uniquement si `isConnected === true`):**
- Champ pseudo (sauvegarde dans localStorage pour persistence)
- Champ message avec placeholder
- Bouton d'envoi
- Animation d'envoi

**Etat deconnecte:**
- Message explicatif avec bouton vers Configuration
- Design coherent avec le modal GameBlockedModal existant

### 4. Navigation mobile

Modification de la barre de navigation en bas:

```
Actuel: [Accueil] [Jeux] [Retraits] [Menu]
Nouveau: [Accueil] [Jeux] [Social] [Retraits] [Menu]
```

Icone utilisee: `MessageCircle` de lucide-react

### 5. Fonctionnalites temps reel

Utilisation de Supabase Realtime pour:
- Recevoir les nouveaux messages instantanement
- Mettre a jour la liste sans rechargement

---

## Details techniques

### Fichiers a modifier

| Fichier | Modification |
|---------|--------------|
| `src/types/index.ts` | Ajout Tab.SOCIAL et interface SocialMessage |
| `src/pages/Dashboard.tsx` | Ajout import MessageCircle, etat messages, fonction renderSocial(), modification navigation mobile et sidebar |
| Migration SQL | Creation table social_messages avec RLS et realtime |

### Validation des messages

- Pseudo: minimum 2 caracteres, maximum 20 caracteres
- Message: minimum 1 caractere, maximum 500 caracteres
- Verification `isConnected` avant d'afficher le formulaire d'envoi

### Design UI

Style coherent avec l'application existante:
- Cards avec `bg-card rounded-2xl border border-border`
- Boutons primaires avec `bg-primary text-primary-foreground rounded-xl`
- Animations `animate-fade-in` pour les nouveaux messages
- Couleurs: messages de l'utilisateur en `bg-primary`, autres en `bg-secondary`

### Gestion du pseudo

- Sauvegarde automatique du pseudo dans localStorage (`lumina_social_pseudo`)
- Pre-remplissage lors des visites suivantes
- Possibilite de le modifier a tout moment

