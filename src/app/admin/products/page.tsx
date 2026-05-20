// src/app/admin/products/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  nom: string;
  description?: string;
  prix: number;
  stock: number;
  image?: string;
  actif: boolean;
  categoryId: string;
  category: { id: string; nom: string };
  createdAt: string;
}

interface Category {
  id: string;
  nom: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        categoryId: categoryFilter,
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  async function toggleActif(product: Product) {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          actif: !product.actif,
          categoryId: product.categoryId,
        }),
      });
      toast.success(`Produit ${!product.actif ? "activé" : "désactivé"}`);
      fetchProducts();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Produit supprimé");
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <div className='space-y-6 animate-fade-in'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Produits</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            {total} produit(s)
          </p>
        </div>
        <Link
          href='/admin/products/new'
          className='flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm'
        >
          <Plus className='w-4 h-4' /> Ajouter
        </Link>
      </div>

      <div className='bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3'>
        <div className='relative flex-1 min-w-48'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Rechercher un produit...'
            className='w-full pl-9 pr-4 py-2 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring'
          />
        </div>
        <div className='relative'>
          <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label='Filtrer par catégorie'
            className='pl-9 pr-8 py-2 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer min-w-[160px]'
          >
            <option value=''>Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='bg-card border border-border rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border bg-muted/50'>
                {[
                  "Produit",
                  "Prix",
                  "Stock",
                  "Catégorie",
                  "Statut",
                  "Ajouté",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`text-${h === "Actions" ? "right" : "left"} text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className='px-4 py-3'>
                        <div className='h-4 skeleton rounded' />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className='px-4 py-16 text-center'>
                    <Package className='w-10 h-10 text-muted-foreground/30 mx-auto mb-3' />
                    <p className='text-muted-foreground font-medium'>
                      Aucun produit trouvé
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className='hover:bg-muted/30 transition-colors'
                  >
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0'>
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.nom}
                              width={40}
                              height={40}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              <Package className='w-4 h-4 text-muted-foreground/40' />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className='font-medium text-sm text-foreground'>
                            {product.nom}
                          </p>
                          {product.description && (
                            <p className='text-xs text-muted-foreground truncate max-w-[200px]'>
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='font-semibold text-sm'>
                        {formatCurrency(product.prix)}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          product.stock === 0
                            ? "text-red-500"
                            : product.stock < 10
                              ? "text-amber-500"
                              : "text-foreground",
                        )}
                      >
                        {product.stock === 0 ? (
                          <span className='flex items-center gap-1'>
                            <AlertTriangle className='w-3 h-3' /> Rupture
                          </span>
                        ) : (
                          product.stock
                        )}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-medium'>
                        {product.category.nom}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => toggleActif(product)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
                          product.actif
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {product.actif ? (
                          <ToggleRight className='w-3.5 h-3.5' />
                        ) : (
                          <ToggleLeft className='w-3.5 h-3.5' />
                        )}
                        {product.actif ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {formatDate(product.createdAt)}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-end gap-1'>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
                        >
                          <Edit className='w-3.5 h-3.5' />
                        </Link>
                        <button
                          type='button'
                          title='Supprimer le produit'
                          onClick={() => setDeleteId(product.id)}
                          className='p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className='flex items-center justify-between px-4 py-3 border-t border-border'>
            <p className='text-xs text-muted-foreground'>
              Page {page} sur {totalPages}
            </p>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                title='Page précédente'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <button
                type='button'
                title='Page suivante'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in'>
          <div className='bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl'>
            <div className='w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4'>
              <Trash2 className='w-5 h-5 text-destructive' />
            </div>
            <h3 className='font-semibold mb-1'>Supprimer le produit ?</h3>
            <p className='text-sm text-muted-foreground mb-6'>
              Cette action est irréversible.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteId(null)}
                className='flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors'
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className='flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors'
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




