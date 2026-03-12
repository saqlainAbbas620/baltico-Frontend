import { useState, useMemo } from "react";
import { useStore } from "../context/store";
import { finalPrice, isNew } from "../data/utils";
import ProductCard from "../components/product/ProductCard";
import { FiSliders, FiX } from "react-icons/fi";

// const CATS   = ["all","men","women","children"];
// const STOCKS = [
//   { value:"all", label:"All" },
//   { value:"in",  label:"In Stock" },
//   { value:"low", label:"Low Stock" },
//   { value:"out", label:"Out of Stock" },
// ];
// const CAT_LABELS = { all:"All", men:"Men", women:"Women", children:"Kids" };

export default function AllProductsPage() {
  const { products } = useStore();
  const [cat,         setCat]         = useState("all");
  const [stock,       setStock]       = useState("all");
  const [sort,        setSort]        = useState("new");
  const [search,      setSearch]      = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || (p.desc||"").toLowerCase().includes(q));
    }
    if (cat   !== "all") list = list.filter(p => p.cat   === cat);
    if (stock !== "all") list = list.filter(p => p.stock === stock);
    if (sort === "new")  list.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
    if (sort === "old")  list.sort((a,b) => new Date(a.createdAt||0) - new Date(b.createdAt||0));
    if (sort === "asc")  list.sort((a,b) => finalPrice(a) - finalPrice(b));
    if (sort === "desc") list.sort((a,b) => finalPrice(b) - finalPrice(a));
    return list;
  }, [products, cat, stock, sort, search]);

  const newCount      = products.filter(isNew).length;
  const activeFilters = (cat !== "all" ? 1 : 0) + (stock !== "all" ? 1 : 0) + (search ? 1 : 0);
  function clearAll() { setCat("all"); setStock("all"); setSearch(""); setSort("new"); }

  return (
    <div className="min-h-[60vh]">
      {/* Header */}
      <div className="border-b border-sand bg-white sticky top-14 z-30">
        <div className="px-4 sm:px-8 py-4 sm:py-5 flex flex-col gap-3">

          {/* Title + sort row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
              <h1 className="font-serif italic font-light text-3xl sm:text-4xl">All Products</h1>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[1.5px] text-sand font-body shrink-0">
                {filtered.length}/{products.length}
              </span>
              {newCount > 0 && (
                <span className="text-[9px] font-bold tracking-[2px] text-brand bg-brand/10 px-2 py-0.5 font-body">{newCount} NEW</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile filter toggle */}
              <button onClick={() => setFiltersOpen(v => !v)}
                className="sm:hidden flex items-center gap-1.5 border border-sand px-3 py-2 text-[10px] font-bold tracking-[1.5px] uppercase font-body hover:border-ink transition-colors">
                <FiSliders size={11} />
                {activeFilters > 0 ? `FILTERS (${activeFilters})` : "FILTERS"}
              </button>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="border border-sand bg-white text-[10px] sm:text-[11px] font-semibold tracking-[1.5px] uppercase px-2 sm:px-3 py-2 focus:outline-none cursor-pointer font-body">
                <option value="new">NEWEST</option>
                <option value="old">OLDEST</option>
                <option value="asc">PRICE ↑</option>
                <option value="desc">PRICE ↓</option>
              </select>
            </div>
          </div>

          {/* Desktop filters always visible / Mobile toggle */}
          <div className={`${filtersOpen ? "flex" : "hidden sm:flex"} flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap`}>
            {/* Search */}
            <div className="relative flex-1 min-w-0 sm:min-w-40 sm:max-w-xs">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="w-full border border-sand bg-transparent text-[12px] px-3 py-2 pr-7 focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-sand hover:text-ink">
                  <FiX size={12} />
                </button>
              )}
            </div>

            {/* Category pills
            <div className="flex gap-1 flex-wrap">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`text-[9px] font-bold tracking-[1.5px] uppercase px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all font-body ${cat===c ? "bg-ink text-white" : "border border-sand text-sand hover:border-ink hover:text-ink"}`}>
                  {CAT_LABELS[c]}
                </button>
              ))}
            </div> */}

            {/* Stock pills */}
            {/* <div className="flex gap-1 flex-wrap">
              {STOCKS.map(({ value, label }) => (
                <button key={value} onClick={() => setStock(value)}
                  className={`text-[9px] font-bold tracking-[1.5px] uppercase px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all font-body ${stock===value ? "bg-ink text-white" : "border border-sand text-sand hover:border-ink hover:text-ink"}`}>
                  {label}
                </button>
              ))}
            </div> */}

            {activeFilters > 0 && (
              <button onClick={clearAll} className="text-[9px] font-bold tracking-[1.5px] uppercase text-red-400 hover:text-red-600 font-body flex items-center gap-1">
                <FiX size={10} /> CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <p className="text-[11px] tracking-[3px] uppercase text-sand font-body">No products found</p>
          <button onClick={clearAll} className="text-[10px] font-bold tracking-[2px] uppercase border border-sand px-5 py-2.5 hover:border-ink transition-colors font-body">CLEAR FILTERS</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-sand">
          {filtered.map(p => (
            <div key={p.id || p._id} className="bg-white p-2.5 sm:p-3 relative">
              {isNew(p) && (
                <div className="absolute top-0 right-0 z-10 bg-brand text-white text-[7px] font-bold tracking-[2px] px-1.5 py-0.5 font-body">NEW</div>
              )}
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
