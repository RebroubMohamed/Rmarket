// src/app/api/admin/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { importProductsFromExcel } from "@/lib/exportExcel";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Format invalide — fichier .xlsx requis" },
        { status: 400 },
      );
    }

    // ✅ file.arrayBuffer() retourne ArrayBuffer — aucun conflit de types
    const bytes = await file.arrayBuffer();
    const result = await importProductsFromExcel(bytes);

    return NextResponse.json({
      ...result,
      message: `${result.imported.length} produit(s) importé(s)${
        result.errors.length > 0 ? `, ${result.errors.length} erreur(s)` : ""
      }`,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'import" },
      { status: 500 },
    );
  }
}
