// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  nom: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, "Minimum 6 caractères"),
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, nom: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { nom, email, password } = schema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email déjà utilisé" },
        { status: 400 },
      );

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { nom, email, password: hashed },
      select: { id: true, nom: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
