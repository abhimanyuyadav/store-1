"use client";
import { useEffect, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartContext";
import { DATA_CHANGED_EVENT, getProducts, getCategories, getReviews, addReview, getSiteSettings, buildWhatsappLink } from "@/lib/data";
import type { Category, Product, Review } from "@/lib/types";
import { ShoppingCart, ArrowLeft, Check, Star, Heart, Truck, RotateCcw } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = routeId ?? "";
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const loadData = () => {
      setProducts(getProducts());
      setCategories(getCategories());
      setHydrated(true);
    };
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
  }, []);
  const product = products.find(p => p.id === productId);
  const { dispatch } = useCart();
  const router = useRouter();
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState(product?.image || "/lookbook/08-product-detail-oversized-tee.png");
  const [quantity, setQuantity] = useState(1);
  const settings = getSiteSettings();

  useEffect(() => {
    const loadReviews = () => setReviews(getReviews().filter(review => review.productId === productId && review.status === "approved"));
    loadReviews();
    window.addEventListener(DATA_CHANGED_EVENT, loadReviews);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, loadReviews);
  }, [productId]);

  if (!hydrated) {
    return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center"><div className="text-sm text-gray-500">Loading product…</div></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-gray-500 mb-6">The item you are looking for is unavailable or has been removed.</p>
          <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">Browse products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category);
  const categoryDisabled = category ? !category.enabled : false;
  const { id, name, price, image, variants } = product;

  function addToCart() {
    if (!size) { alert("Please select a size"); return; }
    if (variants) {
      for (const variant of variants) {
        if (!variantSelections[variant.name]) { alert(`Please select ${variant.name}`); return; }
      }
    }
    dispatch({ type: "ADD", item: { id, name, price, image, size, quantity, variantSelections } });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function buyNow() {
    if (!size) { alert("Please select a size"); return; }
    if (variants) {
      for (const variant of variants) {
        if (!variantSelections[variant.name]) { alert(`Please select ${variant.name}`); return; }
      }
    }
    dispatch({ type: "ADD", item: { id, name, price, image, size, quantity, variantSelections } });
    router.push("/checkout");
  }
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      alert("Please enter your name and a review message.");
      return;
    }
    addReview({
      id: `r${Date.now()}${Math.floor(Math.random() * 1000)}`,
      productId: productId,
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
    });
    setReviewSubmitted(true);
    setReviewForm({ name: "", rating: 5, comment: "" });
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/products" className="mb-7 inline-flex items-center gap-2 text-sm text-[#777870] hover:text-[#171717]"><ArrowLeft className="h-4 w-4" />Back to shop</Link>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="flex gap-3 lg:flex-row-reverse">
            <div className="relative min-h-[480px] flex-1 overflow-hidden rounded-2xl bg-[#e9e9e3] sm:min-h-[620px]"><img src={selectedImage} alt={product.name} className="h-full w-full object-cover" />{product.badge && <span className="absolute left-4 top-4 rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-white">{product.badge}</span>}</div>
            <div className="flex w-16 flex-col gap-3 sm:w-20">{[product.image, "/lookbook/15-detail-thumbnail-front.png", "/lookbook/16-detail-thumbnail-back.png", "/lookbook/17-detail-thumbnail-full.png"].map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => setSelectedImage(index === 0 ? product.image : "/lookbook/08-product-detail-oversized-tee.png")} className={`aspect-square overflow-hidden rounded-xl border-2 ${selectedImage === src ? "border-[#9bb42e]" : "border-transparent"}`}><img src={src} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>
          </div>
          <div className="flex flex-col"><p className="eyebrow">{product.category}</p><div className="mt-3 flex items-start justify-between gap-5"><h1 className="text-4xl font-bold leading-tight tracking-[-.06em]">{product.name}</h1><button aria-label="Add to wishlist" className="rounded-full border border-black/10 p-3"><Heart className="h-5 w-5" /></button></div><div className="mb-5 mt-4 flex items-baseline gap-3">
              {categoryDisabled ? (
                <span className="text-2xl font-bold text-orange-700">Price coming soon</span>
              ) : (
                <>
                  <span className="text-2xl font-bold">NPR {product.price.toLocaleString()}</span>
                  {product.originalPrice && <><span className="text-gray-400 line-through text-base">NPR {product.originalPrice.toLocaleString()}</span><span className="text-[#718b1b] text-sm font-semibold">Save NPR {(product.originalPrice - product.price).toLocaleString()}</span></>}
                </>
              )}
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[#777870]">{product.description}</p>
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#777870]">Select size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`min-w-[48px] rounded-lg border px-3 py-3 text-sm font-semibold transition-all ${size === s ? "border-[#171717] bg-[#171717] text-white" : "border-black/10 text-gray-700 hover:border-black"}`}>{s}</button>
                ))}
              </div>
            </div>
            {product.variants?.map(variant => (
              <div key={variant.name} className="mb-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#777870]">{variant.name}</p>
                <div className="flex flex-wrap gap-2">
                  {variant.values.map(value => (
                    <button key={value} onClick={() => setVariantSelections(prev => ({ ...prev, [variant.name]: value }))}
                      className={`min-w-[48px] rounded-lg border px-3 py-3 text-sm font-semibold transition-all ${variantSelections[variant.name] === value ? "border-[#171717] bg-[#171717] text-white" : "border-black/10 text-gray-700 hover:border-black"}`}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {categoryDisabled && (
              <div className="rounded-3xl border border-orange-300 bg-orange-50 text-orange-900 p-4 mb-5">
                <p className="font-semibold">Coming Soon</p>
                <p className="text-sm">This category is currently disabled. Pricing and checkout are not available for this collection yet.</p>
              </div>
            )}
            <div className="mt-auto flex flex-col gap-3"><div className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-2"><span className="px-2 text-xs font-bold uppercase tracking-[.14em]">Quantity</span><div className="flex items-center gap-3"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8 rounded-full bg-[#f1f1ec]">−</button><span className="w-5 text-center text-sm font-bold">{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 rounded-full bg-[#f1f1ec]">+</button></div></div><button onClick={addToCart} disabled={!product.inStock || categoryDisabled} className={`w-full rounded-full py-4 text-sm font-bold transition-all ${added ? "bg-[#c9ef45] text-black" : "bg-[#171717] text-white hover:bg-[#9bb42e] hover:text-black"} disabled:opacity-50`}>
                  {added ? <><Check className="w-4 h-4" />Added!</> : <><ShoppingCart className="w-4 h-4" />Add to Cart</>}
                </button>
              <button onClick={() => {
                if (!product.inStock || categoryDisabled) return;
                const message = `Hi, I am interested in ${product.name} priced at NPR ${product.price.toLocaleString()}. Please send details.`;
                window.open(buildWhatsappLink(settings.whatsappNumber, message), "_blank");
              }} disabled={!product.inStock || categoryDisabled} className="hidden">
                Message on WhatsApp
              </button>
              <button onClick={buyNow} disabled={!product.inStock || categoryDisabled} className="w-full rounded-full border border-black/10 py-4 text-sm font-bold text-[#171717] transition hover:bg-[#f1f1ec] disabled:opacity-50">
                Buy Now with eSewa
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-y border-black/10 py-5 text-xs text-[#777870]"><span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#9bb42e]" />Free shipping</span><span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[#9bb42e]" />7-day returns</span>
            </div>
          </div>
        </div>
        <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">Customer Reviews</h2>
              <p className="text-sm text-gray-500">Approved reviews for this product.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
              <Star className="w-4 h-4 text-amber-500" />
              {reviews.length > 0 ? `${(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} (${reviews.length})` : "No reviews yet"}
            </div>
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-500">There are no approved reviews for this item yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"><Star className="w-3 h-3" />{review.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-3">{review.date}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="mt-8 rounded-3xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold mb-4">Write a review</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm text-gray-600">
                Your name
                <input value={reviewForm.name} onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
              </label>
              <label className="block text-sm text-gray-600">
                Rating
                <select value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                  {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}
                </select>
              </label>
              <label className="block text-sm text-gray-600">
                Date
                <input value={new Date().toISOString().slice(0, 10)} disabled
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-400" />
              </label>
            </div>
            <label className="block text-sm text-gray-600 mt-4">
              Review
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} rows={4}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
            </label>
            <button type="submit" className="mt-4 inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-900 transition">Submit Review</button>
            {reviewSubmitted && <p className="mt-3 text-sm text-green-600">Thank you! Your review has been submitted for approval.</p>}
          </form>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-5">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
