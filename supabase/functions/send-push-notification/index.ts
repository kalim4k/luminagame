import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  senderUserId: string;
  senderPseudo: string;
  message: string;
}

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

    const { senderUserId, senderPseudo, message }: NotificationPayload = await req.json();

    if (!senderUserId || !senderPseudo || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all subscriptions except the sender's
    const { data: subscriptions, error: subError } = await supabase
      .from('onesignal_subscriptions')
      .select('player_id')
      .neq('user_id', senderUserId);

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
        JSON.stringify({ success: true, notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const playerIds = subscriptions.map(sub => sub.player_id);
    console.log(`Sending notification to ${playerIds.length} subscribers`);

    // Truncate message for notification
    const truncatedMessage = message.length > 100 ? message.substring(0, 97) + '...' : message;

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
        headings: { en: `💬 ${senderPseudo}` },
        contents: { en: truncatedMessage },
        url: '/?tab=social',
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
        result: notificationResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
