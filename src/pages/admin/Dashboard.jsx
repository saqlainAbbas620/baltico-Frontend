import { useState, useEffect } from "react";
import { useStore } from "../../context/store";
import { fmt } from "../../data/utils";
import { apiGetAllOrders } from "../../api";

export default function Dashboard() {
  const { products, orders: localOrders } = useStore();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiGetAllOrders()
      .then(res => { const f = res.data?.data?.orders || []; setOrders(f.length ? f : localOrders); })
      .catch(() => setOrders(localOrders))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("baltico:new-order", handler);
    return () => window.removeEventListener("baltico:new-order", handler);
  }, []);

  const revenue     = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const statusCount = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  const maxTotal    = Math.max(...orders.map(o => o.total), 1);
  const lowStock    = products.filter(p => p.stock === "low").length;
  const outStock    = products.filter(p => p.stock === "out").length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif italic font-light text-4xl">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "TOTAL REVENUE", value: fmt(revenue),            border: "border-t-brand",      sub: "all non-cancelled" },
          { label: "TOTAL ORDERS",  value: orders.length,           border: "border-t-amber",      sub: `${statusCount.pending || 0} pending` },
          { label: "PRODUCTS",      value: products.length,         border: "border-t-purple-500", sub: `${lowStock} low · ${outStock} out` },
          { label: "DELIVERED",     value: statusCount.delivered || 0, border: "border-t-green-500", sub: "completed orders" },
        ].map(m => (
          <div key={m.label} className={`bg-white p-5 border-t-4 ${m.border} flex flex-col gap-1`}>
            <p className="text-[9px] font-bold tracking-[2.5px] text-ink/40 font-body">{m.label}</p>
            <p className="font-serif italic text-3xl">{m.value}</p>
            <p className="text-[10px] text-sand font-body">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders bar chart */}
        <div className="bg-white p-6 flex flex-col gap-4">
          <h3 className="text-[10px] font-bold tracking-[3px] uppercase pb-3 border-b border-sand font-body">Recent Orders</h3>
          {loading ? (
            <div className="flex items-center gap-2 h-32">
              <div className="w-4 h-4 border-2 border-sand border-t-ink rounded-full animate-spin" />
              <span className="text-[10px] text-sand font-body">Loading...</span>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-[12px] text-sand font-body py-8">No orders yet.</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {orders.slice(0, 8).map(o => (
                <div key={o._id || o.id} className="flex-1 flex flex-col items-center gap-1.5 h-full" title={`${o.id} — ${fmt(o.total)}`}>
                  <div className="flex-1 w-full bg-cream flex items-end">
                    <div className="w-full bg-brand transition-all" style={{ height: `${(o.total / maxTotal) * 100}%`, minHeight: 2 }} />
                  </div>
                  <span className="text-[8px] font-bold text-sand font-body truncate w-full text-center">
                    {(o.id || "").replace("PA-", "").slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white p-6 flex flex-col gap-4">
          <h3 className="text-[10px] font-bold tracking-[3px] uppercase pb-3 border-b border-sand font-body">Order Status</h3>
          {Object.keys(statusCount).length === 0 ? (
            <p className="text-[12px] text-sand font-body py-4">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {["pending", "shipped", "delivered", "cancelled"].map(s => {
                const n     = statusCount[s] || 0;
                const color = s === "delivered" ? "bg-green-500" : s === "shipped" ? "bg-brand" : s === "pending" ? "bg-gold" : "bg-red-500";
                const dot   = s === "delivered" ? "bg-green-500" : s === "shipped" ? "bg-brand" : s === "pending" ? "bg-gold" : "bg-red-500";
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <span className="text-[10px] font-bold tracking-[1.5px] uppercase w-20 font-body">{s}</span>
                    <div className="flex-1 h-1.5 bg-cream overflow-hidden rounded-full">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: orders.length ? `${(n / orders.length) * 100}%` : "0%" }} />
                    </div>
                    <span className="text-[13px] font-bold w-4 text-right font-body">{n}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stock alerts */}
      {(lowStock > 0 || outStock > 0) && (
        <div className="bg-white p-5 border-l-4 border-amber flex flex-col gap-3">
          <p className="text-[10px] font-bold tracking-[3px] uppercase font-body text-amber">⚠ Stock Alerts</p>
          <div className="flex flex-col gap-2">
            {products.filter(p => p.stock !== "in").map(p => (
              <div key={p._id || p.id} className="flex items-center gap-3">
                <img src={p.img} alt={p.title} className="w-8 h-10 object-cover bg-cream shrink-0" />
                <span className="text-[12px] font-body flex-1">{p.title}</span>
                <span className={`text-[9px] font-bold tracking-[1.5px] uppercase border px-2 py-0.5 font-body ${p.stock === "out" ? "text-red-500 border-red-500" : "text-amber border-amber"}`}>
                  {p.stock === "out" ? "OUT" : `LOW (${p.quantity})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
