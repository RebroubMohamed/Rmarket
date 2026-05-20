// src/lib/auth.ts
// Remplace votre fichier existant — utilise NextAuth getServerSession

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return null;
  }
  return session;
}
