// src/app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "RM Market",
  description: "Luxury Shopping Experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='fr' suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster position='top-right' richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
