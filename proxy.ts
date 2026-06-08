import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth_session";
const LOGIN_PATH = "/login";

export default function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Always allow the login page through
  if (pathname === LOGIN_PATH) return NextResponse.next();

  // Check for valid session cookie
  const session = req.cookies.get(COOKIE_NAME)?.value;
  if (session === process.env.DASHBOARD_PASSWORD) return NextResponse.next();

  // Not authenticated — redirect to login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = LOGIN_PATH;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public).*)"],
};
