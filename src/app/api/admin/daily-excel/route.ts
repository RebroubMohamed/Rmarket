// src/app/api/admin/daily-excel/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  generateDailyOrdersExcel,
  getTodayFilename,
} from "@/lib/dailyOrdersExcel";
import path from "path";
import fs from "fs/promises";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const filename = getTodayFilename();
  const filePath = path.join(process.cwd(), "public", "exports", filename);

  try {
    const stat = await fs.stat(filePath);
    return NextResponse.json({
      filename,
      url: `/exports/${filename}`,
      size: stat.size,
      updatedAt: stat.mtime,
      exists: true,
    });
  } catch {
    return NextResponse.json({ exists: false, filename });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const filename = await generateDailyOrdersExcel();
    const filePath = path.join(process.cwd(), "public", "exports", filename);
    const stat = await fs.stat(filePath);

    return NextResponse.json({
      filename,
      url: `/exports/${filename}`,
      size: stat.size,
      updatedAt: stat.mtime,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur génération" }, { status: 500 });
  }
}
