// src/app/api/admin/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  exportOrdersExcel,
  exportProductsExcel,
  generateImportTemplate,
} from "@/lib/exportExcel";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const type = new URL(req.url).searchParams.get("type") ?? "orders";

  try {
    let bytes: ArrayBuffer;
    let filename: string;

    if (type === "orders") {
      bytes = await exportOrdersExcel();
      filename = `commandes-${new Date().toISOString().split("T")[0]}.xlsx`;
    } else if (type === "products") {
      bytes = await exportProductsExcel();
      filename = `produits-${new Date().toISOString().split("T")[0]}.xlsx`;
    } else if (type === "template") {
      bytes = await generateImportTemplate();
      filename = "template-import-produits.xlsx";
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    // ✅ ArrayBuffer est un BodyInit valide — aucun conflit de types
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": XLSX_MIME,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 },
    );
  }
}
