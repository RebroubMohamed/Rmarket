// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  FileSpreadsheet,
  Users,
  Settings,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tag },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/excel", label: "Excel", icon: FileSpreadsheet },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className='w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col'>
      {/* Logo */}
      <div className='h-16 flex items-center px-6 border-b border-sidebar-border'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center'>
            <ShoppingBag className='w-4 h-4 text-white' />
          </div>
          <div>
            <span className='font-bold text-white text-sm'>ShopAdmin</span>
            <p className='text-sidebar-foreground/40 text-xs'>Backoffice</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
        <p className='text-sidebar-foreground/30 text-xs font-semibold uppercase tracking-wider px-3 mb-3'>
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-white/10 text-white"
                  : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  active
                    ? "text-white"
                    : "text-sidebar-foreground/50 group-hover:text-white",
                )}
              />
              <span className='flex-1'>{item.label}</span>
              {active && <ChevronRight className='w-3 h-3 text-white/50' />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-sidebar-border'>
        <div className='flex items-center gap-3 px-2'>
          <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0'>
            <span className='text-white text-xs font-bold'>A</span>
          </div>
          <div className='min-w-0'>
            <p className='text-white text-xs font-medium'>Admin</p>
            <p className='text-sidebar-foreground/40 text-xs truncate'>ADMIN</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
