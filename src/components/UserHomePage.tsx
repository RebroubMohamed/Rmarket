// src/components/UserHomePage.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  nom: string;
  slug: string;
  _count: { products: number };
}
interface Product {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  stock: number;
  image: string | null;
  actif: boolean;
  categoryId: string;
  category: { id: string; nom: string; slug: string };
  createdAt: string;
}
interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
}

const GOLD =
  "linear-gradient(135deg,#c9a84c 0%,#e8c97a 40%,#c9a84c 70%,#9a7a2a 100%)";

function Gold({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        background: GOLD,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ISearch = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={18}
    height={18}
  >
    <circle cx='11' cy='11' r='8' />
    <path d='m21 21-4.35-4.35' />
  </svg>
);
const ICart = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={18}
    height={18}
  >
    <path d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' />
    <line x1='3' y1='6' x2='21' y2='6' />
    <path d='M16 10a4 4 0 0 1-8 0' />
  </svg>
);
const IArrow = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={16}
    height={16}
  >
    <path d='M5 12h14M12 5l7 7-7 7' />
  </svg>
);
const ICheck = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    width={18}
    height={18}
  >
    <path d='M20 6L9 17l-5-5' />
  </svg>
);
const IChevL = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    width={18}
    height={18}
  >
    <path d='M15 18l-6-6 6-6' />
  </svg>
);
const IChevR = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    width={18}
    height={18}
  >
    <path d='M9 18l6-6-6-6' />
  </svg>
);
const IPlus = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    width={16}
    height={16}
  >
    <path d='M12 5v14M5 12h14' />
  </svg>
);
const IMinus = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    width={14}
    height={14}
  >
    <path d='M5 12h14' />
  </svg>
);
const ITrash = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={15}
    height={15}
  >
    <path d='M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6' />
  </svg>
);
const IX = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    width={18}
    height={18}
  >
    <path d='M18 6 6 18M6 6l12 12' />
  </svg>
);
const IStar = ({ f }: { f: boolean }) => (
  <svg
    viewBox='0 0 24 24'
    width={13}
    height={13}
    fill={f ? "#c9a84c" : "none"}
    stroke='#c9a84c'
    strokeWidth='1.5'
  >
    <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
  </svg>
);
const ILoader = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    width={20}
    height={20}
    style={{ animation: "rmSpin 1s linear infinite" }}
  >
    <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' />
  </svg>
);
const IShield = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={14}
    height={14}
  >
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
  </svg>
);
const ITruck = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={14}
    height={14}
  >
    <path d='M1 3h15v13H1zM16 8h4l3 3v5h-7V8z' />
    <circle cx='5.5' cy='18.5' r='2.5' />
    <circle cx='18.5' cy='18.5' r='2.5' />
  </svg>
);
const IReturn = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={14}
    height={14}
  >
    <path d='M9 14l-4-4 4-4' />
    <path d='M5 10h11a4 4 0 0 1 0 8h-1' />
  </svg>
);
const IHeadset = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    width={14}
    height={14}
  >
    <path d='M3 11V9a9 9 0 0 1 18 0v2' />
    <rect x='2' y='11' width='4' height='6' rx='2' />
    <rect x='18' y='11' width='4' height='6' rx='2' />
  </svg>
);

// ─── Product image with emoji fallback ────────────────────────────────────────
const EMOJI: Record<string, string> = {
  electronique: "📱",
  vetements: "👗",
  maison: "🏠",
  sport: "👟",
  beaute: "✨",
  gaming: "🎮",
};

