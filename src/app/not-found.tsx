// src/app/not-found.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Page non trouvée (404)</h2>
      <p>L&apos;élément que vous cherchez n&apos;existe pas.</p>
      <Link href='/' style={{ color: "blue", textDecoration: "underline" }}>
        Retourner à l&apos;accueil
      </Link>
    </div>
  );
}
