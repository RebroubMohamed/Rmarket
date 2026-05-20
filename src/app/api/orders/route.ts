// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/utils";
import { generateDailyOrdersExcel } from "@/lib/dailyOrdersExcel";

const orderItemSchema = z.object({
  productId: z.string(),
  nomProduit: z.string(),
  prix: z.number().positive(),
  quantite: z.number().int().positive(),
});

const orderSchema = z.object({
  clientNom: z.string().min(1, "Nom requis"),
  clientTelephone: z.string().min(6, "Téléphone requis"),
  clientAdresse: z.string().min(1, "Adresse requise"),
  clientVille: z.string().min(1, "Ville requise"),
  clientEmail: z.string().email().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1),
});

export async function GET(req: NextRequest) {
  // GET réservé aux admins
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const statut = searchParams.get("statut") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: "insensitive" } },
        { clientNom: { contains: search, mode: "insensitive" } },
        { clientVille: { contains: search, mode: "insensitive" } },
      ];
    }
    if (statut) where.statut = statut;
    // Dans GET, après le filtre statut :
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateParam);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: { select: { nom: true, image: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST public — les clients non-connectés peuvent passer commande
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const data = result.data;
    const total = data.items.reduce((sum, i) => sum + i.prix * i.quantite, 0);

    const order = await prisma.order.create({
      data: {
        numero: generateOrderNumber(),
        clientNom: data.clientNom,
        clientTelephone: data.clientTelephone,
        clientAdresse: data.clientAdresse,
        clientVille: data.clientVille,
        clientEmail: data.clientEmail || null,
        notes: data.notes || null,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            nomProduit: item.nomProduit,
            prix: item.prix,
            quantite: item.quantite,
          })),
        },
      },
      include: { items: true },
    });
    try {
      await generateDailyOrdersExcel();
    } catch (e) {
      console.warn("Excel daily update failed:", e);
    }
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 },
    );
  }
}
