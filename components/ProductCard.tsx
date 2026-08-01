"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowUpRight, Heart, Plus, Star } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { getReviews, getWishlist, toggleWishlist } from "@/lib/data";
import { Product } from "@/lib/types";

const IMAGE_PLACEHOLDER = "/lookbook/02-product-oversized-tee-hq.png";

export default function ProductCard({ product, disabled }: { product: Product; disabled?: boolean }) {
  const router = useRouter();
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlist());
  const [imageSrc, setImageSrc] = useState(product.image || IMAGE_PLACEHOLDER);
  const available = product.inStock && !disabled;
  const imageUrl = imageSrc || IMAGE_PLACEHOLDER;
  const defaultSize = product.sizes?.[0] || "One Size";
  const defaultVariants = product.variants?.reduce((acc, variant) => {
    acc[variant.name] = variant.values?.[0] ?? "";
    return acc;
  }, {} as Record<string, string>);

  const reviews = useMemo(() => {
    const approved = getReviews().filter((review) => review.productId === product.id && review.status === "approved");
    return { count: approved.length, average: approved.length ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length : 0 };
  }, [product.id]);

  const addToCart = () => {
    if (!available) return;
    dispatch({ type: "ADD", item: { id: product.id, name: product.name, price: product.price, image: product.image, size: defaultSize, quantity: 1, variantSelections: defaultVariants } });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-black/[0.07] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-25px_rgba(0,0,0,0.45)] animate-fade-up">
      <div className="relative overflow-hidden bg-[#f1f1ed]">
        <Link href={`/product/${product.id}`} className="relative block aspect-[4/5] w-full">
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" onError={() => setImageSrc(IMAGE_PLACEHOLDER)} />
        </Link>
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">{product.badge}</span>}
        <button type="button" aria-label="Toggle wishlist" onClick={() => setWishlistIds(toggleWishlist(product.id))} className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 shadow-sm backdrop-blur transition hover:bg-white">
          <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? "fill-[#9bb42e] text-[#9bb42e]" : "text-gray-600"}`} />
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/product/${product.id}`} className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#888782]">{product.category}</p>
            <h3 className="mt-1 truncate text-base font-bold tracking-[-0.025em] text-[#171717]">{product.name}</h3>
          </Link>
          <p className="shrink-0 text-sm font-bold text-[#171717]">NPR {product.price.toLocaleString()}</p>
        </div>
        {product.originalPrice && product.originalPrice > product.price && <p className="mt-1 text-xs text-[#999] line-through">NPR {product.originalPrice.toLocaleString()}</p>}
        <div className="mt-3 flex items-center gap-2 text-xs text-[#777]">
          <div className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#9bb42e] text-[#9bb42e]" /><span>{reviews.average ? reviews.average.toFixed(1) : "New"}</span></div>
          <span className="h-1 w-1 rounded-full bg-[#bbb]" />
          <span>{reviews.count ? `${reviews.count} review${reviews.count === 1 ? "" : "s"}` : "Just dropped"}</span>
        </div>
        {disabled ? <p className="mt-4 text-xs font-semibold text-[#c26527]">Collection coming soon</p> : !product.inStock ? <p className="mt-4 text-xs font-semibold text-red-600">Currently out of stock</p> : (
          <div className="mt-5 flex items-center gap-2">
            <button type="button" onClick={addToCart} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#9bb42e] hover:text-black"><Plus className="h-3.5 w-3.5" />{added ? "Added" : "Add to bag"}</button>
            <button type="button" onClick={() => { addToCart(); router.push("/checkout"); }} aria-label="Buy now" className="inline-flex rounded-full border border-black/[0.12] p-2.5 text-[#171717] transition hover:border-[#171717] hover:bg-[#f4f4f1]"><ArrowUpRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </article>
  );
}