function ProdImg({
  src,
  alt,
  slug,
  style,
}: {
  src: string | null;
  alt: string;
  slug: string;
  style?: React.CSSProperties;
}) {
  const [err, setErr] = useState(false);
  const emoji = EMOJI[slug] ?? "🛍️";
  if (!src || err)
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f7f5",
          gap: 8,
          ...style,
        }}
      >
        <span style={{ fontSize: "3rem" }}>{emoji}</span>
        <span
          style={{
            fontSize: ".65rem",
            color: "#b0a898",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "0 8px",
          }}
        >
          {alt}
        </span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform .4s",
        ...style,
      }}
    />
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0ede8",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 260,
          background:
            "linear-gradient(90deg,#f8f7f5 25%,#f0ede8 50%,#f8f7f5 75%)",
          backgroundSize: "200% 100%",
          animation: "rmShimmer 1.5s infinite",
        }}
      />
      <div style={{ padding: 24 }}>
        {[
          ["40%", 10],
          ["70%", 16],
          ["55%", 10],
        ].map(([w, h], i) => (
          <div
            key={i}
            style={{
              height: h,
              width: w,
              background: "#f0ede8",
              borderRadius: 4,
              marginBottom: 10,
            }}
          />
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <div
            style={{
              height: 20,
              width: "35%",
              background: "#f0ede8",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#f0ede8",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTI = [
  {
    i: "AC",
    n: "Alexandre Chevalier",
    r: "Fashion Director, Paris",
    s: 5,
    t: "RM Market has redefined my shopping expectations. The packaging, the quality, the entire experience — nothing short of extraordinary. My watch arrived as if delivered by the brand itself.",
  },
  {
    i: "SN",
    n: "Sophia Nakamura",
    r: "Entrepreneur, Tokyo",
    s: 5,
    t: "I've shopped luxury for 20 years and RM Market sits at the top. Their curation is impeccable, delivery flawless. The gold-tier membership is worth every cent.",
  },
  {
    i: "KA",
    n: "Khalid Al-Rasheed",
    r: "Tech CEO, Dubai",
    s: 5,
    t: "My order arrived in 36 hours to Dubai. Flawless product, exactly as described. Their support team answered at 3am. This is what luxury service truly means in 2025.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL MODAL  ← NOUVEAU
// ═══════════════════════════════════════════════════════════════════════════════
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number) => void;
}

function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    setQty(1);
    setAdded(false);
  }, [product?.id]);

  // Close on Escape
  useEffect(() => {
    if (!product) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [product, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  const open = !!product;

  const handleAdd = () => {
    if (!product) return;
    onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const FEATURES = [
    { icon: <IShield />, label: "Authenticité garantie" },
    { icon: <ITruck />, label: "Livraison express" },
    { icon: <IReturn />, label: "Retour 30 jours" },
    { icon: <IHeadset />, label: "Support 24/7" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10002,
          background: "rgba(10,9,8,.78)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .4s",
        }}
      />

      {/* Modal container */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10003,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .35s",
        }}
      >
        {product && (
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              width: "100%",
              maxWidth: 880,
              maxHeight: "92vh",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              overflow: "hidden",
              boxShadow: "0 40px 120px rgba(0,0,0,.35)",
              transform: open
                ? "translateY(0) scale(1)"
                : "translateY(48px) scale(.96)",
              transition: "transform .45s cubic-bezier(.25,.46,.45,.94)",
            }}
          >
            {/* ── Left : image ── */}
            <div
              style={{
                background: "#f8f7f5",
                position: "relative",
                minHeight: 460,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <ProdImg
                src={product.image}
                alt={product.nom}
                slug={product.category.slug}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {/* Decorative gold line bottom */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: GOLD,
                }}
              />

              {/* Stock badge */}
              {product.stock === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 2,
                    fontSize: ".62rem",
                    fontWeight: 600,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: "linear-gradient(135deg,#1a1a1a,#333)",
                    color: "#fff",
                  }}
                >
                  Rupture de stock
                </div>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 2,
                    fontSize: ".62rem",
                    fontWeight: 600,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: GOLD,
                    color: "#fff",
                  }}
                >
                  Plus que {product.stock} !
                </div>
              )}

              {/* Category label bottom-left */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  zIndex: 2,
                  fontSize: ".65rem",
                  fontWeight: 600,
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  padding: "5px 12px",
                  borderRadius: 100,
                  background: "rgba(255,255,255,.9)",
                  color: "#c9a84c",
                  backdropFilter: "blur(4px)",
                }}
              >
                {product.category.nom}
              </div>
            </div>

            {/* ── Right : details ── */}
            <div
              style={{
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Header with close */}
              <div
                style={{
                  padding: "28px 32px 0",
                  display: "flex",
                  justifyContent: "flex-end",
                  flexShrink: 0,
                }}
              >
                <button
                  type='button'
                  onClick={onClose}
                  aria-label='Fermer'
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "1px solid #f0ede8",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b6460",
                    cursor: "pointer",
                    transition: "border-color .2s, color .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c9a84c";
                    e.currentTarget.style.color = "#c9a84c";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#f0ede8";
                    e.currentTarget.style.color = "#6b6460";
                  }}
                >
                  <IX />
                </button>
              </div>

              {/* Content */}
              <div
                style={{
                  padding: "16px 32px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  flex: 1,
                }}
              >
                {/* Product name */}
                <h2
                  className='rm-display'
                  style={{
                    fontSize: "clamp(1.6rem,3vw,2rem)",
                    fontWeight: 500,
                    color: "#0a0908",
                    lineHeight: 1.2,
                  }}
                >
                  {product.nom}
                </h2>

                {/* Stars */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <IStar key={i} f={i < 4} />
                  ))}
                  <span
                    style={{
                      fontSize: ".75rem",
                      color: "#b0a898",
                      marginLeft: 6,
                    }}
                  >
                    4.5 · 124 avis
                  </span>
                </div>

                {/* Price */}
                <div
                  style={{
                    padding: "16px 0",
                    borderTop: "1px solid #f0ede8",
                    borderBottom: "1px solid #f0ede8",
                  }}
                >
                  <Gold>
                    <span
                      className='rm-display'
                      style={{ fontSize: "2rem", fontWeight: 600 }}
                    >
                      {product.prix.toLocaleString("fr-MA", {
                        style: "currency",
                        currency: "MAD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </Gold>
                  <span
                    style={{
                      display: "block",
                      fontSize: ".75rem",
                      color: "#b0a898",
                      marginTop: 4,
                    }}
                  >
                    TVA incluse · Livraison gratuite
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <p
                    style={{
                      fontSize: ".88rem",
                      color: "#6b6460",
                      lineHeight: 1.8,
                      fontWeight: 300,
                    }}
                  >
                    {product.description}
                  </p>
                )}

                {/* Stock status */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        product.stock > 5
                          ? "#2d9a4a"
                          : product.stock > 0
                            ? "#c9a84c"
                            : "#ef4444",
                      boxShadow: `0 0 0 3px ${
                        product.stock > 5
                          ? "rgba(45,154,74,.15)"
                          : product.stock > 0
                            ? "rgba(201,168,76,.15)"
                            : "rgba(239,68,68,.15)"
                      }`,
                    }}
                  />
                  <span style={{ fontSize: ".82rem", color: "#6b6460" }}>
                    {product.stock > 5
                      ? "En stock — expédition sous 24h"
                      : product.stock > 0
                        ? `Dernières unités — ${product.stock} restante${product.stock > 1 ? "s" : ""}`
                        : "Rupture de stock"}
                  </span>
                </div>

                {/* Qty + Add to cart */}
                {product.stock > 0 ? (
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    {/* Qty selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #e4e0d8",
                        borderRadius: 100,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type='button'
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        style={{
                          width: 36,
                          height: 38,
                          background: "transparent",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#6b6460",
                        }}
                      >
                        <IMinus />
                      </button>
                      <span
                        style={{
                          minWidth: 32,
                          textAlign: "center",
                          fontSize: ".88rem",
                          fontWeight: 600,
                          color: "#0a0908",
                          borderLeft: "1px solid #e4e0d8",
                          borderRight: "1px solid #e4e0d8",
                          height: 38,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {qty}
                      </span>
                      <button
                        type='button'
                        onClick={() =>
                          setQty((q) => Math.min(product.stock, q + 1))
                        }
                        style={{
                          width: 36,
                          height: 38,
                          background: "transparent",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#6b6460",
                        }}
                      >
                        <IPlus />
                      </button>
                    </div>

                    {/* Add to cart button */}
                    <button
                      type='button'
                      onClick={handleAdd}
                      className='rm-btn-gold'
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        background: added
                          ? "linear-gradient(135deg,#2d9a4a 0%,#1e7a36 100%)"
                          : undefined,
                        transition:
                          "background .3s, transform .2s, box-shadow .2s",
                      }}
                    >
                      {added ? (
                        <>
                          <ICheck /> Ajouté au panier
                        </>
                      ) : (
                        <>
                          <IPlus /> Ajouter au panier
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type='button'
                    disabled
                    className='rm-btn-gold'
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      opacity: 0.4,
                    }}
                  >
                    Produit épuisé
                  </button>
                )}

                {/* Sub-total indicator */}
                {product.stock > 0 && qty > 1 && (
                  <p
                    style={{
                      fontSize: ".78rem",
                      color: "#b0a898",
                      textAlign: "center",
                      marginTop: -8,
                    }}
                  >
                    Sous-total :{" "}
                    <Gold>
                      <span style={{ fontWeight: 600 }}>
                        {(product.prix * qty).toLocaleString("fr-MA", {
                          style: "currency",
                          currency: "MAD",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </Gold>
                  </p>
                )}

                {/* Features grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: "auto",
                  }}
                >
                  {FEATURES.map((f) => (
                    <div
                      key={f.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 12px",
                        background: "#f8f7f5",
                        borderRadius: 6,
                        border: "1px solid #f0ede8",
                      }}
                    >
                      <span style={{ color: "#c9a84c", flexShrink: 0 }}>
                        {f.icon}
                      </span>
                      <span
                        style={{
                          fontSize: ".72rem",
                          color: "#6b6460",
                          lineHeight: 1.3,
                        }}
                      >
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Payment note */}
                <div
                  style={{
                    padding: "12px 14px",
                    background:
                      "linear-gradient(135deg,rgba(201,168,76,.05),rgba(232,201,122,.03))",
                    border: "1px solid rgba(201,168,76,.18)",
                    borderRadius: 6,
                  }}
                >
                  <p
                    style={{
                      fontSize: ".75rem",
                      color: "#9a7a2a",
                      lineHeight: 1.6,
                    }}
                  >
                    💳 <strong>Paiement à la livraison.</strong> Notre équipe
                    vous contactera sous 24h pour confirmer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── ORDER FORM MODAL ─────────────────────────────────────────────────────────
interface OrderFormProps {
  open: boolean;
  cart: CartItem[];
  onClose: () => void;
  onSuccess: (orderNum: string) => void;
}

function OrderFormModal({ open, cart, onClose, onSuccess }: OrderFormProps) {
  const [form, setForm] = useState({
    clientNom: "",
    clientTelephone: "",
    clientAdresse: "",
    clientVille: "",
    clientEmail: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.clientNom.trim()) e.clientNom = "Nom requis";
    if (!form.clientTelephone.trim()) e.clientTelephone = "Téléphone requis";
    if (!form.clientAdresse.trim()) e.clientAdresse = "Adresse requise";
    if (!form.clientVille.trim()) e.clientVille = "Ville requise";
    if (form.clientEmail && !/\S+@\S+\.\S+/.test(form.clientEmail))
      e.clientEmail = "Email invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const grouped = cart.reduce<
    Record<
      string,
      {
        productId: string;
        nomProduit: string;
        prix: number;
        quantite: number;
        image: string | null;
        slug: string;
      }
    >
  >((acc, item) => {
    const key = item.productId;
    if (!acc[key])
      acc[key] = {
        productId: item.productId,
        nomProduit: item.name,
        prix: item.price,
        quantite: 0,
        image: item.image,
        slug: item.slug,
      };
    acc[key].quantite++;
    return acc;
  }, {});

  const items = Object.values(grouped);
  const total = items.reduce((s, i) => s + i.prix * i.quantite, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          clientEmail: form.clientEmail || null,
          notes: form.notes || null,
          items: items.map((i) => ({
            productId: i.productId,
            nomProduit: i.nomProduit,
            prix: i.prix,
            quantite: i.quantite,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      onSuccess(data.numero);
    } catch (err: unknown) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Erreur lors de la commande",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    background: err ? "#fff5f5" : "#f8f7f5",
    border: `1px solid ${err ? "#f87171" : "#e4e0d8"}`,
    borderRadius: 4,
    fontSize: ".88rem",
    outline: "none",
    fontFamily: "'Outfit',sans-serif",
    color: "#0a0908",
    transition: "border-color .2s",
  });

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10002,
          background: "rgba(10,9,8,.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .4s",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10003,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .4s",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            width: "100%",
            maxWidth: 720,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 80px rgba(0,0,0,.25)",
            transform: open ? "translateY(0)" : "translateY(40px)",
            transition: "transform .5s cubic-bezier(.25,.46,.45,.94)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "28px 36px 20px",
              borderBottom: "1px solid #f0ede8",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <h2
                className='rm-display'
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 500,
                  color: "#0a0908",
                  marginBottom: 4,
                }}
              >
                Passer la{" "}
                <Gold>
                  <em>commande</em>
                </Gold>
              </h2>
              <p
                style={{
                  fontSize: ".78rem",
                  color: "#b0a898",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                {cart.length} article{cart.length > 1 ? "s" : ""} ·{" "}
                {total.toLocaleString("fr-MA", {
                  style: "currency",
                  currency: "MAD",
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <button
              type='button'
              onClick={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid #f0ede8",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b6460",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <IX />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              {/* Form */}
              <form
                id='order-form'
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div>
                  <p
                    style={{
                      fontSize: ".7rem",
                      fontWeight: 600,
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: "#c9a84c",
                      marginBottom: 16,
                    }}
                  >
                    Vos coordonnées
                  </p>
                  {[
                    {
                      id: "ord-nom",
                      key: "clientNom",
                      label: "Nom complet *",
                      type: "text",
                      placeholder: "Mohammed Alami",
                      required: true,
                    },
                    {
                      id: "ord-tel",
                      key: "clientTelephone",
                      label: "Téléphone *",
                      type: "tel",
                      placeholder: "06 12 34 56 78",
                      required: true,
                    },
                    {
                      id: "ord-email",
                      key: "clientEmail",
                      label: "Email (optionnel)",
                      type: "email",
                      placeholder: "email@exemple.com",
                      required: false,
                    },
                    {
                      id: "ord-adr",
                      key: "clientAdresse",
                      label: "Adresse de livraison *",
                      type: "text",
                      placeholder: "12 Rue Al Karama, Apt 3",
                      required: true,
                    },
                  ].map((f) => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <label
                        htmlFor={f.id}
                        style={{
                          display: "block",
                          fontSize: ".8rem",
                          fontWeight: 500,
                          color: "#0a0908",
                          marginBottom: 6,
                        }}
                      >
                        {f.label}
                      </label>
                      <input
                        id={f.id}
                        type={f.type}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => set(f.key, e.target.value)}
                        style={inputStyle(errors[f.key])}
                      />
                      {errors[f.key] && (
                        <p
                          style={{
                            fontSize: ".72rem",
                            color: "#ef4444",
                            marginTop: 4,
                          }}
                        >
                          {errors[f.key]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div style={{ marginBottom: 14 }}>
                    <label
                      htmlFor='ord-ville'
                      style={{
                        display: "block",
                        fontSize: ".8rem",
                        fontWeight: 500,
                        color: "#0a0908",
                        marginBottom: 6,
                      }}
                    >
                      Ville *
                    </label>
                    <select
                      id='ord-ville'
                      required
                      value={form.clientVille}
                      onChange={(e) => set("clientVille", e.target.value)}
                      style={{
                        ...inputStyle(errors.clientVille),
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value=''>Choisir une ville</option>
                      {[
                        "Casablanca",
                        "Rabat",
                        "Marrakech",
                        "Fès",
                        "Tanger",
                        "Agadir",
                        "Meknès",
                        "Oujda",
                        "Kénitra",
                        "Tétouan",
                        "Mohammadia",
                        "Salé",
                        "Laâyoune",
                        "Dakhla",
                      ].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    {errors.clientVille && (
                      <p
                        style={{
                          fontSize: ".72rem",
                          color: "#ef4444",
                          marginTop: 4,
                        }}
                      >
                        {errors.clientVille}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor='ord-notes'
                      style={{
                        display: "block",
                        fontSize: ".8rem",
                        fontWeight: 500,
                        color: "#0a0908",
                        marginBottom: 6,
                      }}
                    >
                      Notes{" "}
                      <span style={{ color: "#b0a898", fontWeight: 300 }}>
                        (optionnel)
                      </span>
                    </label>
                    <textarea
                      id='ord-notes'
                      rows={3}
                      placeholder='Instructions de livraison...'
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      style={{ ...inputStyle(), resize: "none" }}
                    />
                  </div>
                </div>
              </form>

              {/* Summary */}
              <div>
                <p
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 600,
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    color: "#c9a84c",
                    marginBottom: 16,
                  }}
                >
                  Récapitulatif
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        background: "#f8f7f5",
                        borderRadius: 6,
                        border: "1px solid #f0ede8",
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 6,
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#ede9e0",
                          border: "1px solid #f0ede8",
                        }}
                      >
                        <ProdImg
                          src={item.image}
                          alt={item.nomProduit}
                          slug={item.slug}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: ".82rem",
                            fontWeight: 500,
                            color: "#0a0908",
                            marginBottom: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.nomProduit}
                        </p>
                        <p style={{ fontSize: ".72rem", color: "#b0a898" }}>
                          Qté : {item.quantite}
                        </p>
                      </div>
                      <Gold>
                        <span
                          style={{
                            fontSize: ".88rem",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {(item.prix * item.quantite).toLocaleString("fr-MA", {
                            style: "currency",
                            currency: "MAD",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </Gold>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: "16px 0",
                    borderTop: "1px solid #f0ede8",
                    borderBottom: "1px solid #f0ede8",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: ".82rem", color: "#6b6460" }}>
                      Sous-total ({cart.length} article
                      {cart.length > 1 ? "s" : ""})
                    </span>
                    <span style={{ fontSize: ".82rem", color: "#0a0908" }}>
                      {total.toLocaleString("fr-MA", {
                        style: "currency",
                        currency: "MAD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: ".82rem", color: "#6b6460" }}>
                      Livraison
                    </span>
                    <span
                      style={{
                        fontSize: ".78rem",
                        color: "#c9a84c",
                        fontWeight: 500,
                      }}
                    >
                      Gratuite
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    className='rm-display'
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      color: "#0a0908",
                    }}
                  >
                    Total
                  </span>
                  <Gold>
                    <span
                      className='rm-display'
                      style={{ fontSize: "1.4rem", fontWeight: 600 }}
                    >
                      {total.toLocaleString("fr-MA", {
                        style: "currency",
                        currency: "MAD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </Gold>
                </div>
                <div
                  style={{
                    padding: "14px",
                    background:
                      "linear-gradient(135deg,rgba(201,168,76,.06),rgba(232,201,122,.04))",
                    border: "1px solid rgba(201,168,76,.2)",
                    borderRadius: 6,
                    marginTop: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: ".75rem",
                      color: "#9a7a2a",
                      lineHeight: 1.6,
                    }}
                  >
                    💳 <strong>Paiement à la livraison.</strong> Notre équipe
                    vous contactera pour confirmer votre commande.
                  </p>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                }}
              >
                <p style={{ fontSize: ".82rem", color: "#ef4444" }}>
                  ❌ {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "20px 36px 28px",
              borderTop: "1px solid #f0ede8",
              flexShrink: 0,
              display: "flex",
              gap: 12,
            }}
          >
            <button
              type='button'
              onClick={onClose}
              className='rm-btn-ghost'
              style={{ flex: "0 0 auto", justifyContent: "center" }}
            >
              Annuler
            </button>
            <button
              type='submit'
              form='order-form'
              disabled={loading}
              className='rm-btn-gold'
              style={{
                flex: 1,
                justifyContent: "center",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <>
                  <ILoader /> Envoi en cours...
                </>
              ) : (
                <>
                  <ICheck /> Confirmer la commande
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SUCCESS MODAL ────────────────────────────────────────────────────────────
function SuccessModal({
  orderNum,
  onClose,
}: {
  orderNum: string;
  onClose: () => void;
}) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10004,
          background: "rgba(10,9,8,.8)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10005,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "48px 40px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 80px rgba(0,0,0,.3)",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#c9a84c,#e8c97a)",
              margin: "0 auto 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(201,168,76,.4)",
            }}
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='#fff'
              strokeWidth='2.5'
              width={36}
              height={36}
            >
              <path d='M20 6L9 17l-5-5' />
            </svg>
          </div>
          <h2
            className='rm-display'
            style={{
              fontSize: "2rem",
              fontWeight: 500,
              color: "#0a0908",
              marginBottom: 12,
            }}
          >
            Commande{" "}
            <Gold>
              <em>confirmée</em>
            </Gold>
          </h2>
          <div
            style={{
              padding: "16px 20px",
              background: "#f8f7f5",
              borderRadius: 8,
              border: "1px solid rgba(201,168,76,.2)",
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: ".72rem",
                color: "#b0a898",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Numéro de commande
            </p>
            <p
              className='rm-display'
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#0a0908",
                letterSpacing: ".05em",
              }}
            >
              <Gold>{orderNum}</Gold>
            </p>
          </div>
          <p
            style={{
              fontSize: ".9rem",
              color: "#6b6460",
              lineHeight: 1.8,
              marginBottom: 32,
            }}
          >
            Merci pour votre confiance. Notre équipe vous contactera sous{" "}
            <strong>24h</strong> pour confirmer votre livraison.
          </p>
          <button
            type='button'
            onClick={onClose}
            className='rm-btn-gold'
            style={{ width: "100%", justifyContent: "center" }}
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
interface CartDrawerProps {
  open: boolean;
  cart: CartItem[];
  onClose: () => void;
  onRemoveOne: (idx: number) => void;
  onAddOne: (item: CartItem) => void;
  onClear: () => void;
  onCheckout: () => void;
}

function CartDrawer({
  open,
  cart,
  onClose,
  onRemoveOne,
  onAddOne,
  onClear,
  onCheckout,
}: CartDrawerProps) {
  const total = cart.reduce((s, i) => s + i.price, 0);

  type G = {
    productId: string;
    name: string;
    price: number;
    qty: number;
    image: string | null;
    slug: string;
    indices: number[];
  };
  const grouped = cart.reduce<Record<string, G>>((acc, item, idx) => {
    if (!acc[item.productId])
      acc[item.productId] = {
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: 0,
        image: item.image,
        slug: item.slug,
        indices: [],
      };
    acc[item.productId].qty++;
    acc[item.productId].indices.push(idx);
    return acc;
  }, {});

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(10,9,8,.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .4s",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 10001,
          width: "min(480px,100vw)",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 60px rgba(0,0,0,.2)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .5s cubic-bezier(.25,.46,.45,.94)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 32px 20px",
            borderBottom: "1px solid #f0ede8",
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              className='rm-display'
              style={{
                fontSize: "1.7rem",
                fontWeight: 500,
                color: "#0a0908",
                lineHeight: 1.1,
                marginBottom: 6,
              }}
            >
              Votre{" "}
              <Gold>
                <em>Panier</em>
              </Gold>
            </h2>
            <p
              style={{
                fontSize: ".75rem",
                color: "#b0a898",
                letterSpacing: ".12em",
                textTransform: "uppercase",
              }}
            >
              {cart.length} article{cart.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid #f0ede8",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b6460",
              cursor: "pointer",
            }}
          >
            <IX />
          </button>
        </div>

        {/* Items */}
        <div
          className='rm-cart-scroll'
          style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "48px 40px",
                textAlign: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#f8f7f5",
                  border: "1px solid #f0ede8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                }}
              >
                🛍️
              </div>
              <p
                className='rm-display'
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 400,
                  color: "#0a0908",
                }}
              >
                Panier vide
              </p>
              <p
                style={{
                  fontSize: ".88rem",
                  color: "#b0a898",
                  lineHeight: 1.7,
                  maxWidth: 260,
                }}
              >
                Explorez notre collection et ajoutez vos articles préférés.
              </p>
              <button
                type='button'
                className='rm-btn-gold'
                style={{ marginTop: 8 }}
                onClick={() => {
                  onClose();
                  document
                    .getElementById("shop")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>Explorer la boutique</span>
                <IArrow />
              </button>
            </div>
          ) : (
            Object.values(grouped).map((g) => (
              <div
                key={g.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 28px",
                  borderBottom: "1px solid #f8f7f5",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1px solid #f0ede8",
                    background: "#f8f7f5",
                  }}
                >
                  <ProdImg src={g.image} alt={g.name} slug={g.slug} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    className='rm-display'
                    style={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: "#0a0908",
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {g.name}
                  </p>
                  <Gold>
                    <span style={{ fontSize: ".88rem", fontWeight: 500 }}>
                      {g.price.toLocaleString("fr-MA", {
                        style: "currency",
                        currency: "MAD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </Gold>
                  {g.qty > 1 && (
                    <span
                      style={{
                        fontSize: ".72rem",
                        color: "#b0a898",
                        marginLeft: 6,
                      }}
                    >
                      × {g.qty} ={" "}
                      {(g.price * g.qty).toLocaleString("fr-MA", {
                        style: "currency",
                        currency: "MAD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #f0ede8",
                    borderRadius: 100,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type='button'
                    onClick={() => onRemoveOne(g.indices[g.indices.length - 1])}
                    style={{
                      width: 30,
                      height: 30,
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#6b6460",
                    }}
                  >
                    {g.qty === 1 ? <ITrash /> : <IMinus />}
                  </button>
                  <span
                    style={{
                      minWidth: 24,
                      textAlign: "center",
                      fontSize: ".82rem",
                      fontWeight: 500,
                      borderLeft: "1px solid #f0ede8",
                      borderRight: "1px solid #f0ede8",
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {g.qty}
                  </span>
                  <button
                    type='button'
                    onClick={() =>
                      onAddOne({
                        productId: g.productId,
                        name: g.name,
                        price: g.price,
                        image: g.image,
                        slug: g.slug,
                      })
                    }
                    style={{
                      width: 30,
                      height: 30,
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#6b6460",
                    }}
                  >
                    <IPlus />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            style={{
              padding: "20px 28px 28px",
              borderTop: "1px solid #f0ede8",
              flexShrink: 0,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: ".82rem", color: "#6b6460" }}>
                  Sous-total
                </span>
                <span style={{ fontSize: ".82rem" }}>
                  {total.toLocaleString("fr-MA", {
                    style: "currency",
                    currency: "MAD",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: ".82rem", color: "#6b6460" }}>
                  Livraison
                </span>
                <span
                  style={{
                    fontSize: ".78rem",
                    color: "#c9a84c",
                    fontWeight: 500,
                  }}
                >
                  Gratuite
                </span>
              </div>
            </div>
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(to right,transparent,#e4e0d8,transparent)",
                marginBottom: 16,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span
                className='rm-display'
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: "#0a0908",
                }}
              >
                Total estimé
              </span>
              <Gold>
                <span
                  className='rm-display'
                  style={{ fontSize: "1.35rem", fontWeight: 600 }}
                >
                  {total.toLocaleString("fr-MA", {
                    style: "currency",
                    currency: "MAD",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </Gold>
            </div>
            <button
              type='button'
              className='rm-btn-gold'
              style={{
                width: "100%",
                justifyContent: "center",
                marginBottom: 10,
              }}
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              <span>Passer la commande</span>
              <IArrow />
            </button>
            <button
              type='button'
              className='rm-btn-ghost'
              style={{
                width: "100%",
                justifyContent: "center",
                border: "1px solid #f0ede8",
              }}
              onClick={onClose}
            >
              Continuer mes achats
            </button>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button
                type='button'
                onClick={onClear}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: ".72rem",
                  color: "#b0a898",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#b0a898")}
              >
                Vider le panier
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function UserHomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProd, setLoadingProd] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [successNum, setSuccessNum] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [testiIdx, setTestiIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ── Product modal state ← NOUVEAU ─────────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSlide = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch categories ───────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: Category[]) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoadingProd(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "8",
        ...(filter !== "all" && { categoryId: filter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts((data.products as Product[]).filter((p) => p.actif));
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProd(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  // ── Search debounce ────────────────────────────────────────────────────────
  function handleSearch(val: string) {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  }

  // ── Scroll ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ── Scroll reveal ──────────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll(".rm-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rm-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });

  // ── Particles ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0,
      H = 0,
      raf: number;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    type P = {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      maxOpacity: number;
      life: number;
      maxLife: number;
      hue: number;
    };
    const mk = (): P => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 2.5 + 0.5,
      speedY: -(Math.random() * 0.5 + 0.2),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0,
      maxOpacity: Math.random() * 0.5 + 0.1,
      life: 0,
      maxLife: Math.random() * 300 + 200,
      hue: Math.random() * 20 + 35,
    });
    const ps: P[] = Array.from({ length: 55 }, mk);
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;
        const pr = p.life / p.maxLife;
        p.opacity =
          pr < 0.2
            ? (pr / 0.2) * p.maxOpacity
            : pr > 0.7
              ? ((1 - pr) / 0.3) * p.maxOpacity
              : p.maxOpacity;
        if (p.life > p.maxLife || p.y < -10)
          Object.assign(p, mk(), { x: Math.random() * W, y: H + 10 });
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue},70%,60%)`;
        ctx.shadowColor = `hsl(${p.hue},80%,65%)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Testimonials ───────────────────────────────────────────────────────────
  const resetAuto = (idx: number) => {
    if (autoSlide.current) clearInterval(autoSlide.current);
    setTestiIdx(((idx % TESTI.length) + TESTI.length) % TESTI.length);
    autoSlide.current = setInterval(
      () => setTestiIdx((i) => (i + 1) % TESTI.length),
      5000,
    );
  };
  useEffect(() => {
    autoSlide.current = setInterval(
      () => setTestiIdx((i) => (i + 1) % TESTI.length),
      5000,
    );
    return () => {
      if (autoSlide.current) clearInterval(autoSlide.current);
    };
  }, []);

  // ── Cart ───────────────────────────────────────────────────────────────────
  const addToCart = (product: Product, qty = 1) => {
    const items: CartItem[] = Array.from({ length: qty }, () => ({
      productId: product.id,
      name: product.nom,
      price: product.prix,
      image: product.image,
      slug: product.category.slug,
    }));
    setCart((c) => [...c, ...items]);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(
      qty > 1
        ? `${qty}× "${product.nom}" ajoutés au panier`
        : `"${product.nom}" ajouté au panier`,
    );
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };
  const addOneByItem = (item: CartItem) => setCart((c) => [...c, item]);
  const removeOne = (idx: number) =>
    setCart((c) => c.filter((_, i) => i !== idx));
  const clearCart = () => setCart([]);

  const handleOrderSuccess = (num: string) => {
    setOrderOpen(false);
    setSuccessNum(num);
    clearCart();
  };
  const handleSuccessClose = () => {
    setSuccessNum(null);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Newsletter ─────────────────────────────────────────────────────────────
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Outfit:wght@200;300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        .rm-root{font-family:'Outfit',system-ui,sans-serif;background:#fff;color:#0a0908;overflow-x:hidden;}
        .rm-root a{text-decoration:none;color:inherit;}
        .rm-display{font-family:'Cormorant Garamond',Georgia,serif!important;}

        .rm-reveal{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1);}
        .rm-visible{opacity:1!important;transform:translateY(0)!important;}
        .rm-up{opacity:0;transform:translateY(40px);animation:rmUp .9s cubic-bezier(.22,1,.36,1) forwards;}
        .rm-d1{animation-delay:.15s}.rm-d2{animation-delay:.3s}.rm-d3{animation-delay:.45s}.rm-d4{animation-delay:.6s}.rm-d5{animation-delay:.8s}
        @keyframes rmUp{to{opacity:1;transform:translateY(0);}}
        @keyframes rmShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes rmMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes rmScroll{0%,100%{transform:scaleY(1);opacity:1}50%{transform:scaleY(.5);opacity:.4}}
        @keyframes rmSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .rm-marquee{display:inline-flex;gap:40px;white-space:nowrap;animation:rmMarquee 30s linear infinite;font-size:.72rem;letter-spacing:.25em;text-transform:uppercase;color:rgba(255,255,255,.55);}
        .rm-scroll-line{width:1px;height:50px;background:linear-gradient(to bottom,#c9a84c,transparent);animation:rmScroll 2s ease-in-out infinite;}

        .rm-prod-card{background:#fff;border:1px solid #f0ede8;border-radius:4px;overflow:hidden;position:relative;transition:transform .4s,box-shadow .4s,border-color .4s;cursor:pointer;}
        .rm-prod-card:hover{transform:translateY(-8px);box-shadow:0 16px 60px rgba(201,168,76,.3);border-color:rgba(201,168,76,.3);}
        .rm-prod-card:hover .rm-prod-img img{transform:scale(1.06);}
        .rm-shine{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent);opacity:0;transform:translateX(-100%);pointer-events:none;}
        .rm-prod-card:hover .rm-shine{opacity:1;transform:translateX(200%);transition:transform .7s ease,opacity .1s;}

        .rm-cat-card{position:relative;overflow:hidden;background:#fff;border:1px solid #f0ede8;border-radius:4px;padding:36px 28px;display:flex;flex-direction:column;gap:14px;min-height:180px;transition:transform .4s,box-shadow .4s,border-color .4s;cursor:pointer;}
        .rm-cat-card:hover{transform:translateY(-6px);box-shadow:0 8px 40px rgba(201,168,76,.2);border-color:rgba(201,168,76,.3);}
        .rm-cat-card:hover .rm-cat-arrow{color:#c9a84c;transform:translate(4px,-4px);}
        .rm-cat-arrow{position:absolute;right:24px;bottom:24px;font-size:1.1rem;color:#e4e0d8;transition:color .4s,transform .4s;}

        .rm-feat-card{padding:36px 28px;border:1px solid #f0ede8;border-radius:4px;text-align:center;transition:transform .4s,box-shadow .4s;position:relative;overflow:hidden;}
        .rm-feat-card::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:${GOLD};transform:scaleX(0);transition:transform .4s;transform-origin:left;}
        .rm-feat-card:hover{transform:translateY(-6px);box-shadow:0 8px 32px rgba(0,0,0,.1);}
        .rm-feat-card:hover::before{transform:scaleX(1);}

        .rm-btn-gold{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:${GOLD};color:#fff;font-size:.8rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;border-radius:2px;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 20px rgba(201,168,76,.3);font-family:'Outfit',sans-serif;}
        .rm-btn-gold:hover{transform:translateY(-2px);box-shadow:0 16px 60px rgba(201,168,76,.35);}
        .rm-btn-ghost{display:inline-flex;align-items:center;padding:13px 32px;border:1px solid rgba(201,168,76,.35);color:#0a0908;font-size:.8rem;font-weight:400;letter-spacing:.12em;text-transform:uppercase;border-radius:2px;transition:background .2s,border-color .2s,color .2s;font-family:'Outfit',sans-serif;background:transparent;cursor:pointer;}
        .rm-btn-ghost:hover{background:rgba(201,168,76,.06);border-color:#c9a84c;color:#c9a84c;}
        .rm-btn-add{width:42px;height:42px;background:${GOLD};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 4px 16px rgba(201,168,76,.3);flex-shrink:0;}
        .rm-btn-add:hover{transform:scale(1.12);box-shadow:0 6px 24px rgba(201,168,76,.5);}
        .rm-btn-page{padding:8px 16px;border:1px solid #e4e0d8;border-radius:2px;font-size:.78rem;background:transparent;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif;color:#6b6460;}
        .rm-btn-page:hover,.rm-btn-page.active{background:${GOLD};color:#fff;border-color:transparent;}
        .rm-btn-page:disabled{opacity:.4;cursor:not-allowed;}

        .rm-filter{padding:8px 22px;font-size:.75rem;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#6b6460;border:1px solid #e4e0d8;border-radius:100px;transition:all .2s;font-family:'Outfit',sans-serif;cursor:pointer;background:transparent;}
        .rm-filter:hover,.rm-filter.active{background:${GOLD};color:#fff;border-color:transparent;box-shadow:0 4px 16px rgba(201,168,76,.25);}

        .rm-nav-link{font-size:.82rem;font-weight:400;color:#6b6460;letter-spacing:.1em;text-transform:uppercase;position:relative;padding-bottom:2px;transition:color .2s;}
        .rm-nav-link::after{content:"";position:absolute;bottom:-2px;left:0;right:100%;height:1px;background:${GOLD};transition:right .2s;}
        .rm-nav-link:hover,.rm-nav-link.active{color:#0a0908;}
        .rm-nav-link:hover::after,.rm-nav-link.active::after{right:0;}

        .rm-testi-btn{width:44px;height:44px;border-radius:50%;border:1px solid #e4e0d8;display:flex;align-items:center;justify-content:center;color:#6b6460;transition:all .2s;background:transparent;cursor:pointer;}
        .rm-testi-btn:hover{border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,.06);}
        .rm-testi-dot{width:6px;height:6px;border-radius:50%;background:#e4e0d8;transition:background .2s,width .2s;border:none;cursor:pointer;padding:0;}
        .rm-testi-dot.active{background:#c9a84c;width:24px;border-radius:3px;}

        .rm-social{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.4);transition:all .2s;cursor:pointer;}
        .rm-social:hover{border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,.08);}

        .rm-search{width:100%;max-width:400px;padding:11px 20px 11px 44px;background:rgba(0,0,0,.04);border:1px solid rgba(201,168,76,.2);border-radius:2px;color:#0a0908;font-size:.85rem;outline:none;font-family:'Outfit',sans-serif;transition:border-color .2s;}
        .rm-search:focus{border-color:#c9a84c;}
        .rm-search::placeholder{color:#b0a898;}

        .rm-cart-scroll::-webkit-scrollbar{width:4px;}
        .rm-cart-scroll::-webkit-scrollbar-track{background:transparent;}
        .rm-cart-scroll::-webkit-scrollbar-thumb{background:#e4e0d8;border-radius:2px;}

        @media(max-width:768px){
          .rm-hide-mobile{display:none!important;}
          .rm-grid-mobile{grid-template-columns:1fr!important;}
          .rm-order-grid{grid-template-columns:1fr!important;}
          .rm-modal-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div className='rm-root'>
        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: scrolled ? "rgba(255,255,255,.92)" : "transparent",
            backdropFilter: scrolled ? "blur(24px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
            boxShadow: scrolled
              ? "0 1px 0 rgba(201,168,76,.2),0 2px 12px rgba(0,0,0,.06)"
              : "none",
            transition: "background .4s,box-shadow .4s",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 40px",
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <a
              href='#home'
              style={{
                display: "flex",
                alignItems: "center",
                letterSpacing: ".06em",
              }}
            >
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  background: GOLD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                RM
              </span>
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 300,
                  color: "#0a0908",
                  letterSpacing: ".12em",
                }}
              >
                MARKET
              </span>
            </a>
            <ul
              className='rm-hide-mobile'
              style={{ display: "flex", gap: 44, listStyle: "none" }}
            >
              {[
                ["home", "Home"],
                ["shop", "Shop"],
                ["categories", "Catégories"],
                ["about", "À propos"],
                ["contact", "Contact"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className='rm-nav-link'>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className='rm-hide-mobile' style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#b0a898",
                    pointerEvents: "none",
                  }}
                >
                  <ISearch />
                </div>
                <input
                  type='search'
                  value={searchInput}
                  placeholder='Rechercher...'
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label='Rechercher un produit'
                  className='rm-search'
                />
              </div>
              <button
                type='button'
                aria-label='Panier'
                onClick={() => setCartOpen(true)}
                style={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  color: "#6b6460",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <ICart />
                {cart.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 16,
                      height: 16,
                      background: GOLD,
                      color: "#fff",
                      fontSize: ".6rem",
                      fontWeight: 700,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section
          id='home'
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              background:
                "radial-gradient(circle,rgba(201,168,76,.1) 0%,transparent 70%)",
              top: -100,
              right: -100,
              borderRadius: "50%",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle,rgba(201,168,76,.08) 0%,transparent 70%)",
              bottom: 0,
              left: -50,
              borderRadius: "50%",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              maxWidth: 900,
              padding: "76px 40px 0",
            }}
          >
            <p
              className='rm-up'
              style={{
                fontSize: ".75rem",
                letterSpacing: ".3em",
                textTransform: "uppercase",
                color: "#c9a84c",
                marginBottom: 28,
              }}
            >
              Est. 2025 · Premium Collection
            </p>
            <h1
              className='rm-up rm-d1 rm-display'
              style={{
                fontSize: "clamp(5rem,14vw,11rem)",
                fontWeight: 300,
                lineHeight: 0.92,
                letterSpacing: "-.02em",
                marginBottom: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span>RM</span>
              <Gold
                style={{
                  fontWeight: 600,
                  fontStyle: "italic",
                  fontSize: "clamp(5.5rem,15vw,12.5rem)",
                  display: "block",
                }}
              >
                Market
              </Gold>
            </h1>
            <p
              className='rm-up rm-d2'
              style={{
                fontSize: "clamp(.85rem,2vw,1.1rem)",
                fontWeight: 300,
                letterSpacing: ".3em",
                textTransform: "uppercase",
                color: "#6b6460",
                marginBottom: 16,
              }}
            >
              Luxury Shopping Experience
            </p>
            <p
              className='rm-up rm-d3'
              style={{
                fontSize: "1rem",
                color: "#6b6460",
                maxWidth: 480,
                margin: "0 auto 44px",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Curated excellence. Crafted for those who demand nothing less than
              perfection.
            </p>
            <div
              className='rm-up rm-d4'
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                marginBottom: 64,
                flexWrap: "wrap",
              }}
            >
              <a href='#shop' className='rm-btn-gold'>
                <span>Explorer la collection</span>
                <IArrow />
              </a>
              <a href='#categories' className='rm-btn-ghost'>
                Voir les catégories
              </a>
            </div>
            <div
              className='rm-up rm-d5'
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 40,
              }}
            >
              {[
                [`${total > 0 ? total + "+" : "..."}`, "Produits"],
                ["98%", "Satisfaction"],
                ["150+", "Marques"],
              ].map(([num, label], i) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 40 }}
                >
                  {i > 0 && (
                    <div
                      style={{
                        width: 1,
                        height: 40,
                        background:
                          "linear-gradient(to bottom,transparent,#f5e6c0,transparent)",
                      }}
                    />
                  )}
                  <div style={{ textAlign: "center" }}>
                    <Gold>
                      <span
                        className='rm-display'
                        style={{
                          display: "block",
                          fontSize: "1.8rem",
                          fontWeight: 500,
                        }}
                      >
                        {num}
                      </span>
                    </Gold>
                    <span
                      style={{
                        fontSize: ".72rem",
                        letterSpacing: ".2em",
                        textTransform: "uppercase",
                        color: "#6b6460",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: "#b0a898",
              fontSize: ".68rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            <div className='rm-scroll-line' />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── Marquee ────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#1a1815",
            overflow: "hidden",
            padding: "18px 0",
            borderTop: "1px solid rgba(201,168,76,.15)",
            borderBottom: "1px solid rgba(201,168,76,.15)",
          }}
        >
          <div className='rm-marquee'>
            {Array.from({ length: 2 }, (_, k) =>
              [
                "Luxury Watches",
                "Premium Fashion",
                "Smart Devices",
                "Exclusive Sneakers",
                "Gaming Elite",
              ].flatMap((s, i) => [
                <span key={`${k}-s${i}`}>{s}</span>,
                <span
                  key={`${k}-d${i}`}
                  style={{ color: "#c9a84c", opacity: 0.7 }}
                >
                  ◆
                </span>,
              ]),
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SHOP
        ══════════════════════════════════════════════════════════════════ */}
        <section id='shop' style={{ padding: "120px 0", background: "#fff" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <p
                className='rm-reveal'
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  letterSpacing: ".3em",
                  textTransform: "uppercase",
                  color: "#c9a84c",
                  marginBottom: 16,
                }}
              >
                Collection en vedette
              </p>
              <h2
                className='rm-reveal rm-display'
                style={{
                  fontSize: "clamp(2.6rem,5vw,4rem)",
                  fontWeight: 300,
                  lineHeight: 1.1,
                  marginBottom: 20,
                }}
              >
                Excellence{" "}
                <Gold>
                  <em>Curatée</em>
                </Gold>
              </h2>
              <p
                className='rm-reveal'
                style={{
                  fontSize: "1rem",
                  color: "#6b6460",
                  maxWidth: 520,
                  margin: "0 auto",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                Chaque produit sélectionné selon des standards rigoureux pour
                ceux qui vivent au sommet.
              </p>
            </div>

            {/* Search */}
            <div
              className='rm-reveal'
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <div
                style={{ position: "relative", width: "100%", maxWidth: 400 }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#b0a898",
                    pointerEvents: "none",
                  }}
                >
                  <ISearch />
                </div>
                <input
                  type='search'
                  value={searchInput}
                  placeholder='Rechercher un produit...'
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label='Rechercher'
                  className='rm-search'
                />
              </div>
            </div>

            {/* Filters */}
            <div
              className='rm-reveal'
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 56,
                flexWrap: "wrap",
              }}
            >
              <button
                type='button'
                className={`rm-filter${filter === "all" ? " active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type='button'
                  className={`rm-filter${filter === cat.id ? " active" : ""}`}
                  onClick={() => setFilter(cat.id)}
                >
                  {cat.nom}
                  <span
                    style={{ marginLeft: 6, fontSize: ".65rem", opacity: 0.7 }}
                  >
                    ({cat._count.products})
                  </span>
                </button>
              ))}
            </div>

            {/* Grid */}
            {loadingProd ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                  gap: 28,
                }}
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>🔍</div>
                <p
                  className='rm-display'
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 400,
                    marginBottom: 8,
                  }}
                >
                  Aucun produit trouvé
                </p>
                <p style={{ color: "#6b6460" }}>
                  {search
                    ? `Aucun résultat pour "${search}"`
                    : "Cette catégorie est vide."}
                </p>
                {(search || filter !== "all") && (
                  <button
                    type='button'
                    className='rm-btn-gold'
                    style={{ marginTop: 24 }}
                    onClick={() => {
                      setFilter("all");
                      setSearch("");
                      setSearchInput("");
                    }}
                  >
                    Voir tous les produits
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                  gap: 28,
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className='rm-prod-card rm-reveal'
                    onClick={() => setSelectedProduct(product)} // ← Ouvre la modal
                  >
                    {product.stock === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          zIndex: 2,
                          fontSize: ".62rem",
                          fontWeight: 600,
                          letterSpacing: ".15em",
                          textTransform: "uppercase",
                          padding: "5px 12px",
                          borderRadius: 100,
                          background: "linear-gradient(135deg,#1a1a1a,#333)",
                          color: "#fff",
                        }}
                      >
                        Rupture
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          zIndex: 2,
                          fontSize: ".62rem",
                          fontWeight: 600,
                          letterSpacing: ".15em",
                          textTransform: "uppercase",
                          padding: "5px 12px",
                          borderRadius: 100,
                          background: GOLD,
                          color: "#fff",
                        }}
                      >
                        Plus que {product.stock} !
                      </div>
                    )}
                    <div
                      className='rm-prod-img'
                      style={{
                        height: 260,
                        background: "#f8f7f5",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <ProdImg
                        src={product.image}
                        alt={product.nom}
                        slug={product.category.slug}
                      />
                      <div className='rm-shine' />
                    </div>
                    <div style={{ padding: 24 }}>
                      <div
                        style={{
                          fontSize: ".62rem",
                          fontWeight: 600,
                          letterSpacing: ".25em",
                          textTransform: "uppercase",
                          color: "#c9a84c",
                          marginBottom: 6,
                        }}
                      >
                        {product.category.nom}
                      </div>
                      <h3
                        className='rm-display'
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 500,
                          color: "#0a0908",
                          marginBottom: 8,
                          lineHeight: 1.3,
                        }}
                      >
                        {product.nom}
                      </h3>
                      {product.description && (
                        <p
                          style={
                            {
                              fontSize: ".82rem",
                              color: "#6b6460",
                              lineHeight: 1.6,
                              marginBottom: 12,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            } as React.CSSProperties
                          }
                        >
                          {product.description}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginBottom: 16,
                        }}
                      >
                        {Array.from({ length: 5 }, (_, i) => (
                          <IStar key={i} f={i < 4} />
                        ))}
                        <span
                          style={{
                            fontSize: ".72rem",
                            color: "#b0a898",
                            marginLeft: 4,
                          }}
                        >
                          (4.5)
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Gold>
                            <span
                              className='rm-display'
                              style={{ fontSize: "1.35rem", fontWeight: 500 }}
                            >
                              {product.prix.toLocaleString("fr-MA", {
                                style: "currency",
                                currency: "MAD",
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </Gold>
                          <span
                            style={{
                              display: "block",
                              fontSize: ".75rem",
                              color: "#b0a898",
                              marginTop: 2,
                            }}
                          >
                            Stock :{" "}
                            {product.stock > 0
                              ? `${product.stock} unité${product.stock > 1 ? "s" : ""}`
                              : "Épuisé"}
                          </span>
                        </div>
                        {/* ← stopPropagation pour ne pas ouvrir la modal */}
                        <button
                          type='button'
                          className='rm-btn-add'
                          aria-label={`Ajouter ${product.nom} au panier`}
                          disabled={product.stock === 0}
                          style={{ opacity: product.stock === 0 ? 0.4 : 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            product.stock > 0 && addToCart(product);
                          }}
                        >
                          <IPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loadingProd && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 56,
                }}
              >
                <button
                  type='button'
                  className='rm-btn-page'
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label='Page précédente'
                >
                  <IChevL />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type='button'
                    className={`rm-btn-page${page === i + 1 ? " active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type='button'
                  className='rm-btn-page'
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label='Page suivante'
                >
                  <IChevR />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Categories ─────────────────────────────────────────────────── */}
        <section
          id='categories'
          style={{ padding: "120px 0", background: "#f8f7f5" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <p
                className='rm-reveal'
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  letterSpacing: ".3em",
                  textTransform: "uppercase",
                  color: "#c9a84c",
                  marginBottom: 16,
                }}
              >
                Parcourir
              </p>
              <h2
                className='rm-reveal rm-display'
                style={{ fontSize: "clamp(2.6rem,5vw,4rem)", fontWeight: 300 }}
              >
                Nos{" "}
                <Gold>
                  <em>Catégories</em>
                </Gold>
              </h2>
            </div>
            {categories.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#b0a898",
                  padding: "40px 0",
                }}
              >
                Chargement...
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 20,
                }}
                className='rm-grid-mobile'
              >
                {categories.map((cat, idx) => {
                  const emoji = EMOJI[cat.slug] ?? "🛍️";
                  const isWide = idx === 0 || idx === categories.length - 1;
                  return (
                    <div
                      key={cat.id}
                      className='rm-cat-card rm-reveal'
                      style={{
                        gridColumn:
                          isWide && categories.length >= 4
                            ? "span 2"
                            : "span 1",
                      }}
                      onClick={() => {
                        setFilter(cat.id);
                        document
                          .getElementById("shop")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          background: "#f8f7f5",
                          border: "1px solid #e4e0d8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.4rem",
                        }}
                      >
                        {emoji}
                      </div>
                      <div>
                        <h3
                          className='rm-display'
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: 500,
                            color: "#0a0908",
                            marginBottom: 4,
                          }}
                        >
                          {cat.nom}
                        </h3>
                        <p
                          style={{
                            fontSize: ".78rem",
                            color: "#b0a898",
                            letterSpacing: ".1em",
                            textTransform: "uppercase",
                          }}
                        >
                          {cat._count.products} produit
                          {cat._count.products > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className='rm-cat-arrow'>→</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────── */}
        <section id='about' style={{ padding: "120px 0", background: "#fff" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <p
                className='rm-reveal'
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  letterSpacing: ".3em",
                  textTransform: "uppercase",
                  color: "#c9a84c",
                  marginBottom: 16,
                }}
              >
                Pourquoi nous choisir
              </p>
              <h2
                className='rm-reveal rm-display'
                style={{ fontSize: "clamp(2.6rem,5vw,4rem)", fontWeight: 300 }}
              >
                Service{" "}
                <Gold>
                  <em>Premium</em>
                </Gold>
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                gap: 24,
              }}
            >
              {[
                {
                  e: "🛡️",
                  t: "Paiement Sécurisé",
                  d: "Chiffrement militaire protégeant chaque transaction. Achetez en toute confiance absolue.",
                },
                {
                  e: "🚀",
                  t: "Livraison Express",
                  d: "Expédition mondiale avec manipulation gants blancs. Vos articles arrivent parfaitement préservés.",
                },
                {
                  e: "⭐",
                  t: "Qualité Premium",
                  d: "Chaque produit rigoureusement vérifié. Uniquement des produits authentiques de marques mondiales.",
                },
                {
                  e: "💬",
                  t: "Support 24/7",
                  d: "Service conciergerie disponible à toute heure. Les membres premium reçoivent une assistance directe.",
                },
              ].map((f) => (
                <div key={f.t} className='rm-feat-card rm-reveal'>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: "50%",
                        background: "#f8f7f5",
                        border: "1px solid #e4e0d8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.7rem",
                      }}
                    >
                      {f.e}
                    </div>
                  </div>
                  <h3
                    className='rm-display'
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 500,
                      color: "#0a0908",
                      marginBottom: 12,
                    }}
                  >
                    {f.t}
                  </h3>
                  <p
                    style={{
                      fontSize: ".88rem",
                      color: "#6b6460",
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {f.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────────────────── */}
        <section style={{ padding: "120px 0", background: "#f8f7f5" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <p
                className='rm-reveal'
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  letterSpacing: ".3em",
                  textTransform: "uppercase",
                  color: "#c9a84c",
                  marginBottom: 16,
                }}
              >
                Témoignages
              </p>
              <h2
                className='rm-reveal rm-display'
                style={{ fontSize: "clamp(2.6rem,5vw,4rem)", fontWeight: 300 }}
              >
                Ce qu&apos;ils{" "}
                <Gold>
                  <em>disent</em>
                </Gold>
              </h2>
            </div>
            <div className='rm-reveal' style={{ overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  transition: "transform .7s cubic-bezier(.25,.46,.45,.94)",
                  transform: `translateX(-${testiIdx * 100}%)`,
                }}
              >
                {TESTI.map((t) => (
                  <div
                    key={t.n}
                    style={{
                      minWidth: "100%",
                      padding: "48px 60px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className='rm-display'
                      style={{
                        fontSize: "4rem",
                        lineHeight: 1,
                        marginBottom: 28,
                        background: GOLD,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ❝
                    </div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond',Georgia,serif",
                        fontSize: "1.15rem",
                        fontStyle: "italic",
                        color: "#0a0908",
                        lineHeight: 1.8,
                        maxWidth: 680,
                        margin: "0 auto 40px",
                      }}
                    >
                      {t.t}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          border: "2px solid #c9a84c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: GOLD,
                          boxShadow: "0 4px 16px rgba(201,168,76,.3)",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: ".9rem",
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          {t.i}
                        </span>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <strong
                          style={{
                            display: "block",
                            fontSize: ".95rem",
                            fontWeight: 500,
                            color: "#0a0908",
                            marginBottom: 2,
                          }}
                        >
                          {t.n}
                        </strong>
                        <span style={{ fontSize: ".78rem", color: "#b0a898" }}>
                          {t.r}
                        </span>
                        <div style={{ marginTop: 4 }}>
                          {Array.from({ length: t.s }, (_, i) => (
                            <span
                              key={i}
                              style={{ color: "#c9a84c", fontSize: ".85rem" }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 40,
                }}
              >
                <button
                  type='button'
                  className='rm-testi-btn'
                  onClick={() => resetAuto(testiIdx - 1)}
                >
                  <IChevL />
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  {TESTI.map((_, i) => (
                    <button
                      key={i}
                      type='button'
                      className={`rm-testi-dot${testiIdx === i ? " active" : ""}`}
                      onClick={() => resetAuto(i)}
                    />
                  ))}
                </div>
                <button
                  type='button'
                  className='rm-testi-btn'
                  onClick={() => resetAuto(testiIdx + 1)}
                >
                  <IChevR />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Newsletter ─────────────────────────────────────────────────── */}
        <section
          style={{
            background: "#1a1815",
            padding: "100px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -100,
              left: "50%",
              transform: "translateX(-50%)",
              width: 600,
              height: 400,
              background:
                "radial-gradient(ellipse,rgba(201,168,76,.12) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              textAlign: "center",
              padding: "0 40px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <p
              className='rm-reveal'
              style={{
                display: "block",
                fontSize: ".72rem",
                letterSpacing: ".3em",
                textTransform: "uppercase",
                color: "#c9a84c",
                marginBottom: 16,
              }}
            >
              Accès exclusif
            </p>
            <h2
              className='rm-reveal rm-display'
              style={{
                fontSize: "clamp(2.2rem,5vw,3.5rem)",
                fontWeight: 300,
                color: "#fff",
                marginBottom: 16,
                lineHeight: 1.1,
              }}
            >
              Rejoignez le Cercle{" "}
              <Gold>
                <em>Privé</em>
              </Gold>
            </h2>
            <p
              className='rm-reveal'
              style={{
                fontSize: ".95rem",
                color: "rgba(255,255,255,.45)",
                lineHeight: 1.7,
                fontWeight: 300,
                marginBottom: 36,
              }}
            >
              Soyez le premier à découvrir les nouvelles arrivées, les drops
              exclusifs et les privilèges membres.
            </p>
            <form
              className='rm-reveal'
              onSubmit={handleSubscribe}
              style={{
                display: "flex",
                gap: 12,
                maxWidth: 480,
                margin: "0 auto 16px",
              }}
            >
              <input
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Votre adresse email'
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(201,168,76,.2)",
                  borderRadius: 2,
                  color: "#fff",
                  fontSize: ".85rem",
                  outline: "none",
                  fontFamily: "'Outfit',sans-serif",
                }}
              />
              <button
                type='submit'
                className='rm-btn-gold'
                style={{
                  background: subscribed
                    ? "linear-gradient(135deg,#2d9a4a,#1e6b34)"
                    : undefined,
                }}
              >
                {subscribed ? "Inscrit ✓" : "S'inscrire"}
              </button>
            </form>
            <p
              className='rm-reveal'
              style={{ fontSize: ".72rem", color: "rgba(255,255,255,.25)" }}
            >
              Aucun spam. Désinscription à tout moment.
            </p>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer id='contact' style={{ background: "#0a0908" }}>
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "80px 40px 60px",
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 60,
            }}
            className='rm-grid-mobile'
          >
            <div>
              <a
                href='#home'
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    background: GOLD,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  RM
                </span>
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 300,
                    color: "#fff",
                    letterSpacing: ".12em",
                  }}
                >
                  MARKET
                </span>
              </a>
              <p
                style={{
                  fontSize: ".85rem",
                  color: "rgba(255,255,255,.35)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                  maxWidth: 280,
                  marginBottom: 28,
                }}
              >
                Le luxe redéfini. L&apos;excellence livrée. Le sommet de
                l&apos;expérience shopping en ligne.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                {["In", "Tw", "Yt", "Li"].map((s) => (
                  <a key={s} href='#' className='rm-social' aria-label={s}>
                    <span style={{ fontSize: ".75rem", fontWeight: 600 }}>
                      {s}
                    </span>
                  </a>
                ))}
              </div>
            </div>
            {[
              {
                title: "Boutique",
                links: [
                  "Nouvelles arrivées",
                  "Meilleures ventes",
                  "Montres de luxe",
                  "Sneakers premium",
                  "Tech & Gadgets",
                ],
              },
              {
                title: "Société",
                links: [
                  "À propos",
                  "Carrières",
                  "Presse",
                  "Durabilité",
                  "Partenaires",
                ],
              },
              {
                title: "Support",
                links: [
                  "Centre d'aide",
                  "Suivi commande",
                  "Retours & Échanges",
                  "Authenticité",
                  "Nous contacter",
                ],
              },
            ].map((g) => (
              <div key={g.title}>
                <h4
                  style={{
                    fontSize: ".72rem",
                    fontWeight: 600,
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.5)",
                    marginBottom: 20,
                  }}
                >
                  {g.title}
                </h4>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {g.links.map((l) => (
                    <li key={l}>
                      <a
                        href='#'
                        style={{
                          fontSize: ".85rem",
                          color: "rgba(255,255,255,.3)",
                          fontWeight: 300,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#c9a84c")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "rgba(255,255,255,.3)")
                        }
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,.06)",
              maxWidth: 1280,
              margin: "0 auto",
              padding: "24px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ fontSize: ".75rem", color: "rgba(255,255,255,.2)" }}>
              © 2025 RM Market. Tous droits réservés.
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              {["Confidentialité", "Conditions", "Cookies"].map((l) => (
                <a
                  key={l}
                  href='#'
                  style={{ fontSize: ".72rem", color: "rgba(255,255,255,.2)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#c9a84c")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,.2)")
                  }
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>

        {/* ── Cart Drawer ─────────────────────────────────────────────────── */}
        <CartDrawer
          open={cartOpen}
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemoveOne={removeOne}
          onAddOne={addOneByItem}
          onClear={clearCart}
          onCheckout={() => setOrderOpen(true)}
        />

        {/* ── Order Form Modal ─────────────────────────────────────────────── */}
        <OrderFormModal
          open={orderOpen && cart.length > 0}
          cart={cart}
          onClose={() => setOrderOpen(false)}
          onSuccess={handleOrderSuccess}
        />

        {/* ── Success Modal ────────────────────────────────────────────────── */}
        {successNum && (
          <SuccessModal orderNum={successNum} onClose={handleSuccessClose} />
        )}

        {/* ── Product Detail Modal ← NOUVEAU ──────────────────────────────── */}
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => {
            addToCart(product, qty);
            // Optionnel : ouvrir le panier après ajout
            // setCartOpen(true);
          }}
        />

        {/* ── Toast ────────────────────────────────────────────────────────── */}
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#1a1815",
            border: "1px solid rgba(201,168,76,.25)",
            padding: "16px 24px",
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,.3)",
            transform: toast ? "translateY(0)" : "translateY(100px)",
            opacity: toast ? 1 : 0,
            transition:
              "transform .4s cubic-bezier(.25,.46,.45,.94),opacity .4s",
            pointerEvents: toast ? "auto" : "none",
          }}
        >
          <span style={{ color: "#c9a84c", flexShrink: 0 }}>
            <ICheck />
          </span>
          <span style={{ fontSize: ".85rem", color: "rgba(255,255,255,.85)" }}>
            {toast}
          </span>
        </div>
      </div>
    </>
  );
}
