import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request) {
  try {
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Database not ready" }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const { subscription, userAlias = "Anonim" } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ ok: false, error: "Invalid subscription" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        subscription,
        user_alias: userAlias,
        updated_at: now
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
