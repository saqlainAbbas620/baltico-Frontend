import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { finalPrice, fmt, isNew } from "../../data/utils";

export default function ProductCard({ p }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const fp = finalPrice(p);

  return (
    <div
      onClick={() => navigate(`/product/${p._id || p.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer group">

      {/* Image */}
      <div className="relative aspect-3/4 overflow-hidden bg-cream">
        <img
          src={hover && p.img2 ? p.img2 : p.img}
          alt={p.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
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
