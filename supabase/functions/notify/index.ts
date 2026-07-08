import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0";
import webPush from "npm:web-push@3.6.7";

// Configure Web Push with the VAPID keys we generated
// We will set VAPID_PRIVATE_KEY via Supabase secrets
webPush.setVapidDetails(
  "mailto:admin@dwogpacu.com",
  "BOl_ede4LbXQpsED0dXQp23ehRtecYLTz2I9QI9PpLVGgRqcQjmdYslWoe2R4YMfKJhs8Xm3oTHdyGKjd9Znme4",
  Deno.env.get("VAPID_PRIVATE_KEY") || "O3ozg0yGdukOzp0zLje6u8SNadoGfe9-gjKt7YB1YV0"
);

serve(async (req) => {
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

      // Logic to determine if a goal was scored
      if (newRecord.home_score > oldRecord.home_score || newRecord.away_score > oldRecord.away_score) {
        const home = newRecord.home_team || 'Home';
        const away = newRecord.away_team || 'Away';
        title = `⚽ GOAL! ${home} ${newRecord.home_score} - ${newRecord.away_score} ${away}`;
        body = "Live Score Update";
      } else if (newRecord.is_live && !oldRecord.is_live) {
        const home = newRecord.home_team || 'Home';
        const away = newRecord.away_team || 'Away';
        title = `🔴 KICKOFF! ${home} vs ${away}`;
        body = "Match is live now!";
      } else if (!newRecord.is_live && oldRecord.is_live) {
        const home = newRecord.home_team || 'Home';
        const away = newRecord.away_team || 'Away';
        title = `🏁 FULL TIME! ${home} ${newRecord.home_score} - ${newRecord.away_score} ${away}`;
        body = "Match has ended.";
      }

      // If we have a notification to send
      if (title !== "") {
        // Fetch all subscriptions
        const { data: subscriptions, error } = await supabaseClient
          .from('subscriptions')
          .select('*');

        if (error) throw error;

        // Send notifications in parallel
        const pushPromises = subscriptions.map((sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          };
          return webPush.sendNotification(pushSubscription, JSON.stringify({
            title,
            body,
            url: "/dwogpacu/"
          })).catch(err => {
            console.error('Error sending to endpoint', sub.endpoint, err);
            // Optionally delete invalid subscriptions here
          });
        });

        await Promise.all(pushPromises);
        return new Response(JSON.stringify({ success: true, count: pushPromises.length }), { headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ message: "No notification required" }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
