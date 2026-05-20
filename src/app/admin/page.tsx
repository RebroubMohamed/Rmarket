// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  Tag,
  type LucideIcon,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Order {
  id: string;
  statut: string;
  _count?: { id: number };
}

interface RecentOrder extends Order {
  numero: string;
  clientNom: string;
  total: number;
  createdAt: string;
}

interface OrderStatus {
  statut: string;
  _count: { id: number };
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalOrders: number;
  pendingOrders: number;
  totalCategories: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
  ordersByStatus: OrderStatus[];
  monthlyRevenue: { month: string; revenue: number }[];
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className='bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5'>
      <div className='flex items-start justify-between mb-4'>
        <div className={cn("p-2.5 rounded-lg", color)}>
          <Icon className='w-5 h-5' />
        </div>
      </div>
      <p className='text-2xl font-bold text-foreground'>{value}</p>
      <p className='text-sm text-muted-foreground mt-0.5'>{title}</p>
      {sub && <p className='text-xs text-muted-foreground/70 mt-1'>{sub}</p>}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className='space-y-6 animate-pulse'>
        <div className='h-8 w-48 skeleton rounded' />
        <div className='grid grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-32 skeleton rounded-xl' />
          ))}
        </div>
        <div className='grid grid-cols-3 gap-6'>
          <div className='col-span-2 h-80 skeleton rounded-xl' />
          <div className='h-80 skeleton rounded-xl' />
        </div>
        <div className='h-64 skeleton rounded-xl' />
      </div>
    );

  if (!stats)
    return (
      <div className='text-center py-16 text-muted-foreground'>
        Erreur lors du chargement
      </div>
    );

  const pieData = stats.ordersByStatus.map((s) => ({
    name: ORDER_STATUS_LABELS[s.statut],
    value: s._count.id,
  }));

  return (
    <div className='space-y-6 animate-fade-in'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Dashboard</h1>
        <p className='text-muted-foreground text-sm mt-1'>
          Vue d&apos;ensemble de votre boutique
        </p>
      </div>

      {/* Main stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Produits actifs'
          value={String(stats.activeProducts)}
          sub={`${stats.outOfStock} en rupture`}
          icon={Package}
          color='bg-blue-50 text-blue-600'
          href='/admin/products'
        />
        <StatCard
          title='Commandes'
          value={String(stats.totalOrders)}
          sub={`${stats.pendingOrders} en attente`}
          icon={ShoppingCart}
          color='bg-amber-50 text-amber-600'
          href='/admin/orders'
        />
        <StatCard
          title='Revenus totaux'
          value={formatCurrency(stats.totalRevenue)}
          sub='Hors annulées'
          icon={TrendingUp}
          color='bg-emerald-50 text-emerald-600'
        />
        <StatCard
          title='Rupture de stock'
          value={String(stats.outOfStock)}
          sub='À réapprovisionner'
          icon={AlertTriangle}
          color='bg-red-50 text-red-600'
          href='/admin/products'
        />
      </div>

      {/* Secondary */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          {
            label: "Catégories",
            value: stats.totalCategories,
            icon: Tag,
            href: "/admin/categories",
          },
          {
            label: "Utilisateurs",
            value: stats.totalUsers,
            icon: Users,
            href: "/admin/users",
          },
          {
            label: "Total produits",
            value: stats.totalProducts,
            icon: Package,
            href: "/admin/products",
          },
          {
            label: "En attente",
            value: stats.pendingOrders,
            icon: Clock,
            href: "/admin/orders",
          },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <div className='bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all flex items-center gap-3'>
              <s.icon className='w-4 h-4 text-muted-foreground' />
              <div>
                <p className='text-lg font-semibold'>{s.value}</p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 bg-card border border-border rounded-xl p-6'>
          <h2 className='font-semibold text-foreground mb-1'>
            Revenus mensuels
          </h2>
          <p className='text-xs text-muted-foreground mb-6'>6 derniers mois</p>
          <ResponsiveContainer width='100%' height={240}>
            <AreaChart data={stats.monthlyRevenue}>
              <defs>
                <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='hsl(var(--border))'
              />
              <XAxis
                dataKey='month'
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v) || 0), "Revenus"]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type='monotone'
                dataKey='revenue'
                stroke='#3b82f6'
                strokeWidth={2}
                fill='url(#colorRevenue)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-card border border-border rounded-xl p-6'>
          <h2 className='font-semibold text-foreground mb-1'>
            Statuts commandes
          </h2>
          <p className='text-xs text-muted-foreground mb-4'>
            Répartition actuelle
          </p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width='100%' height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey='value'
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='space-y-2 mt-2'>
                {pieData.map((d, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between text-xs'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2.5 h-2.5 rounded-full'
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className='text-muted-foreground'>{d.name}</span>
                    </div>
                    <span className='font-medium'>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='flex items-center justify-center h-40 text-muted-foreground text-sm'>
              Aucune commande
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className='bg-card border border-border rounded-xl'>
        <div className='p-6 border-b border-border flex items-center justify-between'>
          <div>
            <h2 className='font-semibold text-foreground'>
              Dernières commandes
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              5 commandes les plus récentes
            </p>
          </div>
          <Link
            href='/admin/orders'
            className='text-sm text-primary hover:underline font-medium'
          >
            Voir toutes →
          </Link>
        </div>
        <div className='divide-y divide-border'>
          {stats.recentOrders.length === 0 ? (
            <div className='p-8 text-center text-muted-foreground text-sm'>
              Aucune commande
            </div>
          ) : (
            stats.recentOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className='flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors'
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium text-sm font-mono'>
                      {order.numero}
                    </p>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border font-medium",
                        ORDER_STATUS_COLORS[order.statut],
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.statut]}
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {order.clientNom}
                  </p>
                </div>
                <div className='text-right flex-shrink-0'>
                  <p className='font-semibold text-sm'>
                    {formatCurrency(order.total)}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
