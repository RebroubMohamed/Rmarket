// src/app/admin/excel/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Download,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";

type OrderStatus =
  | "EN_ATTENTE"
  | "CONFIRMEE"
  | "EN_LIVRAISON"
  | "LIVREE"
  | "ANNULEE";

interface OrderItem {
  nomProduit: string;
  quantite: number;
  prix: number;
}

interface Order {
  id: string;
  numero: string;
  clientNom: string;
  clientTelephone: string;
  clientVille: string;
  total: number;
  statut: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  notes?: string | null;
}

interface DailyFileInfo {
  exists: boolean;
  filename: string;
  url?: string;
  size?: number;
  updatedAt?: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  EN_ATTENTE: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMEE: "bg-blue-50 text-blue-700 border-blue-200",
  EN_LIVRAISON: "bg-purple-50 text-purple-700 border-purple-200",
  LIVREE: "bg-green-50 text-green-700 border-green-200",
  ANNULEE: "bg-red-50 text-red-700 border-red-200",
};

export default function ExcelPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fileInfo, setFileInfo] = useState<DailyFileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `/api/orders?limit=100&search=&statut=&page=1&date=${today}`,
    );
    const data = await res.json();
    setOrders(data.orders ?? []);
  }, []);

  const fetchFileInfo = useCallback(async () => {
    const res = await fetch("/api/admin/daily-excel");
    setFileInfo(await res.json());
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchFileInfo()]);
    setLastRefresh(new Date());
    setLoading(false);
  }, [fetchOrders, fetchFileInfo]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function regenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/admin/daily-excel", { method: "POST" });
      const data = await res.json();
      setFileInfo({ ...data, exists: true });
    } finally {
      setRegenerating(false);
    }
  }

  async function updateStatus(orderId: string, statut: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, statut } : o)),
      );
      // Régénère le fichier Excel après modification
      await fetch("/api/admin/daily-excel", { method: "POST" });
      await fetchFileInfo();
    } finally {
      setUpdatingId(null);
    }
  }

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalJour = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className='p-6 space-y-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex items-start justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
            <FileSpreadsheet className='w-5 h-5 text-green-600' />
            Commandes du jour
          </h1>
          <p className='text-sm text-gray-500 capitalize mt-0.5'>{today}</p>
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          <button
            onClick={refresh}
            disabled={loading}
            className='flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
          <button
            onClick={regenerate}
            disabled={regenerating}
            className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors'
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`}
            />
            {regenerating ? "Génération..." : "Mettre à jour Excel"}
          </button>
          {fileInfo?.exists && fileInfo.url && (
            <a
              href={fileInfo.url}
              download={fileInfo.filename}
              className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <Download className='w-3.5 h-3.5' />
              Télécharger
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='bg-white border border-gray-100 rounded-xl p-4'>
          <p className='text-xs text-gray-400 mb-1'>Commandes</p>
          <p className='text-2xl font-semibold text-gray-900'>
            {orders.length}
          </p>
        </div>
        <div className='bg-white border border-gray-100 rounded-xl p-4'>
          <p className='text-xs text-gray-400 mb-1'>Total du jour</p>
          <p className='text-2xl font-semibold text-gray-900'>
            {totalJour.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
            MAD
          </p>
        </div>
        <div className='bg-white border border-gray-100 rounded-xl p-4'>
          <p className='text-xs text-gray-400 mb-1'>Fichier Excel</p>
          {fileInfo?.exists ? (
            <div className='flex items-center gap-1.5 mt-1'>
              <CheckCircle className='w-4 h-4 text-green-500' />
              <span className='text-sm text-gray-600'>
                {fileInfo.updatedAt
                  ? `MàJ ${new Date(fileInfo.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Disponible"}
              </span>
            </div>
          ) : (
            <p className='text-sm text-gray-400 mt-1'>Non généré</p>
          )}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className='flex items-center gap-1.5 text-xs text-gray-400'>
        <Clock className='w-3 h-3' />
        Actualisation auto toutes les 60s — dernière:{" "}
        {lastRefresh.toLocaleTimeString("fr-FR")}
      </div>

      {/* Table */}
      <div className='bg-white border border-gray-100 rounded-xl overflow-hidden'>
        {loading ? (
          <div className='flex items-center justify-center h-40 text-gray-400 text-sm'>
            Chargement...
          </div>
        ) : orders.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2'>
            <FileSpreadsheet className='w-8 h-8 text-gray-300' />
            Aucune commande aujourd&apos;hui
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-100 bg-gray-50'>
                  <th className='text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    N°
                  </th>
                  <th className='text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Client
                  </th>
                  <th className='text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Ville
                  </th>
                  <th className='text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Produits
                  </th>
                  <th className='text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Total
                  </th>
                  <th className='text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Heure
                  </th>
                  <th className='text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className='hover:bg-gray-50/50 transition-colors'
                  >
                    <td className='px-4 py-3 font-mono text-xs text-gray-500'>
                      {order.numero}
                    </td>
                    <td className='px-4 py-3'>
                      <p className='font-medium text-gray-900'>
                        {order.clientNom}
                      </p>
                      <p className='text-xs text-gray-400'>
                        {order.clientTelephone}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-gray-600'>
                      {order.clientVille}
                    </td>
                    <td className='px-4 py-3 max-w-xs'>
                      <p className='text-gray-600 text-xs leading-relaxed truncate'>
                        {order.items
                          .map((i) => `${i.nomProduit} ×${i.quantite}`)
                          .join(", ")}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap'>
                      {order.total.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      MAD
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-400 whitespace-nowrap'>
                      {new Date(order.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='relative'>
                        <select
                          value={order.statut}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            updateStatus(
                              order.id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className={`appearance-none text-xs font-medium px-2.5 py-1.5 pr-7 rounded-md border cursor-pointer transition-opacity disabled:opacity-50 ${STATUS_COLORS[order.statut]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className='w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60' />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
