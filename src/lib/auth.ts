// src/lib/auth.ts
export async function requireAdmin() {
  // Bypass auth in development
  return { user: { id: "dev", role: "ADMIN", nom: "Dev User" } };
}
