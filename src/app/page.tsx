// app/page.tsx
// No "use client" — this is a Server Component; UserHomePage handles its own interactivity

import UserHomePage from "@/components/UserHomePage";

export const metadata = {
  title: "RM Market — Boutique en ligne",
  description: "Les meilleures offres livrées partout au Maroc.",
};

export default function RootPage() {
  return <UserHomePage />;
}
