import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/store";
import { fmt } from "../data/utils";

export default function CheckoutPage() {
  const { cart, user, placeOrder, notify } = useStore();
  const navigate = useNavigate();
  const [addr,    setAddr]    = useState(user?.address || "");
  const [phone,   setPhone]   = useState(user?.phone   || "");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(null);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function submit() {
    if (!addr.trim()) { notify("Enter a delivery address", true); return; }
    if (!cart.length) { notify("Your cart is empty", true); return; }
    setLoading(true);
    try {
      const order = await placeOrder(addr, phone);
      setDone({ id: order.id, total: order.total });
    } catch (err) {
      notify(err?.response?.data?.message || "Something went wrong. Please try again.", true);
    }
    setLoading(false);
  }

  if (done) return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-5 sm:p-8">
      <div className="text-center flex flex-col items-center gap-4 max-w-md w-full">
        <div className="w-14 h-14 border-2 border-green-500 flex items-center justify-center text-2xl text-green-500">✓</div>
        <p className="text-[10px] font-bold tracking-[4px] uppercase text-green-500 font-body">Order Confirmed</p>
        <h2 className="font-display text-4xl sm:text-5xl">{done.id}</h2>
        <p className="text-sm text-ink/60 leading-relaxed font-body">Thank you! Your order has been placed. Estimated delivery: 3–5 business days.</p>
        <p className="text-[11px] tracking-[1.5px] text-sand uppercase font-body">Cash on Delivery · {fmt(done.total)}</p>
        <div className="flex gap-3 mt-3 w-full sm:w-auto">
          <button onClick={() => navigate("/profile")} className="flex-1 sm:flex-none border border-ink text-ink text-[10px] font-bold tracking-[3px] uppercase px-5 sm:px-7 py-3 sm:py-3.5 hover:bg-ink hover:text-white transition-colors font-body">MY ORDERS</button>
          <button onClick={() => navigate("/")}        className="flex-1 sm:flex-none bg-ink text-white text-[10px] font-bold tracking-[3px] uppercase px-5 sm:px-7 py-3 sm:py-3.5 hover:opacity-70 font-body">SHOP MORE</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] min-h-[calc(100vh-56px)]">
      {/* Form */}
      <div className="p-5 sm:p-10 lg:p-14 flex flex-col gap-6 sm:gap-8 border-b lg:border-b-0 lg:border-r border-sand order-2 lg:order-1">
        <div className="pb-4 sm:pb-6 border-b border-sand">
          <span className="font-display text-xl sm:text-2xl">BaltiCo</span>
        </div>
        <div className="flex flex-col gap-4 sm:gap-5">
          <p className="text-[9px] font-bold tracking-[3px] uppercase text-ink/50 font-body">DELIVERY</p>
          <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="Full delivery address"
            className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number"
            className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[9px] font-bold tracking-[3px] uppercase text-ink/50 font-body">PAYMENT</p>
          <div className="flex items-center gap-4 border border-ink p-3 sm:p-4">
            <span className="text-xl sm:text-2xl">💵</span>
            <div>
              <p className="text-[13px] font-semibold font-body">Cash on Delivery</p>
              <p className="text-[11px] text-sand font-body mt-0.5">Pay when your order arrives</p>
            </div>
            <span className="ml-auto font-bold">✓</span>
          </div>
        </div>
        <button onClick={submit} disabled={loading || !cart.length}
          className="bg-ink text-white text-[11px] font-bold tracking-[3px] uppercase py-4 sm:py-5 hover:opacity-70 transition-opacity disabled:opacity-40 font-body">
          {loading
            ? <span className="inline-flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                PLACING ORDER...
              </span>
            : `PLACE ORDER — ${fmt(total)}`
          }
        </button>
      </div>

      {/* Summary (shows first on mobile) */}
      <div className="bg-cream p-5 sm:p-10 lg:p-14 flex flex-col gap-4 sm:gap-5 order-1 lg:order-2">
        <h3 className="text-[10px] font-bold tracking-[3px] uppercase pb-3 sm:pb-4 border-b border-sand font-body">Your Order ({cart.length} items)</h3>
        <div className="flex flex-col gap-3 sm:gap-4">
          {cart.map(item => (
            <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
              <div className="relative w-12 sm:w-14 aspect-3/4 shrink-0">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute -top-1.5 -right-1.5 bg-sand text-ink w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center font-body">{item.qty}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium font-body leading-tight">{item.title}</p>
                <p className="text-[11px] text-sand uppercase tracking-wide font-body">Size: {item.size}</p>
              </div>
              <span className="text-[13px] font-semibold font-body shrink-0">{fmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-sand pt-3 sm:pt-4 flex justify-between items-center">
          <span className="text-[11px] font-bold tracking-[2px] uppercase font-body">Total</span>
          <span className="text-xl font-semibold font-body">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
