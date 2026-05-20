// src/lib/mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function envoyerNotificationCommande(order: {
  numeroCommande: string;
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  clientVille: string;
  total: number;
  items: { nomProduit: string; quantite: number; prix: number }[];
}) {
  const lignes = order.items
    .map(
      (i) => `<tr>
      <td style="padding:8px;border:1px solid #ddd">${i.nomProduit}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${i.quantite}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${i.prix} MAD</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${i.prix * i.quantite} MAD</td>
    </tr>`,
    )
    .join("");

  await transporter.sendMail({
    from: process.env.EMAIL_ADMIN,
    to: process.env.EMAIL_ADMIN,
    subject: `🛒 Nouvelle commande R-Market — ${order.numeroCommande}`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px">
        <h2 style="background:#f0a500;color:white;padding:15px;border-radius:8px">
          🛒 R-Market — Nouvelle Commande
        </h2>

        <h3>${order.numeroCommande}</h3>

        <h4>👤 Client</h4>
        <p><b>Nom :</b> ${order.clientNom}</p>
        <p><b>Téléphone :</b> ${order.clientTelephone}</p>
        <p><b>Adresse :</b> ${order.clientAdresse}, ${order.clientVille}</p>

        <h4>🛍️ Produits</h4>
        <table style="width:100%;border-collapse:collapse">
          <thead style="background:#f5f5f5">
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left">Produit</th>
              <th style="padding:8px;border:1px solid #ddd">Qté</th>
              <th style="padding:8px;border:1px solid #ddd">Prix</th>
              <th style="padding:8px;border:1px solid #ddd">Sous-total</th>
            </tr>
          </thead>
          <tbody>${lignes}</tbody>
        </table>

        <h3 style="color:green;margin-top:20px">
          💰 Total : ${order.total} MAD
        </h3>

        <p style="color:gray;font-size:12px">
          Reçue le ${new Date().toLocaleString("fr-FR")}
        </p>
      </div>
    `,
  });
}
