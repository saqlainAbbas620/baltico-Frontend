import ProductCard from "./ProductCard";

/**
 * Responsive product grid.
 * cols: "2" | "3" | "4" | "5"  (default "4")
 */
export default function ProductGrid({ products, cols = "4" }) {
  const colClass = {
    "2": "grid-cols-2",
    "3": "grid-cols-2 sm:grid-cols-3",
    "4": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    "5": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  }[cols] || "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <div className={`grid ${colClass} gap-px bg-sand`}>
      {products.map(p => (
        <div key={p._id || p.id} className="bg-white p-2.5 sm:p-3">
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  );
}
