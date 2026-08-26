import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ knownIps: [] });
    const { data } = await supabase.from("known_ips").select("*").order("created_at", { ascending: false });
    return NextResponse.json({ knownIps: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!supabase) {
      return NextResponse.json({ ok: false, message: "Database not ready" }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const { ip, userAlias = "Efsa", label = "Efsa Cihazı", pin, action = "add" } = body;

    // Verify admin PIN (Enes = 1453)
    if (pin !== "1453") {
      return NextResponse.json({ ok: false, error: "Yetkisiz işlem" }, { status: 401 });
    }

    if (action === "remove") {
      if (!ip) return NextResponse.json({ ok: false, error: "IP gerekli" }, { status: 400 });
      await supabase.from("known_ips").delete().eq("ip", ip);
      await supabase.from("activity_logs").update({ user_alias: "Misafir" }).eq("ip", ip);
      return NextResponse.json({ ok: true, removedIp: ip });
    }

    if (!ip) {
      return NextResponse.json({ ok: false, error: "IP gerekli" }, { status: 400 });
    }

    // Upsert into known_ips
    await supabase.from("known_ips").upsert({
      ip: ip.trim(),
      user_alias: userAlias,
      label: label.trim() || "Efsa Cihazı",
      updated_at: new Date().toISOString()
    });

    // Update all past logs for this IP
    await supabase
      .from("activity_logs")
      .update({ user_alias: userAlias })
      .eq("ip", ip.trim());

    return NextResponse.json({ ok: true, ip: ip.trim(), userAlias });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
