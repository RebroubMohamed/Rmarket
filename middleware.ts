import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Redirection racine → page utilisateur (déjà gérée par src/app/page.tsx)
  return NextResponse.next();
}

export const config = {
  matcher: [], // ← tableau vide = middleware ne s'applique à aucune route
};
