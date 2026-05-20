// src/app/admin/categories/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Tag,
  Edit2,
  Trash2,
  Loader2,
  X,
  Check,
  Package,
} from "lucide-react";

interface Category {
  id: string;
  nom: string;
  slug: string;
  _count: { products: number };
}

// ── Inline edit/create row ────────────────────────────────────────────────────
function CategoryRow({
  category,
  onSaved,
  onDelete,
}: {
  category: Category;
  onSaved: () => void;
  onDelete: (id: string, nom: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState(category.nom);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!nom.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erreur inconnue");
      }
      toast.success("Catégorie mise à jour");
      setEditing(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setNom(category.nom);
    setEditing(false);
  }

  return (
    <tr className='hover:bg-muted/30 transition-colors group'>
      {/* Nom */}
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
            <Tag className='w-3.5 h-3.5 text-primary' />
          </div>
          {editing ? (
            <input
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              className='px-3 py-1.5 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring w-48'
            />
          ) : (
            <span className='font-medium text-sm text-foreground'>
              {category.nom}
            </span>
          )}
        </div>
      </td>

      {/* Slug */}
      <td className='px-4 py-3'>
        <span className='text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md'>
          {category.slug}
        </span>
      </td>

      {/* Produits */}
      <td className='px-4 py-3'>
        <span className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <Package className='w-3.5 h-3.5' />
          {category._count.products}
        </span>
      </td>

      {/* Actions */}
      <td className='px-4 py-3'>
        <div className='flex items-center justify-end gap-1'>
          {editing ? (
            <>
              <button
                type='button'
                onClick={save}
                disabled={saving || !nom.trim()}
                aria-label='Confirmer'
                className='p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors'
              >
                {saving ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <Check className='w-3.5 h-3.5' />
                )}
              </button>
              <button
                type='button'
                onClick={cancel}
                aria-label='Annuler'
                className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={() => setEditing(true)}
                aria-label='Modifier'
                className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100'
              >
                <Edit2 className='w-3.5 h-3.5' />
              </button>
              <button
                type='button'
                onClick={() => onDelete(category.id, category.nom)}
                aria-label='Supprimer'
                className='p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100'
              >
                <Trash2 className='w-3.5 h-3.5' />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNom, setNewNom] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    nom: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data: Category[] = await res.json();
      setCategories(data);
    } catch {
      toast.error("Impossible de charger les catégories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleCreate() {
    if (!newNom.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newNom.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(
          Array.isArray(d.error)
            ? d.error.map((i: { message: string }) => i.message).join(", ")
            : (d.error ?? "Erreur inconnue"),
        );
      }
      toast.success("Catégorie créée !");
      setNewNom("");
      setShowCreate(false);
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erreur inconnue");
      }
      toast.success("Catégorie supprimée");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeleting(false);
    }
  }

  const totalProducts = categories.reduce(
    (sum, c) => sum + c._count.products,
    0,
  );

  return (
    <div className='space-y-6 animate-fade-in'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Catégories</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            {categories.length} catégorie(s) · {totalProducts} produit(s)
          </p>
        </div>
        <button
          type='button'
          onClick={() => setShowCreate((v) => !v)}
          className='flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm'
        >
          <Plus className='w-4 h-4' />
          Ajouter
        </button>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
        <div className='bg-card border border-border rounded-xl p-4'>
          <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1'>
            Total catégories
          </p>
          <p className='text-2xl font-bold text-foreground'>
            {categories.length}
          </p>
        </div>
        <div className='bg-card border border-border rounded-xl p-4'>
          <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1'>
            Produits couverts
          </p>
          <p className='text-2xl font-bold text-foreground'>{totalProducts}</p>
        </div>
        <div className='bg-card border border-border rounded-xl p-4'>
          <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1'>
            Catégories vides
          </p>
          <p className='text-2xl font-bold text-foreground'>
            {categories.filter((c) => c._count.products === 0).length}
          </p>
        </div>
      </div>

      {/* Create row */}
      {showCreate && (
        <div className='bg-card border border-primary/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in'>
          <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
            <Tag className='w-3.5 h-3.5 text-primary' />
          </div>
          <input
            autoFocus
            value={newNom}
            onChange={(e) => setNewNom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setShowCreate(false);
                setNewNom("");
              }
            }}
            placeholder='Nom de la catégorie...'
            className='flex-1 px-3 py-1.5 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring'
          />
          <button
            type='button'
            onClick={handleCreate}
            disabled={creating || !newNom.trim()}
            className='flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors'
          >
            {creating ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Check className='w-3.5 h-3.5' />
            )}
            Créer
          </button>
          <button
            type='button'
            onClick={() => {
              setShowCreate(false);
              setNewNom("");
            }}
            className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      )}

      {/* Table */}
      <div className='bg-card border border-border rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border bg-muted/50'>
                {["Catégorie", "Slug", "Produits", "Actions"].map((h) => (
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
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className='px-4 py-3'>
                        <div className='h-4 skeleton rounded' />
                      </td>
                    ))}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-4 py-16 text-center'>
                    <Tag className='w-10 h-10 text-muted-foreground/30 mx-auto mb-3' />
                    <p className='text-muted-foreground font-medium'>
                      Aucune catégorie
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Cliquez sur « Ajouter » pour commencer
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    onSaved={fetchCategories}
                    onDelete={(id, nom) => setDeleteTarget({ id, nom })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in'>
          <div className='bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl'>
            <div className='w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4'>
              <Trash2 className='w-5 h-5 text-destructive' />
            </div>
            <h3 className='font-semibold mb-1'>Supprimer la catégorie ?</h3>
            <p className='text-sm text-muted-foreground mb-6'>
              «{deleteTarget.nom}» sera définitivement supprimée. Cette action
              est irréversible.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteTarget(null)}
                className='flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors'
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors'
              >
                {deleting && <Loader2 className='w-3.5 h-3.5 animate-spin' />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
