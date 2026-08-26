import webpush from "web-push";
import { supabase } from "./supabaseClient";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:enes@efes-keepsake.local",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function sendPushNotification({ targetUser, senderUser, title, body, url = "/", tag = "efes-notification" }) {
  if (!supabase || !vapidPublicKey || !vapidPrivateKey) {
    console.warn("Push notification skipped: Supabase or VAPID keys missing");
    return { count: 0, error: "Configuration missing" };
  }

  try {
    let query = supabase.from("push_subscriptions").select("id, endpoint, subscription, user_alias");

    // If targetUser specified, filter for that user (e.g. send to partner)
    if (targetUser) {
      query = query.eq("user_alias", targetUser);
    }

    // Exclude sender's own subscriptions so they don't get their own notification
    if (senderUser) {
      query = query.neq("user_alias", senderUser);
    }

    const { data: subs, error } = await query;
    if (error || !subs || subs.length === 0) {
      console.log(`Push notification: No subscriptions found for targetUser='${targetUser || "all"}'`);
      return { count: 0, message: "No subscribers found" };
    }

    console.log(`Push notification: Found ${subs.length} subscriber(s) for targetUser='${targetUser || "all"}'`);

    const payload = JSON.stringify({
      title: title || "EfEs • Hatıralarımız",
      body: body || "",
      icon: "/icon.png",
      badge: "/icon.png",
      tag,
      data: { url }
    });

    const deadSubIds = [];
    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          const res = await webpush.sendNotification(sub.subscription, payload);
          console.log(`Push sent successfully to [${sub.user_alias}] (${sub.id}): status=${res.statusCode}`);
          return { id: sub.id, user: sub.user_alias, status: res.statusCode };
        } catch (err) {
          console.error(`Push send failed for [${sub.user_alias}] (${sub.id}):`, err.statusCode || err.message);
          // If subscription has expired or is invalid (410 Gone / 404 Not Found), clean it up
          if (err.statusCode === 410 || err.statusCode === 404) {
            deadSubIds.push(sub.id);
          }
          throw err;
        }
      })
    );

    if (deadSubIds.length > 0) {
      console.log(`Cleaning up ${deadSubIds.length} expired subscription(s)...`);
      await supabase.from("push_subscriptions").delete().in("id", deadSubIds);
    }

    const successful = results.filter(r => r.status === "fulfilled").length;
    return { count: subs.length, delivered: successful };
  } catch (err) {
    console.error("Push send error:", err);
    return { count: 0, error: err.message };
  }
}

