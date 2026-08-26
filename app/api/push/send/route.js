import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/pushServer";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { targetUser, title, body: messageBody, url = "/", tag = "efes-notification", senderUser } = body;

    const result = await sendPushNotification({
      targetUser,
      senderUser,
      title,
      body: messageBody,
      url,
      tag
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
