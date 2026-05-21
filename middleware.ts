import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-min-32-chars-long!!",
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Autoriser TOUTES les routes publiques de la boutique (Accueil, produits, etc.)
  // On ne bloque PAS la racine "/", ni les pages produits, paniers, etc.
  if (
    pathname === "/" || 
    pathname === "/login" || 
    pathname.startsWith("/api/auth") // Nécessaire pour NextAuth si utilisé
  ) {
    return NextResponse.next();
  }

  // 2. Protéger UNIQUEMENT les routes de l'administration (/admin)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // 3. Protéger les API d'administration spécifiques (ex: /api/admin)
  // Si vous avez des API publiques pour les clients (ex: /api/products), ne les bloquez pas ici !
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Ignorer les fichiers statiques pour ne pas ralentir le site
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};