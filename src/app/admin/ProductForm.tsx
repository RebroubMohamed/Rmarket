// src/components/admin/ProductForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  nom: string;
}

interface ProductData {
  id?: string;
  nom: string;
  description?: string;
  prix: number;
  stock: number;
  image?: string;
  actif: boolean;
  categoryId: string;
}

interface ZodIssue {
  message: string;
}

export default function ProductForm({ product }: { product?: ProductData }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(product?.image ?? "");

  // ── prix et stock stockés en string pour éviter NaN dans les inputs ────────
  const [form, setForm] = useState({
    nom: product?.nom ?? "",
    description: product?.description ?? "",
    prix: product?.prix != null ? String(product.prix) : "",
    stock: product?.stock != null ? String(product.stock) : "",
    image: product?.image ?? "",
    actif: product?.actif ?? true,
    categoryId: product?.categoryId ?? "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => toast.error("Impossible de charger les catégories"));
  }, []);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── Sélection fichier image ────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Fichier invalide — choisissez une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde — maximum 5 Mo");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = () => {
      set("image", reader.result as string);
      setUploadingImage(false);
    };
    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setPreviewUrl("");
    set("image", "");
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Soumission ─────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const prix = parseFloat(form.prix.replace(",", "."));
    const stock = parseInt(form.stock, 10);

    if (isNaN(prix) || prix <= 0) {
      toast.error("Prix invalide");
      setLoading(false);
      return;
    }
    if (isNaN(stock) || stock < 0) {
      toast.error("Stock invalide");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        nom: form.nom,
        description: form.description || null,
        prix,
        stock,
        image: form.image || null,
        actif: form.actif,
        categoryId: form.categoryId,
      };

      const url = product?.id ? `/api/products/${product.id}` : "/api/products";
      const method = product?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string | ZodIssue[] };
        const msg = Array.isArray(data.error)
          ? data.error.map((issue: ZodIssue) => issue.message).join(", ")
          : (data.error ?? "Erreur inconnue");
        throw new Error(msg);
      }

      toast.success(product?.id ? "Produit mis à jour !" : "Produit créé !");
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='space-y-6 animate-fade-in max-w-3xl'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link
          href='/admin/products'
          className='p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground'
          aria-label='Retour à la liste des produits'
        >
          <ArrowLeft className='w-4 h-4' aria-hidden='true' />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>
            {product ? "Modifier le produit" : "Nouveau produit"}
          </h1>
          <p className='text-muted-foreground text-sm mt-0.5'>
            {product
              ? `Édition de "${product.nom}"`
              : "Remplissez les informations du produit"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6' noValidate>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* ── Colonne principale ─────────────────────────────────────────── */}
          <div className='lg:col-span-2 space-y-5'>
            {/* Infos générales */}
            <div className='bg-card border border-border rounded-xl p-6 space-y-4'>
              <h2 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>
                Informations générales
              </h2>

              {/* Nom */}
              <div>
                <label
                  htmlFor='product-nom'
                  className='block text-sm font-medium text-foreground mb-1.5'
                >
                  Nom du produit *
                </label>
                <input
                  id='product-nom'
                  type='text'
                  required
                  value={form.nom}
                  onChange={(e) => set("nom", e.target.value)}
                  placeholder='Ex : iPhone 15 Pro Max'
                  aria-label='Nom du produit'
                  className='w-full px-4 py-2.5 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor='product-description'
                  className='block text-sm font-medium text-foreground mb-1.5'
                >
                  Description
                </label>
                <textarea
                  id='product-description'
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder='Description du produit...'
                  rows={4}
                  aria-label='Description du produit'
                  className='w-full px-4 py-2.5 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none'
                />
              </div>

              {/* Prix + Stock */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='product-prix'
                    className='block text-sm font-medium text-foreground mb-1.5'
                  >
                    Prix (MAD) *
                  </label>
                  <input
                    id='product-prix'
                    type='number'
                    required
                    min='0'
                    step='0.01'
                    value={form.prix}
                    onChange={(e) => set("prix", e.target.value)}
                    placeholder='0.00'
                    aria-label='Prix en MAD'
                    className='w-full px-4 py-2.5 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                  />
                </div>
                <div>
                  <label
                    htmlFor='product-stock'
                    className='block text-sm font-medium text-foreground mb-1.5'
                  >
                    Stock *
                  </label>
                  <input
                    id='product-stock'
                    type='number'
                    required
                    min='0'
                    step='1'
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    placeholder='0'
                    aria-label='Quantité en stock'
                    className='w-full px-4 py-2.5 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                  />
                </div>
              </div>
            </div>

            {/* ── Image upload ───────────────────────────────────────────── */}
            <div className='bg-card border border-border rounded-xl p-6 space-y-4'>
              <h2 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>
                Image du produit
              </h2>

              <input
                ref={fileRef}
                id='product-image-file'
                type='file'
                accept='image/*'
                aria-label='Choisir une image pour le produit'
                className='hidden'
                onChange={handleFileChange}
              />

              {/* Zone cliquable */}
              <button
                type='button'
                onClick={() => fileRef.current?.click()}
                aria-label='Ouvrir le sélecteur de fichier image'
                className='w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-all text-center'
              >
                {uploadingImage ? (
                  <Loader2
                    className='w-8 h-8 text-muted-foreground animate-spin'
                    aria-hidden='true'
                  />
                ) : previewUrl ? (
                  <>
                    <div className='w-full h-48 rounded-lg overflow-hidden'>
                      {/* img natif pour les blob:// et base64 (next/image ne les supporte pas) */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt='Aperçu du produit'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Cliquez pour changer l&apos;image
                    </p>
                  </>
                ) : (
                  <>
                    <div className='w-14 h-14 bg-muted rounded-xl flex items-center justify-center'>
                      <Upload
                        className='w-6 h-6 text-muted-foreground'
                        aria-hidden='true'
                      />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-foreground'>
                        Choisir une image
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        PNG, JPG, WEBP — max 5 Mo
                      </p>
                    </div>
                    <span className='px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold'>
                      Parcourir les fichiers
                    </span>
                  </>
                )}
              </button>

              {/* Supprimer */}
              {previewUrl && (
                <button
                  type='button'
                  onClick={removeImage}
                  aria-label="Supprimer l'image sélectionnée"
                  className='flex items-center gap-2 text-xs text-destructive hover:underline'
                >
                  <X className='w-3 h-3' aria-hidden='true' />
                  Supprimer l&apos;image
                </button>
              )}
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <div className='space-y-5'>
            <div className='bg-card border border-border rounded-xl p-6 space-y-4'>
              <h2 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>
                Organisation
              </h2>

              {/* Catégorie */}
              <div>
                <label
                  htmlFor='product-category'
                  className='block text-sm font-medium text-foreground mb-1.5'
                >
                  Catégorie *
                </label>
                <select
                  id='product-category'
                  required
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  aria-label='Sélectionner une catégorie'
                  title='Catégorie du produit'
                  className='w-full px-4 py-2.5 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer'
                >
                  <option value=''>Choisir une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statut toggle */}
              <div>
                <p className='text-sm font-medium text-foreground mb-3'>
                  Statut
                </p>
                <button
                  type='button'
                  role='switch'
                  aria-checked={form.actif}
                  aria-label={
                    form.actif ? "Désactiver le produit" : "Activer le produit"
                  }
                  onClick={() =>
                    set("actif", String(!form.actif) as unknown as boolean)
                  }
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors select-none ${
                    form.actif ? "bg-emerald-50" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                      form.actif ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form.actif ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      form.actif ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {form.actif ? "Produit actif" : "Produit inactif"}
                  </span>
                </button>
              </div>
            </div>

            {/* Save */}
            <button
              type='submit'
              disabled={loading || uploadingImage}
              className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
            >
              {loading ? (
                <>
                  <Loader2
                    className='w-4 h-4 animate-spin'
                    aria-hidden='true'
                  />{" "}
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4' aria-hidden='true' /> Sauvegarder
                </>
              )}
            </button>

            <Link
              href='/admin/products'
              className='w-full flex items-center justify-center px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors'
            >
              Annuler
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
