"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DATA_CHANGED_EVENT, getSiteSettings, defaultSiteSettings } from "@/lib/data";

export default function Footer() {
  const [settings, setSettings] = useState(defaultSiteSettings);

  useEffect(() => {
    const loadSettings = () => setSettings(getSiteSettings());
    loadSettings();
    window.addEventListener(DATA_CHANGED_EVENT, loadSettings);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, loadSettings);
  }, []);

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(settings.whatsappMessage)}`;

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#171717] text-white sm:mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.4fr_0.8fr_1.2fr_1fr]">
        <div className="space-y-4">
          <p className="text-2xl font-bold tracking-[-0.07em]">{settings.siteName.slice(0, 1)}<span className="text-[#d8522b]">{settings.siteName.slice(1)}</span></p>
          <p className="max-w-sm text-sm leading-relaxed text-white/55">{settings.tagline}</p>
        </div>

        <div>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Explore</p>
          <div className="space-y-3 text-sm text-white/65">
            <Link href="/" className="block transition hover:text-white">Home</Link>
            <Link href="/products" className="block transition hover:text-white">Shop all</Link>
            <Link href="/products" className="block transition hover:text-white">Collections</Link>
            <Link href="/about" className="block transition hover:text-white">Our story</Link>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Need help?</p>
            <p className="text-sm leading-relaxed text-white/65">{settings.footerMiddleText}</p>
          </div>
          <Link href={whatsappUrl} target="_blank" rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-[#d8522b] hover:text-white">
            {settings.footerWhatsAppButtonLabel}
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Contact</p>
            <p className="text-sm text-white/65">{settings.footerContactEmail}</p>
            <p className="text-sm text-white/65">{settings.footerContactPhone}</p>
            <p className="text-sm text-white/65">{settings.footerContactLocation}</p>
          </div>
          <div className="space-y-2 text-sm text-white/50">
            <p>{settings.footerDeveloperText}</p>
            <Link href={settings.footerDeveloperLink} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white underline">
              {settings.footerDeveloperLinkLabel}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">Updated: {settings.footerUpdatedDate}</div>
    </footer>
  );
}
