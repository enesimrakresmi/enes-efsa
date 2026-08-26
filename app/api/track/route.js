import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

function getClientIp(reqHeaders) {
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = reqHeaders.get("x-real-ip") || reqHeaders.get("cf-connecting-ip");
  if (realIp) return realIp;

  return "127.0.0.1";
}

function getDeviceType(userAgent = "") {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/i.test(ua)) return "Mobil (Telefon)";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  if (/windows|macintosh|linux/i.test(ua)) return "Masaüstü (Bilgisayar)";
  return "Bilinmiyor";
}

export async function POST(request) {
  try {
    if (!supabase) {
      return NextResponse.json({ ok: false, message: "Database not ready" }, { status: 503 });
    }

    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const userAgent = reqHeaders.get("user-agent") || "";
    const deviceType = getDeviceType(userAgent);

    const body = await request.json().catch(() => ({}));
    const {
      sessionId,
      path = "/",
      duration = 0,
      userAlias: providedAlias
    } = body;

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "sessionId required" }, { status: 400 });
    }

    // 1. Check if this IP is in known_ips
    let effectiveAlias = "Misafir";

    const { data: knownIpData } = await supabase
      .from("known_ips")
      .select("user_alias")
      .eq("ip", ip)
      .maybeSingle();

    if (knownIpData?.user_alias) {
      effectiveAlias = knownIpData.user_alias;
    }

    // If client explicitly passed a verified alias (like Efsa when unlocked with PIN 3773)
    if (providedAlias && providedAlias !== "Misafir") {
      effectiveAlias = providedAlias;
      // Auto-save this IP as known
      await supabase.from("known_ips").upsert({
        ip,
        user_alias: providedAlias,
        updated_at: new Date().toISOString()
      });
    }

    // 2. Check if a log exists for this session
    const { data: existingLog } = await supabase
      .from("activity_logs")
      .select("id, visited_paths, duration_seconds")
      .eq("session_id", sessionId)
      .maybeSingle();

    const nowIso = new Date().toISOString();

    if (existingLog) {
      let paths = Array.isArray(existingLog.visited_paths) ? existingLog.visited_paths : [];
      if (!paths.includes(path)) {
        paths = [...paths, path];
      }

      await supabase
        .from("activity_logs")
        .update({
          ip,
          user_alias: effectiveAlias,
          current_path: path,
          visited_paths: paths,
          duration_seconds: Math.max(existingLog.duration_seconds || 0, Math.floor(duration)),
          last_active_at: nowIso,
          device_type: deviceType,
          user_agent: userAgent
        })
        .eq("id", existingLog.id);
    } else {
      await supabase.from("activity_logs").insert({
        session_id: sessionId,
        ip,
        user_alias: effectiveAlias,
        current_path: path,
        visited_paths: [path],
        duration_seconds: Math.floor(duration),
        device_type: deviceType,
        user_agent: userAgent,
        last_active_at: nowIso,
        created_at: nowIso
      });
    }

    return NextResponse.json({
      ok: true,
      ip,
      userAlias: effectiveAlias
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
