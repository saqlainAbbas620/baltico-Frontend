import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { finalPrice, fmt, isNew } from "../../data/utils";

export default function ProductCard({ p }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const fp = finalPrice(p);

  // ── Swipe-safe tap detection ───────────────────────────────────────────────
  // Track touch start position and whether the gesture was a swipe.
  // handleClick checks the flag — if it was a swipe, skip navigation.
  const touchStart = useRef(null);
  const wasSwiped  = useRef(false);

  function handleTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    wasSwiped.current  = false;
  }

  function handleTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStart.current.x);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStart.current.y);
    wasSwiped.current  = dx > 8 || dy > 8;
    touchStart.current = null;
  }

  function handleClick() {
    // The synthetic click fires after touchend — block it if the gesture was a swipe
    if (wasSwiped.current) { wasSwiped.current = false; return; }
    navigate(`/product/${p._id || p.id}`);
  }

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer group select-none"
    >

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        <img
          src={hover && p.img2 ? p.img2 : p.img}
          alt={p.title}
          draggable={false}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] pointer-events-none"
        />
        {/* Badges */}
        {p.disc > 0 && (
          <span className="absolute top-2 left-2 bg-ink text-white text-[8px] font-bold tracking-wide px-1.5 py-0.5 font-body">
            −{p.disc}%
          </span>
        )}
        {p.stock === "low" && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-bold tracking-wide px-1.5 py-0.5 font-body">
            LOW
          </span>
        )}
        {p.stock === "out" && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold tracking-wide px-1.5 py-0.5 font-body">
            OUT
          </span>
        )}
        {isNew(p) && (
          <span className="absolute bottom-2 left-2 bg-brand text-white text-[8px] font-bold tracking-[2px] px-1.5 py-0.5 font-body">
            NEW
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-2">
        <p className="text-[12px] font-medium font-body leading-tight">{p.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[12px] font-semibold font-body">{fmt(fp)}</span>
          {p.disc > 0 && (
            <span className="text-[10px] text-sand line-through font-body">{fmt(p.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
