import { NextResponse } from "next/server";

const USERS = {
  enes: { password: "1453", displayName: "Enes" },
  efsa: { password: "3773", displayName: "Efsa" }
};

const COOKIE_NAME = "efes_user";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Kullanıcı adı ve şifre gerekli." },
        { status: 400 }
      );
    }

    const userKey = username.toLowerCase().trim();
    const user = USERS[userKey];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { ok: false, error: "Kullanıcı adı veya şifre hatalı." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      user: userKey,
      displayName: user.displayName
    });

    response.cookies.set(COOKIE_NAME, userKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
