// src/components/admin/Navbar.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut, Bell, ChevronRight } from "lucide-react";
import { useState } from "react";

const breadcrumbMap: Record<string, string> = {
  admin: "Dashboard",
  products: "Produits",
  categories: "Catégories",
  orders: "Commandes",
  excel: "Excel",
  users: "Utilisateurs",
  settings: "Paramètres",
  new: "Nouveau",
};

interface NavbarProps {
  user: { nom: string; email: string };
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const segments = pathname.split("/").filter(Boolean);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut({ redirect: false });
      toast.success("Déconnexion réussie");
      router.push("/login");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className='h-16 bg-background border-b border-border flex items-center px-6 gap-4 flex-shrink-0'>
      <div className='flex items-center gap-1.5 text-sm flex-1 min-w-0'>
        {segments.map((seg, i) => {
          const label = breadcrumbMap[seg] || seg;
          const isLast = i === segments.length - 1;
          return (
            <div key={i} className='flex items-center gap-1.5 min-w-0'>
              {i > 0 && (
                <ChevronRight className='w-3.5 h-3.5 text-muted-foreground flex-shrink-0' />
              )}
              <span
                className={
                  isLast
                    ? "font-semibold text-foreground truncate"
                    : "text-muted-foreground truncate"
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className='flex items-center gap-2 flex-shrink-0'>
        <button
          type='button'
          aria-label='Notifications'
          className='relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
        >
          <Bell className='w-4 h-4' aria-hidden='true' />
          <span className='absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full' />
        </button>

        <div className='flex items-center gap-3 pl-3 border-l border-border'>
          <div className='text-right hidden sm:block'>
            <p className='text-sm font-medium text-foreground leading-tight'>
              {user.nom}
            </p>
            <p className='text-xs text-muted-foreground leading-tight'>
              {user.email}
            </p>
          </div>
          <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0'>
            <span className='text-primary-foreground text-xs font-bold'>
              {user.nom.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <button
          type='button'
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label='Se déconnecter'
          className='p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground disabled:opacity-50'
        >
          <LogOut className='w-4 h-4' aria-hidden='true' />
        </button>
      </div>
    </header>
  );
}
