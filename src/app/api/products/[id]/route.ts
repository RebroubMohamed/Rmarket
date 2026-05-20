// src/app/api/products/[id]/route.ts
// Remplace votre fichier existant

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  nom: z.string().min(1),
  description: z.string().optional().nullable(),
  prix: z.number().positive(),
  stock: z.number().int().min(0),
  image: z.string().url().optional().nullable().or(z.literal("")),
  actif: z.boolean(),
  categoryId: z.string().min(1),
});

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product)
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { id } = await params;
    const data = productSchema.parse(await req.json());

    const product = await prisma.product.update({
      where: { id },
      data: {
        nom: data.nom,
        description: data.description || null,
        prix: data.prix,
        stock: data.stock,
        image: data.image || null,
        actif: data.actif,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
