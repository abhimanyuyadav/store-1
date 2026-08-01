"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X, Heart, User, ArrowUpRight, Shield } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { DATA_CHANGED_EVENT, getSiteSettings, defaultSiteSettings } from "@/lib/data";

export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const router = useRouter();
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [user, setUser] = useState<{ name: string; role: "customer" | "admin" } | null>(null);
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const loadSettings = () => {
      setSettings(getSiteSettings());
      void fetch("/api/auth/session").then((response) => response.json()).then(({ user }) => setUser(user)).catch(() => setUser(null));
    };

    loadSettings();
    window.addEventListener(DATA_CHANGED_EVENT, loadSettings);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, loadSettings);
  }, []);

  const handleSearchSubmit = () => {
    const query = q.trim();
    router.push(`/products${query ? `?search=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <header className="relative z-50 w-full">
      {/* Promo */}
      <div className="w-full border-b border-black/[0.08] bg-[#fcfcfa]">
        <div className="bg-[#171717] py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
          <div className="mx-auto flex justify-center px-3 text-center">{settings.promoText}</div>
        </div>

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="inline-block font-black text-lg tracking-[-0.08em] transition-transform duration-300 hover:scale-[1.04]">{settings.siteName.slice(0, 1)}<span className="text-[#95ad2b]">{settings.siteName.slice(1)}</span></Link>
        </div>

        <nav className="ml-2 hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-[#666] lg:flex">
          <Link href="/products" className="relative inline-block transition-all duration-300 after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#9bb42e] after:transition-transform hover:-translate-y-0.5 hover:text-[#7b911e] hover:after:scale-x-100">{settings.navLabelShop}</Link>
          <Link href="/products?cat=tees" className="relative inline-block transition-all duration-300 after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#9bb42e] after:transition-transform hover:-translate-y-0.5 hover:text-[#7b911e] hover:after:scale-x-100">{settings.navLabelCategories}</Link>
          <Link href="/collections" className="relative inline-block transition-all duration-300 after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#9bb42e] after:transition-transform hover:-translate-y-0.5 hover:text-[#7b911e] hover:after:scale-x-100">{settings.navLabelCollections}</Link>
          <Link href="/products?new=true" className="relative inline-block transition-all duration-300 after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#9bb42e] after:transition-transform hover:-translate-y-0.5 hover:text-[#7b911e] hover:after:scale-x-100">New arrivals</Link>
          <Link href="/about" className="relative inline-block transition-all duration-300 after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#9bb42e] after:transition-transform hover:-translate-y-0.5 hover:text-[#7b911e] hover:after:scale-x-100">{settings.navLabelAbout}</Link>
        </nav>

        <div className="flex-1 hidden md:flex items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-3 top-1/2 w-4 -translate-y-1/2 ${overlay ? "text-white/70" : "text-gray-400"}`} />
            <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearchSubmit()} placeholder={settings.searchPlaceholder}
              className="w-full rounded-full border border-black/[0.09] bg-[#f5f5f2] py-2 pl-8 pr-3 text-[11px] outline-none transition placeholder:text-gray-400 focus:border-[#9bb42e] focus:bg-white" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link href={user ? "/account" : "/login"} className="hidden items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-[#444] transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/[0.05] lg:inline-flex">{user ? user.name.split(" ")[0] : settings.navLabelLogin}<ArrowUpRight className="w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" /></Link>
          <Link href="/wishlist" aria-label="Wishlist" className="hidden rounded-full p-2 transition-all duration-300 hover:scale-110 hover:bg-black/[0.05] md:inline-flex"><Heart className="h-4 w-4" /></Link>
          <Link href="/account" aria-label="Account" className="hidden rounded-full p-2 transition-all duration-300 hover:scale-110 hover:bg-black/[0.05] md:inline-flex"><User className="h-4 w-4" /></Link>
          <Link href="/admin" aria-label="Admin dashboard" title="Admin dashboard" className="hidden rounded-full p-2 text-[#738719] transition-all duration-300 hover:scale-110 hover:bg-[#c9ef45]/30 md:inline-flex"><Shield className="h-3.5 w-3.5" /></Link>
          <Link href="/cart" aria-label="Shopping cart" className="relative rounded-full p-2 transition-all duration-300 hover:scale-110 hover:bg-black/[0.05]">
            <ShoppingCart className="h-4.5 w-4.5" />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#c9ef45] px-1 text-center text-[9px] font-bold leading-4 text-black">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-black/[0.07] bg-white md:hidden">
          <div className="px-4 py-3 space-y-2">
            <Link href="/products" className="block py-2">{settings.navLabelShop}</Link>
            <Link href="/products?cat=dresses" className="block py-2">{settings.navLabelCategories}</Link>
            <Link href="/products" className="block py-2">{settings.navLabelCollections}</Link>
            <Link href="/track-order" className="block py-2">{settings.navLabelTrackOrder}</Link>
            <Link href="/about" className="block py-2">{settings.navLabelAbout}</Link>
            <Link href={user ? "/account" : "/login"} className="block py-2">{user ? user.name.split(" ")[0] : settings.navLabelLogin}</Link>
            <Link href="/wishlist" className="block py-2">Wishlist</Link>
            <Link href="/account" className="block py-2">Account</Link>
            <Link href="/admin" className="block py-2">Admin Panel</Link>
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
