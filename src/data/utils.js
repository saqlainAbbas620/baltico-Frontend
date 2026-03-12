// ── New product helper ────────────────────────────────────────────────────────
/** A product is "new" if it was created within the last 30 days */
export const isNew = (p) => {
  if (!p?.createdAt) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return new Date(p.createdAt) > cutoff;
};

// ── Price helpers ─────────────────────────────────────────────────────────────
export const finalPrice = (p) =>
  p.disc > 0 ? Math.round(p.price * (1 - p.disc / 100)) : p.price;

export const fmt = (n) => `£${n.toLocaleString("en-GB")}`;

// ── Order status styles (Tailwind classes) ────────────────────────────────────
export const statusStyle = (s) =>
  ({
    pending:   "text-yellow-500 border-yellow-500",
    shipped:   "text-blue-500 border-blue-500",
    delivered: "text-green-500 border-green-500",
    cancelled: "text-red-500 border-red-500",
  }[s] || "text-gray-400 border-gray-400");

// ── Stock helpers ─────────────────────────────────────────────────────────────

/** Derive stock label from a quantity number */
export const stockFromQty = (qty) => {
  if (qty === undefined || qty === null) return "in";
  if (qty <= 0) return "out";
  if (qty < 10) return "low";
  return "in";
};

/** Return Tailwind colour classes + human label for a stock value */
export const stockInfo = (stock, quantity) => {
  if (stock === "out") return {
    color: "text-red-500",
    dot:   "bg-red-500",
    badge: "text-red-500 border-red-500",
    label: "Out of Stock",
  };
  if (stock === "low") return {
    color: "text-amber-500",
    dot:   "bg-amber-500",
    badge: "text-amber border-amber",
    label: quantity !== undefined ? `Low Stock — ${quantity} left` : "Low Stock",
  };
  return {
    color: "text-green-600",
    dot:   "bg-green-500",
    badge: "text-green-500 border-green-500",
    label: "In Stock",
  };
};
