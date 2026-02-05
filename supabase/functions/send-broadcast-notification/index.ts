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

    // Get all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('onesignal_subscriptions')
      .select('player_id');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions to notify');
      return new Response(
        JSON.stringify({ success: true, notified: 0, message: 'Aucun abonné à notifier' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const playerIds = subscriptions.map(sub => sub.player_id);
    console.log(`Sending broadcast notification to ${playerIds.length} subscribers`);

    // Générer le message aléatoire
    const notification = generateNotificationMessage();

    // Send notification via OneSignal API
    const notificationResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: notification.heading, fr: notification.heading },
        contents: { en: notification.content, fr: notification.content },
        url: '/dashboard?tab=wallet',
        chrome_web_icon: '/icons/icon-192.png',
        firefox_icon: '/icons/icon-192.png',
      }),
    });

    const notificationResult = await notificationResponse.json();
    console.log('OneSignal response:', notificationResult);

    if (!notificationResponse.ok) {
      console.error('OneSignal error:', notificationResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send notification', details: notificationResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: playerIds.length,
        message: notification.content,
        result: notificationResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-broadcast-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
