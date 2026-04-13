import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques (pas besoin d'auth)
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/logo.png"
  ) {
    return NextResponse.next();
  }

  // Vérifier le cookie d'authentification
  const authToken = request.cookies.get("sos-auth-token");

  if (!authToken?.value) {
    // Pas authentifié → rediriger vers login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier que le token est valide (commence par "sos-auth:")
  try {
    const decoded = Buffer.from(authToken.value, "base64").toString();
    if (!decoded.startsWith("sos-auth:")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
