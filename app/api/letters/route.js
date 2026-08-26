import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request) {
  try {
    if (!supabase) {
      return NextResponse.json({ ok: false, letters: [], message: "Database not ready" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const from = parseInt(searchParams.get("from") || "0", 10);
    const to = parseInt(searchParams.get("to") || "9", 10);

    const { data, error } = await supabase
      .from("letters")
      .select("id, author, recipient, title, content, open_at, created_at")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const now = Date.now();

    // Security sanitization: Strip content for sealed letters
    const sanitized = (data || []).map((letter) => {
      const isTimeOpen = new Date(letter.open_at).getTime() <= now;
      return {
        ...letter,
        // Only return real content if the seal time has arrived!
        content: isTimeOpen ? letter.content : ""
      };
    });

    return NextResponse.json({ ok: true, data: sanitized });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
