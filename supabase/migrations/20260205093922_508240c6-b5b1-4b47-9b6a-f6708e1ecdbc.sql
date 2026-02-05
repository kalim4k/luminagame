-- Supprimer les doublons en gardant seulement le plus récent par user_id
DELETE FROM onesignal_subscriptions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM onesignal_subscriptions 
  ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
);

-- Ajouter une contrainte unique sur user_id pour empêcher les doublons futurs
ALTER TABLE onesignal_subscriptions 
ADD CONSTRAINT onesignal_subscriptions_user_id_unique UNIQUE (user_id);