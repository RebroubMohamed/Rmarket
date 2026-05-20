// src/lib/dailyOrdersExcel.ts
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import path from "path";
import fs from "fs/promises";

export function getTodayFilename(): string {
  const today = new Date().toISOString().split("T")[0];
  return `commandes-${today}.xlsx`;
}

export function getTodayFilePath(): string {
  return path.join(process.cwd(), "public", "exports", getTodayFilename());
}

export async function ensureExportsDir() {
  const dir = path.join(process.cwd(), "public", "exports");
  await fs.mkdir(dir, { recursive: true });
}

export async function generateDailyOrdersExcel(): Promise<string> {
  await ensureExportsDir();

  const filePath = getTodayFilePath();
  const filename = getTodayFilename();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ShopAdmin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Commandes du jour", {
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
    { header: "Heure", key: "createdAt", width: 12 },
    { header: "Produits", key: "produits", width: 40 },
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

  orders.forEach((order, idx) => {
    const produits = order.items
      .map((i) => `${i.nomProduit} x${i.quantite}`)
      .join(", ");

    const row = sheet.addRow({
      numero: order.numero,
      clientNom: order.clientNom,
      clientTelephone: order.clientTelephone,
      clientEmail: order.clientEmail ?? "",
      clientAdresse: order.clientAdresse,
      clientVille: order.clientVille,
      total: order.total,
      statut: ORDER_STATUS_LABELS[order.statut] ?? order.statut,
      createdAt: new Date(order.createdAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      produits,
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

  if (orders.length > 0) {
    sheet.addRow([]);
    const totalRow = sheet.addRow({
      numero: `TOTAL (${orders.length} commande${orders.length > 1 ? "s" : ""})`,
      total: orders.reduce((s, o) => s + o.total, 0),
    });
    totalRow.getCell("numero").font = { bold: true };
    totalRow.getCell("total").font = { bold: true };
    totalRow.getCell("total").numFmt = '#,##0.00 "MAD"';
    totalRow.getCell("total").alignment = { horizontal: "right" };
  }

  sheet.autoFilter = { from: "A1", to: "K1" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  await workbook.xlsx.writeFile(filePath);

  return filename;
}
