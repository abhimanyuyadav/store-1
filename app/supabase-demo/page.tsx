import Link from "next/link";

export default function DataPlatformPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] p-6"><div className="max-w-lg rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm"><p className="eyebrow">9TEEN platform</p><h1 className="mt-3 text-3xl font-bold">Convex is connected</h1><p className="mt-4 text-sm leading-relaxed text-[#777870]">This storefront uses Convex for authentication, catalog data, orders, settings, reviews, coupons, collections, and image storage.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-[#c9ef45] px-5 py-3 text-xs font-black uppercase">Return to store</Link></div></main>;
}
