"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { getLastOrder, getOrders, saveOrders } from "@/lib/data";
import { CheckCircle, Package } from "lucide-react";

export default function PaymentSuccess() {
  const { dispatch } = useCart();
  const [order, setOrder] = useState<any>(null);
  useEffect(() => {
    const last = getLastOrder();
    if (last) {
      const o: any = { ...last, paymentStatus: "paid", status: "processing" };
      setOrder(o);
      const orders = getOrders();
      const idx = orders.findIndex((x: any) => x.id === o.id);
      if (idx !== -1) {
        const nextOrders = [...orders];
        nextOrders[idx] = { ...last, paymentStatus: "paid" as const, status: "processing" as const };
        saveOrders(nextOrders);
      }
    }
    dispatch({ type: "CLEAR" });
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#f7f7f4] flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#171717] p-8 text-center text-white shadow-xl sm:p-12">
        <img src="/lookbook/13-order-success-hoodie.png" alt="9TEEN order" className="absolute inset-0 h-full w-full object-cover opacity-30" /><div className="relative"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9ef45]"><CheckCircle className="h-8 w-8 text-black" /></div>
        <h1 className="mb-2 text-3xl font-bold">Order placed successfully!</h1>
        <p className="text-gray-500 text-sm mb-5">Your 9TEEN order has been confirmed.</p>
        {order && <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-400 mb-1">Order ID</p>
          <p className="font-mono font-bold text-sm">{order.id}</p>
          <p className="text-xs text-gray-400 mt-2 mb-1">Total Paid</p>
          <p className="font-bold">Rs {order.total?.toLocaleString()}</p>
        </div>}
        <div className="flex flex-col gap-2"><Link href="/track-order" className="flex items-center justify-center gap-2 rounded-full bg-[#c9ef45] py-3.5 text-sm font-bold text-black"><Package className="h-4 w-4" />Track my order</Link>
          <Link href="/" className="rounded-full border border-white/20 py-3.5 text-sm font-bold text-white">Continue shopping</Link>
        </div>
      </div></div>
    </div>
  );
}
