"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DATA_CHANGED_EVENT, defaultCollections, getCollections } from "@/lib/data";

export default function CollectionsPage() {
  const [collections, setCollections] = useState(defaultCollections);
  useEffect(() => { const load = () => setCollections(getCollections()); load(); window.addEventListener(DATA_CHANGED_EVENT, load); return () => window.removeEventListener(DATA_CHANGED_EVENT, load); }, []);
  return <div className="min-h-screen bg-[#f7f7f4]"><Navbar /><main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"><section className="relative overflow-hidden rounded-[2rem] bg-[#dfe0d7]"><img src="/lookbook/09-collection-hero-duo.png" alt="9TEEN collections" className="h-[430px] w-full object-cover sm:h-[560px]" /><div className="absolute inset-0 bg-gradient-to-r from-black/65 to-transparent" /><div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-center p-8 text-white sm:p-14"><p className="eyebrow text-[#c9ef45]">Curated collections</p><h1 className="mt-4 text-5xl font-bold tracking-[-.07em]">Find your next uniform.</h1><p className="mt-4 text-sm leading-relaxed text-white/75">Designed for your everyday. Built for everywhere.</p><Link href="/products" className="mt-7 inline-flex w-fit rounded-full bg-[#c9ef45] px-5 py-3 text-xs font-black uppercase text-black">Explore all</Link></div></section><section className="grid gap-4 py-12 md:grid-cols-3">{collections.filter((item) => item.published).map((item) => <Link href={`/products?collection=${item.id}`} key={item.id} className="group relative aspect-[.95] overflow-hidden rounded-2xl"><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 text-white"><h2 className="text-2xl font-bold">{item.title}</h2><p className="mt-1 text-sm text-white/70">{item.subtitle}</p><span className="mt-4 inline-block rounded-full bg-[#c9ef45] px-4 py-2 text-[10px] font-black uppercase text-black">{item.ctaLabel}</span></div></Link>)}</section></main><Footer /></div>;
}
