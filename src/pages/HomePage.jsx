import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/store";
import ProductCard from "../components/product/ProductCard";
import { fmt, isNew } from "../data/utils";


export default function HomePage() {
  const { products, banner, categoryImages } = useStore();
  const navigate  = useNavigate();
  const scrollRef = useRef(null);

  const newProducts = [...products].filter(isNew).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const newInList   = newProducts.length > 0 ? newProducts : products.slice(-6).reverse();

  function scrollRow(dir) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
  }

  const catTiles = [
    { label:"WOMEN", path:"/category/women",    img: categoryImages?.women    || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700" },
    { label:"MEN",   path:"/category/men",      img: categoryImages?.men      || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700" },
    { label:"KIDS",  path:"/category/children", img: categoryImages?.children || "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=700" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[75vh] sm:h-[85vh] min-h-100 flex items-end overflow-hidden">
        <img src={banner} alt="banner" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
        <div className="relative z-10 px-5 sm:px-8 pb-10 sm:pb-14 text-white">
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[4px] uppercase text-gold mb-2 sm:mb-3 font-body">SS26 Collection</p>
          <h1 className="font-display text-6xl sm:text-8xl md:text-[110px] leading-none mb-5 sm:mb-7">New<br />Season</h1>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => navigate("/category/women")} className="bg-white text-ink text-[10px] sm:text-[11px] font-bold tracking-[2.5px] px-5 sm:px-7 py-3 sm:py-3.5 hover:bg-ink hover:text-white transition-colors font-body">WOMEN</button>
            <button onClick={() => navigate("/category/men")}   className="border border-white text-white text-[10px] sm:text-[11px] font-bold tracking-[2.5px] px-5 sm:px-7 py-3 sm:py-3.5 hover:bg-white hover:text-ink transition-colors font-body">MEN</button>
          </div>
        </div>
      </div>

      {/* Category tiles */}
      <div className="grid grid-cols-3 h-[35vh] sm:h-[45vh] min-h-40">
        {catTiles.map(c => (
          <button key={c.path} onClick={() => navigate(c.path)} className="relative overflow-hidden group text-left">
            <img src={c.img} alt={c.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors" />
            <span className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white text-[9px] sm:text-[11px] font-bold tracking-[3px] sm:tracking-[4px] font-body">{c.label}</span>
          </button>
        ))}
      </div>

      {/* New In */}
      <div className="mt-10 sm:mt-14">
        <div className="flex items-baseline justify-between px-4 sm:px-8 pb-4 border-b border-sand">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <h2 className="font-serif italic font-light text-2xl sm:text-3xl">New In</h2>
            {newProducts.length > 0 && (
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[2px] text-brand font-body bg-brand/10 px-2 py-0.5">{newProducts.length} NEW</span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => scrollRow(-1)} className="w-7 h-7 border border-sand flex items-center justify-center text-sand hover:border-ink hover:text-ink transition-colors text-sm">‹</button>
              <button onClick={() => scrollRow(1)}  className="w-7 h-7 border border-sand flex items-center justify-center text-sand hover:border-ink hover:text-ink transition-colors text-sm">›</button>
            </div>
            <button onClick={() => navigate("/products")} className="text-[10px] font-bold tracking-[2px] sm:tracking-[2.5px] hover:opacity-40 transition-opacity font-body">ALL →</button>
          </div>
        </div>

        {newInList.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-[11px] tracking-[3px] uppercase text-sand font-body">No new products yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Fade edges — pointer-events-none so they don't block swipe */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-white to-transparent z-10" />
            <div
              ref={scrollRef}
              className="flex gap-px bg-sand overflow-x-auto scroll-smooth hide-scrollbar"
              style={{
                scrollbarWidth:          "none",     /* Firefox hide scrollbar */
                msOverflowStyle:         "none",     /* IE/Edge hide scrollbar */
                WebkitOverflowScrolling: "touch",    /* iOS momentum scroll */
                overscrollBehaviorX:     "contain",  /* don't trigger page pull-to-refresh */
                touchAction:             "pan-x pinch-zoom", /* allow horizontal swipe, block vertical */
                cursor:                  "grab",
                userSelect:              "none",
                WebkitUserSelect:        "none",
              }}
            >
              {newInList.map(p => (
                <div key={p.id || p._id} className="bg-white p-2.5 sm:p-3 shrink-0 w-40 sm:w-55">
                  <ProductCard p={p} />
                </div>
              ))}
              <div onClick={() => navigate("/products")}
                className="bg-ink text-white p-3 shrink-0 w-32.5 sm:w-40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-3xl sm:text-[32px] font-serif italic font-light">{products.length}</span>
                <span className="text-[8px] sm:text-[9px] font-bold tracking-[2px] sm:tracking-[3px] uppercase font-body text-center">All<br />Products</span>
                <span className="text-lg sm:text-xl text-white/50">→</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benefits strip */}
      <div className="bg-ink mt-10 sm:mt-12 py-3 px-4 sm:px-8 flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
        {["FREE SHIPPING OVER £200","30-DAY RETURNS","SECURE CHECKOUT"].map((t,i) => (
          <span key={t} className="flex items-center gap-3 sm:gap-5">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[2px] sm:tracking-[3px] text-white font-body">{t}</span>
            {i < 2 && <span className="text-white/20 hidden sm:inline">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
