import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiHeart, FiArrowLeft } from "react-icons/fi";
import { useStore } from "../context/store";
import { finalPrice, fmt } from "../data/utils";

export default function ProductPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { products, user, addToCart, notify } = useStore();
  const p = products.find(x => String(x._id || x.id) === String(id));
  const [size, setSize]       = useState("");
  const [activeImg, setActiveImg] = useState(0);

  if (!p) return (
    <div className="py-20 flex flex-col items-center gap-4">
      <p className="text-sand font-body text-sm tracking-widest">PRODUCT NOT FOUND</p>
      <button onClick={() => navigate(-1)} className="text-[10px] font-bold tracking-[2px] uppercase border border-sand px-5 py-2.5 hover:border-ink transition-colors font-body">GO BACK</button>
    </div>
  );

  const fp    = finalPrice(p);
  const isOut = p.stock === "out";
  const imgs  = [p.img, p.img2].filter(Boolean);

  const stockColor = isOut ? "text-red-500" : p.stock === "low" ? "text-amber-500" : "text-green-600";
  const stockDot   = isOut ? "bg-red-500"   : p.stock === "low" ? "bg-amber-500"   : "bg-green-500";
  const stockText  = isOut ? "Out of Stock"
    : p.stock === "low" ? `Low Stock${p.quantity !== undefined ? ` — ${p.quantity} left` : ""}`
    : "In Stock";

  const handleAdd = () => {
    if (!user)  { notify("Sign in to add to cart", true); navigate("/auth"); return; }
    if (isOut)  { notify("This product is out of stock", true); return; }
    if (!size)  { notify("Select a size first", true); return; }
    addToCart({ id: p._id || p.id, title: p.title, price: fp, img: p.img, size });
  };

  return (
    <div className="min-h-screen">
      {/* Back button on mobile */}
      <button onClick={() => navigate(`/category/${p.cat}`)}
        className="flex items-center gap-2 px-4 py-3 text-[10px] font-bold tracking-[2px] uppercase text-sand hover:text-ink transition-colors font-body sm:hidden border-b border-sand w-full">
        <FiArrowLeft size={12} /> {p.cat?.toUpperCase()}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] items-start">
        {/* Gallery */}
        <div className="flex">
          {/* Desktop thumbnails */}
          <div className="hidden md:flex flex-col gap-px w-15 lg:w-17 shrink-0 p-px sticky top-14 h-fit">
            {imgs.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`w-full aspect-3/4 overflow-hidden bg-cream transition-opacity ${activeImg===i?"opacity-100 ring-1 ring-ink":"opacity-50 hover:opacity-80"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main images */}
          <div className="flex-1 flex flex-col gap-px">
            {/* Mobile single image with dots */}
            <div className="lg:hidden">
              <div className="relative w-full aspect-3/4 overflow-hidden bg-cream">
                <img src={imgs[activeImg] || p.img} alt={p.title} className="w-full h-full object-cover" />
                {p.disc > 0 && <span className="absolute top-3 left-3 bg-ink text-white text-[9px] font-bold px-2 py-0.5 font-body">−{p.disc}%</span>}
              </div>
              {imgs.length > 1 && (
                <div className="flex justify-center gap-1.5 py-2">
                  {imgs.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${activeImg===i?"bg-ink":"bg-sand"}`} />
                  ))}
                </div>
              )}
            </div>
            {/* Desktop stacked */}
            <div className="hidden lg:flex flex-col gap-px">
              {imgs.map((img, i) => (
                <div key={i} className="w-full aspect-3/4 overflow-hidden bg-cream group">
                  <img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:sticky lg:top-14 lg:max-h-[calc(100vh-56px)] lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-sand px-5 sm:px-7 py-6 sm:py-8 flex flex-col gap-4 sm:gap-5">

          <button onClick={() => navigate(`/category/${p.cat}`)}
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold tracking-[2px] uppercase text-sand hover:text-ink transition-colors text-left font-body">
            <FiArrowLeft size={10} /> {p.cat?.toUpperCase()}
          </button>

          <h1 className="text-xl sm:text-2xl font-medium font-body leading-snug">{p.title}</h1>

          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold font-body">{fmt(fp)}</span>
            {p.disc > 0 && <>
              <span className="text-sm text-sand line-through font-body">{fmt(p.price)}</span>
              <span className="bg-ink text-white text-[9px] font-bold tracking-[1px] px-2 py-0.5 font-body">−{p.disc}%</span>
            </>}
          </div>

          <div className={`flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase font-body ${stockColor}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${stockDot}`} />
            {stockText}
          </div>

          <p className="text-[13px] leading-[1.85] text-ink/60 pt-3 border-t border-sand font-body">{p.desc}</p>

          <div>
            <p className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 mb-2.5 font-body">SELECT SIZE</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes?.map(s => (
                <button key={s} onClick={() => !isOut && setSize(s)} disabled={isOut}
                  className={`border text-[11px] font-semibold tracking-[1px] px-3 sm:px-3.5 py-2 sm:py-2.5 min-w-10.5 text-center transition-all font-body ${
                    size===s ? "bg-ink text-white border-ink"
                    : isOut ? "border-sand text-sand/40 cursor-not-allowed"
                    : "border-sand hover:border-ink"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button onClick={handleAdd} disabled={isOut}
              className={`text-[11px] font-bold tracking-[3px] uppercase py-4 sm:py-4.5 w-full transition-opacity font-body ${isOut?"bg-sand/50 text-ink/40 cursor-not-allowed":"bg-ink text-white hover:opacity-70"}`}>
              {isOut ? "OUT OF STOCK" : "ADD TO CART"}
            </button>
            
          </div>

          <div className="border-t border-sand pt-4 flex flex-col gap-1.5">
            {["Free shipping over £200","30-day returns","Secure checkout"].map(t => (
              <p key={t} className="text-[11px] text-sand font-body flex items-center gap-2">
                <span className="text-green-500">✓</span> {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
