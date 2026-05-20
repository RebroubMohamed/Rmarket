// src/lib/exportExcel.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

// ─── writeBuffer() retourne un type opaque selon les versions d'ExcelJS+Node ──
// On évite tout cast de Buffer — on retourne directement ce que writeBuffer donne
// et on laisse les routes le consommer via Response(body) standard.
async function getWorkbookBytes(
  workbook: ExcelJS.Workbook,
): Promise<ArrayBuffer> {
  // writeBuffer() est typé comme retournant Buffer dans ExcelJS,
  // mais à l'exécution c'est un ArrayBuffer-compatible.
  // On passe par `any` une seule fois ici pour couper court aux conflits de types.
  const result: any = await workbook.xlsx.writeBuffer();
  // Normalise en ArrayBuffer pur — accepté par new Response() et NextResponse
  if (result instanceof ArrayBuffer) return result;
  if (result?.buffer instanceof ArrayBuffer) {
    return result.buffer.slice(
      result.byteOffset,
      result.byteOffset + result.byteLength,
    ) as ArrayBuffer;
  }
  // Dernier recours : copie propre
  return new Uint8Array(result).buffer as ArrayBuffer;
}

export async function exportOrdersExcel(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ShopAdmin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Commandes", {
    pageSetup: { fitToPage: true },
  });

  sheet.columns = [
    { header: "N° Commande", key: "numero", width: 18 },
    { header: "Client", key: "clientNom", width: 22 },
    { header: "Téléphone", key: "clientTelephone", width: 16 },
    { header: "Email", key: "clientEmail", width: 24 },
    { header: "Adresse", key: "clientAdresse", width: 30 },
    { header: "Ville", key: "clientVille", width: 16 },
    { header: "Total (MAD)", key: "total", width: 14 },
    { header: "Statut", key: "statut", width: 16 },
    { header: "Date", key: "createdAt", width: 18 },
    { header: "Notes", key: "notes", width: 30 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  sheet.getRow(1).height = 30;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  orders.forEach((order, idx) => {
    const row = sheet.addRow({
      numero: order.numero,
      clientNom: order.clientNom,
      clientTelephone: order.clientTelephone,
      clientEmail: order.clientEmail ?? "",
      clientAdresse: order.clientAdresse,
      clientVille: order.clientVille,
      total: order.total,
      statut: ORDER_STATUS_LABELS[order.statut] ?? order.statut,
      createdAt: new Date(order.createdAt).toLocaleDateString("fr-FR"),
      notes: order.notes ?? "",
    });
    if (idx % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      });
    }
    row.getCell("total").numFmt = '#,##0.00 "MAD"';
    row.getCell("total").alignment = { horizontal: "right" };
  });

  sheet.autoFilter = { from: "A1", to: "J1" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return getWorkbookBytes(workbook);
}

export async function exportProductsExcel(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Produits");

  sheet.columns = [
    { header: "Nom", key: "nom", width: 30 },
    { header: "Description", key: "description", width: 40 },
    { header: "Prix (MAD)", key: "prix", width: 14 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Catégorie", key: "category", width: 20 },
    { header: "Actif", key: "actif", width: 10 },
    { header: "Date création", key: "createdAt", width: 16 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  sheet.getRow(1).height = 28;

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { nom: "asc" },
  });

  products.forEach((p, idx) => {
    const row = sheet.addRow({
      nom: p.nom,
      description: p.description ?? "",
      prix: p.prix,
      stock: p.stock,
      category: p.category.nom,
      actif: p.actif ? "Oui" : "Non",
      createdAt: new Date(p.createdAt).toLocaleDateString("fr-FR"),
    });
    if (idx % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      });
    }
    row.getCell("prix").numFmt = '#,##0.00 "MAD"';
  });

  sheet.autoFilter = { from: "A1", to: "G1" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return getWorkbookBytes(workbook);
}

export async function generateImportTemplate(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Template Import Produits");

  sheet.columns = [
    { header: "nom *", key: "nom", width: 30 },
    { header: "description", key: "description", width: 40 },
    { header: "prix * (nombre)", key: "prix", width: 16 },
    { header: "stock * (entier)", key: "stock", width: 14 },
    { header: "categorySlug *", key: "categorySlug", width: 20 },
    { header: "image (url)", key: "image", width: 30 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle" };
  });

  sheet.addRow({
    nom: "Exemple Produit",
    description: "Description du produit",
    prix: 299,
    stock: 50,
    categorySlug: "electronique",
    image: "https://example.com/image.jpg",
  });

  const info = workbook.addWorksheet("Instructions");
  [
    ["Champ", "Obligatoire", "Type", "Description"],
    ["nom", "Oui", "Texte", "Nom du produit"],
    ["description", "Non", "Texte", "Description longue"],
    ["prix", "Oui", "Nombre décimal", "Prix en MAD (ex: 299.99)"],
    ["stock", "Oui", "Entier", "Quantité en stock"],
    ["categorySlug", "Oui", "Texte", "Slug exact (ex: electronique)"],
    ["image", "Non", "URL", "URL complète de l'image"],
  ].forEach((r) => info.addRow(r));

  return getWorkbookBytes(workbook);
}

// ─── Import ───────────────────────────────────────────────────────────────────
export async function importProductsFromExcel(input: ArrayBuffer): Promise<{
  imported: string[];
  errors: string[];
}> {
  const workbook = new ExcelJS.Workbook();

  // ExcelJS.load() accepte un Buffer en interne.
  // On passe par `any` pour éviter le conflit Buffer<ArrayBufferLike> vs Buffer.
  // À l'exécution, ArrayBuffer est accepté sans problème par ExcelJS.
  await (workbook.xlsx.load as any)(input);

  const sheet = workbook.getWorksheet(1);
  if (!sheet) throw new Error("Feuille introuvable");

  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  // eachRow évite l'erreur "[Symbol.iterator] manquant sur Worksheet"
  const rows: Array<{
    nom: string;
    description: string;
    prix: number;
    stock: number;
    categorySlug: string;
    image: string;
    rowNum: number;
  }> = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    rows.push({
      nom: String(row.getCell(1).value ?? "").trim(),
      description: String(row.getCell(2).value ?? "").trim(),
      prix: parseFloat(String(row.getCell(3).value ?? "0")),
      stock: parseInt(String(row.getCell(4).value ?? "0"), 10),
      categorySlug: String(row.getCell(5).value ?? "").trim(),
      image: String(row.getCell(6).value ?? "").trim(),
      rowNum: rowNumber,
    });
  });

  const errors: string[] = [];
  const imported: string[] = [];

  for (const {
    nom,
    description,
    prix,
    stock,
    categorySlug,
    image,
    rowNum,
  } of rows) {
    if (!nom) continue;
    if (isNaN(prix) || prix <= 0) {
      errors.push(`Ligne ${rowNum}: Prix invalide pour "${nom}"`);
      continue;
    }
    if (!categorySlug) {
      errors.push(`Ligne ${rowNum}: Slug de catégorie manquant pour "${nom}"`);
      continue;
    }
    const categoryId = catMap.get(categorySlug);
    if (!categoryId) {
      errors.push(`Ligne ${rowNum}: Catégorie "${categorySlug}" introuvable`);
      continue;
    }
    try {
      await prisma.product.create({
        data: {
          nom,
          description: description || null,
          prix,
          stock: isNaN(stock) ? 0 : stock,
          categoryId,
          image: image || null,
        },
      });
      imported.push(nom);
    } catch {
      errors.push(`Ligne ${rowNum}: Erreur lors de la création de "${nom}"`);
    }
  }

  return { imported, errors };
}
