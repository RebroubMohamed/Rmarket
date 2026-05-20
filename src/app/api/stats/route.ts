// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalProducts,
      activeProducts,
      outOfStock,
      totalOrders,
      pendingOrders,
      totalCategories,
      totalUsers,
      revenueData,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { actif: true } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.order.count(),
      prisma.order.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.category.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { statut: { not: "ANNULEE" } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.groupBy({
        by: ["statut"],
        _count: { id: true },
      }),
    ]);

    // Monthly revenue — last 6 months
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const revenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          statut: { not: "ANNULEE" },
        },
      });

      monthlyRevenue.push({
        month: date.toLocaleDateString("fr-FR", { month: "short" }),
        revenue: revenue._sum.total || 0,
      });
    }

    return NextResponse.json({
      totalProducts,
      activeProducts,
      outOfStock,
      totalOrders,
      pendingOrders,
      totalCategories,
      totalUsers,
      totalRevenue: revenueData._sum.total || 0,
      recentOrders,
      ordersByStatus,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
