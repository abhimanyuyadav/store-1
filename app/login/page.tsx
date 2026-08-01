"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Form = { name: string; email: string; phone: string; password: string; address: string; city: string };
const blank: Form = { name: "", email: "", phone: "", password: "", address: "", city: "" };

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState<Form>(blank);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { void fetch("/api/auth/session").then((r) => r.json()).then(({ user }) => { if (user) router.replace("/account"); }).catch(() => undefined); }, [router]);
  const field = (name: keyof Form, label: string, type = "text", required = true) => <label className="block text-sm font-medium text-[#575752]">{label}<input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="mt-2 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 py-3 outline-none transition focus:border-[#d8522b] focus:ring-2 focus:ring-[#d8522b]/10" required={required} /></label>;

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage(""); setLoading(true);
    const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "login" ? { email: form.email, password: form.password, requiredRole: "customer" } : form) });
    const result = await response.json().catch(() => ({})); setLoading(false);
    if (!response.ok) return setMessage(result.error || "Something went wrong.");
    router.push("/account"); router.refresh();
  }

  return <main className="min-h-screen bg-[#f7f7f4] px-4 py-10 sm:py-16"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-black/[0.08] bg-white shadow-[0_24px_80px_-45px_rgba(0,0,0,.45)] lg:grid-cols-[.9fr_1.1fr]">
    <aside className="bg-[#171717] p-8 text-white sm:p-12"><Link href="/" className="text-xl font-bold tracking-[-.07em]">9<span className="text-[#d8522b]">TEEN</span></Link><div className="mt-20 max-w-sm"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/50">Your account</p><h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-.05em]">A better way to keep track of your style.</h1><p className="mt-5 text-sm leading-relaxed text-white/65">Sign in to see orders, save your details, and make checkout faster.</p></div></aside>
    <section className="p-8 sm:p-12"><div className="flex rounded-full bg-[#f2f2ee] p-1"><button onClick={() => { setMode("login"); setMessage(""); }} className={`flex-1 rounded-full py-2 text-sm font-bold transition ${mode === "login" ? "bg-white shadow-sm" : "text-[#777]"}`}>Sign in</button><button onClick={() => { setMode("register"); setMessage(""); }} className={`flex-1 rounded-full py-2 text-sm font-bold transition ${mode === "register" ? "bg-white shadow-sm" : "text-[#777]"}`}>Create account</button></div>
      <form onSubmit={submit} className="mt-8 space-y-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#8b8b85]">{mode === "login" ? "Welcome back" : "Join 9TEEN"}</p><h2 className="mt-2 text-3xl font-bold tracking-[-.04em]">{mode === "login" ? "Sign in to your account" : "Create your account"}</h2></div>
      {mode === "register" && <div className="grid gap-4 sm:grid-cols-2">{field("name", "Full name")} {field("phone", "Phone")} </div>}
      {field("email", "Email address", "email")} {field("password", "Password", "password")}
      {mode === "register" && <><div className="grid gap-4 sm:grid-cols-2">{field("city", "City")}<div /></div><label className="block text-sm font-medium text-[#575752]">Address<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 py-3 outline-none focus:border-[#d8522b]" required /></label><p className="text-xs leading-relaxed text-[#777]">Use 8+ characters with a letter, number, and special character.</p></>}
      {message && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}<button disabled={loading} className="w-full rounded-full bg-[#171717] py-3.5 text-sm font-bold text-white transition hover:bg-[#d8522b] disabled:opacity-60">{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form></section>
  </div></main>;
}
