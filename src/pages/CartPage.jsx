import { useNavigate } from "react-router-dom";
import { useStore } from "../context/store";
import { fmt } from "../data/utils";
import CartItem from "../components/cart/CartItem";

export default function CartPage() {
  const { cart, user, notify } = useStore();
  const navigate = useNavigate();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (!cart.length) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-[13px] font-bold tracking-[4px] uppercase font-body">Your bag is empty</p>
      <p className="text-sm text-sand font-body">Discover the new collection</p>
      <button onClick={() => navigate("/")} className="bg-ink text-white text-[10px] font-bold tracking-[3px] uppercase px-8 py-3.5 hover:opacity-70 font-body mt-2">SHOP NOW</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="flex items-baseline gap-3 pb-4 border-b border-sand mb-2">
        <h1 className="font-serif italic font-light text-2xl sm:text-3xl">Shopping Bag</h1>
        <span className="text-[11px] uppercase tracking-[1.5px] text-sand font-body">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">
        {/* Items */}
        <div>
          {cart.map(item => (
            <CartItem key={`${item.id}-${item.size}`} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="border border-sand p-5 sm:p-7 flex flex-col gap-4 lg:sticky lg:top-20">
          <h2 className="text-[11px] font-bold tracking-[3px] uppercase pb-4 border-b border-sand font-body">Order Summary</h2>
          <div className="flex flex-col gap-2">
            {cart.map(item => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between text-[11px] sm:text-[12px] text-ink/60 font-body gap-2">
                <span className="flex-1 truncate pr-1">{item.title} ({item.size}) ×{item.qty}</span>
                <span className="font-semibold text-ink shrink-0">{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-sand pt-3 flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-[2.5px] uppercase font-body">Total</span>
            <span className="text-xl font-semibold font-body">{fmt(total)}</span>
          </div>
          <p className="text-[11px] text-sand font-body">Free shipping on orders over £200</p>
          <button
            onClick={() => {
              if (!user) { notify("Sign in to checkout", true); navigate("/auth"); return; }
              navigate("/checkout");
            }}
            className="bg-ink text-white text-[11px] font-bold tracking-[3px] uppercase py-4 sm:py-4.5 hover:opacity-70 transition-opacity font-body">
            PROCEED TO CHECKOUT
          </button>
          <button onClick={() => navigate("/")} className="border border-sand text-[10px] font-bold tracking-[2.5px] uppercase py-3 sm:py-3.5 hover:border-ink transition-colors font-body">
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
}
