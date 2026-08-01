import Link from "next/link";
import { XCircle } from "lucide-react";
export default function PaymentFailure() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f4] p-4"><div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-500" /></div>
        <h1 className="mb-2 text-2xl font-bold">Payment could not be completed</h1>
        <p className="text-gray-500 text-sm mb-6">Payment not completed. Your cart is still saved.</p>
        <div className="flex flex-col gap-2">
          <Link href="/checkout" className="rounded-full bg-[#171717] py-3.5 text-sm font-bold text-white">Try again</Link><Link href="/cart" className="rounded-full bg-[#f1f1ec] py-3.5 text-sm font-bold text-[#171717]">Back to cart</Link>
        </div>
      </div>
    </div>
  );
}
