import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import { useStore } from "../context/store";


const LABELS = { women:"Women", men:"Men", children:"Kids", sale:"Sale" };

export default function CategoryPage() {
  const { cat }    = useParams();
  const navigate   = useNavigate();
  const { products } = useStore();
  const [sort, setSort] = useState("default");

  let list = cat === "sale"
    ? products.filter(p => p.disc > 0)
    : products.filter(p => p.cat === cat);

  if (sort === "asc")  list = [...list].sort((a,b) => a.price - b.price);
  if (sort === "desc") list = [...list].sort((a,b) => b.price - a.price);

  return (
    <div className="min-h-[60vh]">
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 sm:py-7 border-b border-sand gap-3">
        <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
          <h1 className="font-serif italic font-light text-3xl sm:text-4xl">{LABELS[cat] || cat}</h1>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[1.5px] text-sand font-body shrink-0">{list.length} pieces</span>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="border border-sand bg-white text-[10px] sm:text-[11px] font-semibold tracking-[1.5px] uppercase px-2 sm:px-3 py-2 focus:outline-none cursor-pointer font-body shrink-0">
          <option value="default">FEATURED</option>
          <option value="asc">PRICE ↑</option>
          <option value="desc">PRICE ↓</option>
        </select>
      </div>

      {list.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <p className="text-center text-[11px] tracking-[3px] uppercase text-sand font-body">No products found.</p>
          <button onClick={() => navigate("/")} className="text-[10px] font-bold tracking-[2px] uppercase border border-sand px-5 py-2.5 hover:border-ink transition-colors font-body">BACK HOME</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-sand">
          {list.map(p => (
            <div key={p._id || p.id} className="bg-white p-2.5 sm:p-3">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
