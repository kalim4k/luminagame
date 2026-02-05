import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Liste de prénoms français pour varier les notifications
const FIRST_NAMES = [
  'Alex', 'Lucas', 'Emma', 'Léa', 'Hugo', 'Chloé', 'Nathan', 'Inès',
  'Théo', 'Jade', 'Mathis', 'Manon', 'Raphaël', 'Camille', 'Louis',
  'Sarah', 'Jules', 'Zoé', 'Gabin', 'Lola', 'Arthur', 'Eva', 'Paul',
  'Lisa', 'Tom', 'Clara', 'Adam', 'Léna', 'Maxime', 'Romane'
];

// Génère un nombre aléatoire entre min et max (inclus)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Génère un message de notification avec des données aléatoires
const generateNotificationMessage = () => {
  const name = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
  const playerCount = randomInt(45, 156);
  const minAmount = randomInt(2, 4) * 1000; // 2000, 3000, ou 4000
  const maxAmount = randomInt(6, 12) * 1000; // 6000 à 12000
  
  return {
    heading: `🎉 Retraits du jour`,
    content: `${name} et ${playerCount} autres joueurs ont retiré entre ${minAmount.toLocaleString()} et ${maxAmount.toLocaleString()} FCFA aujourd'hui !`
  };
};

// Send notification using segments
const sendWithSegments = async (appId: string, apiKey: string, notification: { heading: string; content: string }) => {
  console.log('[Broadcast] Trying with included_segments: Subscribed Users');
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      included_segments: ['Subscribed Users'],
      headings: { en: notification.heading, fr: notification.heading },
      contents: { en: notification.content, fr: notification.content },
      url: '/dashboard?tab=wallet',
      chrome_web_icon: '/icons/icon-192.png',
      firefox_icon: '/icons/icon-192.png',
    }),
  });

  return { response, result: await response.json() };
};

// Send notification using specific subscription IDs from database
const sendWithSubscriptionIds = async (
  appId: string, 
  apiKey: string, 
  notification: { heading: string; content: string },
  supabase: any
) => {
  console.log('[Broadcast] Fallback: fetching subscription IDs from database');
  
  // Get all subscription IDs from database
  const { data: subscriptions, error } = await supabase
    .from('onesignal_subscriptions')
    .select('player_id');
  
  if (error || !subscriptions || subscriptions.length === 0) {
    console.log('[Broadcast] No subscriptions in database:', error);
    return { response: null, result: { error: 'No subscriptions in database' } };
  }
  
  const playerIds = subscriptions.map((s: { player_id: string }) => s.player_id);
  console.log('[Broadcast] Found', playerIds.length, 'subscription IDs:', playerIds);
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      include_subscription_ids: playerIds,
      headings: { en: notification.heading, fr: notification.heading },
      contents: { en: notification.content, fr: notification.content },
      url: '/dashboard?tab=wallet',
      chrome_web_icon: '/icons/icon-192.png',
      firefox_icon: '/icons/icon-192.png',
    }),
  });

  return { response, result: await response.json() };
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID = '15b4ea8d-7db6-46eb-86e0-1b3a1046c2af';
    const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!ONESIGNAL_REST_API_KEY) {
      console.error('ONESIGNAL_REST_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'OneSignal not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier l'authentification et que c'est bien "michel"
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier que l'utilisateur est "michel"
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que c'est bien "michel" (par son nom dans profiles)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le nom contient "michel" (insensible à la casse)
    if (!profile.name.toLowerCase().includes('michel')) {
      console.log(`User ${profile.name} is not authorized to send broadcast`);
      return new Response(
        JSON.stringify({ error: 'Not authorized to send broadcast notifications' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer le message aléatoire
    const notification = generateNotificationMessage();
    
    console.log('[Broadcast] Sending notification to all subscribed users');
    console.log('[Broadcast] Message:', notification.content);

    // First attempt: use segments  
    let segmentResult = await sendWithSegments(
      ONESIGNAL_APP_ID,
      ONESIGNAL_REST_API_KEY,
      notification
    );
    
    let notificationResponse = segmentResult.response;
    let notificationResult = segmentResult.result;

    console.log('[Broadcast] Segment response:', JSON.stringify(notificationResult));

    // Check if segments failed with "All included players are not subscribed"
    const segmentFailed = !notificationResponse?.ok || 
      (notificationResult.errors && notificationResult.errors.includes('All included players are not subscribed'));

    if (segmentFailed) {
      console.log('[Broadcast] Segment method failed, trying with subscription IDs...');
      
      // Fallback: try with specific subscription IDs from database
      const fallbackResult = await sendWithSubscriptionIds(
        ONESIGNAL_APP_ID,
        ONESIGNAL_REST_API_KEY,
        notification,
        supabase
      );
      
      if (fallbackResult.response) {
        notificationResponse = fallbackResult.response;
      }
      notificationResult = fallbackResult.result;
      
      console.log('[Broadcast] Fallback response:', JSON.stringify(notificationResult));
    }

    // Check final result
    if (!notificationResponse?.ok && !notificationResult.id) {
      console.error('[Broadcast] Final error:', notificationResult);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send notification', 
          details: notificationResult,
          tried: segmentFailed ? 'segments + subscription_ids' : 'segments'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientsCount = notificationResult.recipients || 'tous les';
    console.log('[Broadcast] Success! Recipients:', recipientsCount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: recipientsCount,
        message: notification.content,
        result: notificationResult,
        method: segmentFailed ? 'subscription_ids' : 'segments'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Broadcast] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
