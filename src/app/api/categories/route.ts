// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import slugify from "slugify";

const schema = z.object({ nom: z.string().min(1, "Nom requis") });

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { nom: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { nom } = schema.parse(await req.json());
    const slug = slugify(nom, { lower: true, strict: true });

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing)
      return NextResponse.json(
        { error: "Ce slug existe déjà" },
        { status: 400 },
      );

    const category = await prisma.category.create({
      data: { nom, slug },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
