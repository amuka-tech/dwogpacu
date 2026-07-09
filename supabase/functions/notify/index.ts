import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0";
import webPush from "npm:web-push@3.6.7";

// Configure Web Push with the VAPID keys we generated
webPush.setVapidDetails(
  "mailto:admin@dwogpacu.com",
  "BOl_ede4LbXQpsED0dXQp23ehRtecYLTz2I9QI9PpLVGgRqcQjmdYslWoe2R4YMfKJhs8Xm3oTHdyGKjd9Znme4",
  Deno.env.get("VAPID_PRIVATE_KEY") || "O3ozg0yGdukOzp0zLje6u8SNadoGfe9-gjKt7YB1YV0"
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the webhook payload
    const payload = await req.json();
    
    // Only trigger if it's an UPDATE on matches
    if (payload.type === 'UPDATE' && payload.table === 'matches') {
      const oldRecord = payload.old_record;
      const newRecord = payload.record;
      
      let title = "";
      let body = "";

      // Goals
      if (newRecord.home_score > oldRecord.home_score || newRecord.away_score > oldRecord.away_score) {
        const home = newRecord.home_team || 'Home';
        const away = newRecord.away_team || 'Away';
        title = `⚽ GOAL! ${home} ${newRecord.home_score} - ${newRecord.away_score} ${away}`;
        body = "Live Score Update";
      } else if (newRecord.is_live && !oldRecord.is_live) {
        // Kickoff
        const home = newRecord.home_team || 'Home';
        const away = newRecord.away_team || 'Away';
        title = `🔴 KICKOFF! ${home} vs ${away}`;
        body = "Match is live now!";
      } else if (!newRecord.is_live && oldRecord.is_live) {
        // Full time
        const home = newRecord.home_team || 'Home';
        const away = newRecord.away_team || 'Away';
        title = `🏁 FULL TIME! ${home} ${newRecord.home_score} - ${newRecord.away_score} ${away}`;
        body = "Match has ended.";
      } else {
        // Check for new card events
        const oldEvents: any[] = oldRecord.events || [];
        const newEvents: any[] = newRecord.events || [];
        if (newEvents.length > oldEvents.length) {
          const latestEvent = newEvents[newEvents.length - 1];
          const teamName = latestEvent.teamId === newRecord.home_team_id
            ? (newRecord.home_team || 'Home')
            : (newRecord.away_team || 'Away');
          if (latestEvent.type === 'yellow') {
            title = `🟡 YELLOW CARD`;
            body = `${latestEvent.player} (${teamName}) receives a yellow card — ${latestEvent.minute}'`;
          } else if (latestEvent.type === 'red') {
            title = `🔴 RED CARD!`;
            body = `${latestEvent.player} (${teamName}) is sent off! — ${latestEvent.minute}'`;
          }
        }
      }

      // If we have a notification to send
      if (title !== "") {
        // Fetch all subscriptions
        const { data: subscriptions, error } = await supabaseClient
          .from('subscriptions')
          .select('*');

        if (error) throw error;

        const expiredEndpoints: string[] = [];

        // Send notifications in parallel with mobile-friendly options
        const pushPromises = subscriptions.map((sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          };

          // Options critical for mobile delivery:
          // - TTL: 60s means FCM will try for 60s to deliver (not drop immediately)
          // - urgency: 'high' bypasses battery optimization / Doze mode on Android
          const pushOptions = {
            TTL: 60,
            urgency: 'high' as const,
          };

          return webPush.sendNotification(
            pushSubscription,
            JSON.stringify({ title, body, url: "/dwogpacu/" }),
            pushOptions
          ).then(() => {
            return { endpoint: sub.endpoint, success: true };
          }).catch((err) => {
            console.error('Push error for endpoint', sub.endpoint, 'Status:', err.statusCode, 'Body:', err.body);
            // 410 Gone = subscription is expired/unsubscribed — remove it from DB
            if (err.statusCode === 410 || err.statusCode === 404) {
              expiredEndpoints.push(sub.endpoint);
            }
            return { endpoint: sub.endpoint, error: err.message || err.toString(), statusCode: err.statusCode, body: err.body };
          });
        });

        const results = await Promise.all(pushPromises);

        // Clean up expired subscriptions so we don't keep sending to dead endpoints
        if (expiredEndpoints.length > 0) {
          console.log('Removing expired subscriptions:', expiredEndpoints);
          await supabaseClient
            .from('subscriptions')
            .delete()
            .in('endpoint', expiredEndpoints);
        }

        const errors = results.filter(r => r && (r as any).error);
        const successes = results.filter(r => r && (r as any).success);
        
        console.log(`Sent: ${successes.length}/${subscriptions.length}, Errors: ${errors.length}, Cleaned: ${expiredEndpoints.length}`);
        
        return new Response(
          JSON.stringify({ success: true, total: subscriptions.length, sent: successes.length, errors, cleaned: expiredEndpoints.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(JSON.stringify({ message: "No notification required" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
