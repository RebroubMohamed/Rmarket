// src/app/admin/products/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "../../ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className='animate-pulse space-y-6 max-w-3xl'>
        <div className='h-8 w-48 skeleton rounded' />
        <div className='h-64 skeleton rounded-xl' />
      </div>
    );
  if (!product)
    return (
      <div className='text-center py-16 text-muted-foreground'>
        Produit non trouvé
      </div>
    );

  return <ProductForm product={product} />;
}
