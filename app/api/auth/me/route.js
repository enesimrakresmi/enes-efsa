import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "efes_user";

const DISPLAY_NAMES = {
  enes: "Enes",
  efsa: "Efsa"
};

export async function GET() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(COOKIE_NAME);

  if (!userCookie?.value || !DISPLAY_NAMES[userCookie.value]) {
    return NextResponse.json({ user: null, displayName: null });
  }

  return NextResponse.json({
    user: userCookie.value,
    displayName: DISPLAY_NAMES[userCookie.value]
  });
}
