import { useState, useEffect } from "react";
import { useStore } from "../../context/store";
import { fmt, statusStyle } from "../../data/utils";
import { apiGetAllOrders, apiUpdateOrderStatus } from "../../api";

function OrderDetailModal({ order, onClose, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand sticky top-0 bg-white z-10">
          <div>
            <p className="text-[9px] font-bold tracking-[3px] uppercase text-sand font-body">Order Details</p>
            <p className="font-serif italic text-2xl mt-0.5">{order.id || order.orderId}</p>
          </div>
          <button onClick={onClose} className="text-sand hover:text-ink text-xl font-light transition-colors">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Customer */}
          <div className="flex flex-col gap-3 p-4 bg-cream">
            <p className="text-[9px] font-bold tracking-[3px] uppercase text-ink/50 font-body">Customer</p>
            <div className="grid grid-cols-[100px_1fr] gap-y-2 text-[12px] font-body">
              <span className="text-sand">Name</span>      <span className="font-medium">{order.userName || "—"}</span>
              <span className="text-sand">Email</span>     <span>{typeof order.user === "string" ? order.user : order.user?.email || "—"}</span>
              <span className="text-sand">Phone</span>     <span>{order.userPhone || order.phone || "—"}</span>
              <span className="text-sand">Delivery</span>  <span>{order.addr}</span>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-bold tracking-[3px] uppercase text-ink/50 font-body">Items Ordered</p>
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-sand pb-3 last:border-0">
                {item.img && <img src={item.img} alt={item.title} className="w-10 h-12 object-cover bg-cream shrink-0" />}
                <div className="flex-1">
                  <p className="text-[13px] font-medium font-body">{item.title}</p>
                  <p className="text-[11px] text-sand font-body">Size: {item.size} &nbsp;·&nbsp; Qty: {item.qty}</p>
                </div>
                <span className="text-[13px] font-semibold font-body">{fmt(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-bold tracking-[2px] uppercase font-body">Total</span>
              <span className="text-xl font-semibold font-body">{fmt(order.total)}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-[11px] font-body">
            <div className="p-3 bg-cream flex flex-col gap-1">
              <span className="text-[9px] font-bold tracking-[2px] uppercase text-ink/40">Date</span>
              <span className="font-medium">{order.date?.toString().slice(0, 10)}</span>
            </div>
            <div className="p-3 bg-cream flex flex-col gap-1">
              <span className="text-[9px] font-bold tracking-[2px] uppercase text-ink/40">Payment</span>
              <span className="font-medium">Cash on Delivery</span>
            </div>
          </div>

          {/* Status update */}
          <div className="flex flex-col gap-2 pt-2 border-t border-sand">
            <p className="text-[9px] font-bold tracking-[3px] uppercase text-ink/50 font-body">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {["pending", "shipped", "delivered", "cancelled"].map(s => (
                <button key={s} onClick={() => onStatusChange(order._id || order.id, s)}
                  className={`text-[9px] font-bold tracking-[1.5px] uppercase px-4 py-2.5 border transition-all font-body ${order.status === s ? "bg-ink text-white border-ink" : "border-sand text-sand hover:border-ink hover:text-ink"}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { orders: localOrders } = useStore();
  const [orders,         setOrders]        = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [selected,       setSelected]      = useState(null);
  const [newOrderBadge,  setNewOrderBadge] = useState(false);

  function load() {
    setLoading(true);
    apiGetAllOrders()
      .then(res => { const f = res.data?.data?.orders || []; setOrders(f.length ? f : localOrders); })
      .catch(() => setOrders(localOrders))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const handler = () => { setNewOrderBadge(true); setTimeout(load, 1000); };
    window.addEventListener("baltico:new-order", handler);
    return () => window.removeEventListener("baltico:new-order", handler);
  }, []);

  async function changeStatus(id, status) {
    try { await apiUpdateOrderStatus(id, status); } catch {}
    setOrders(prev => prev.map(o => (o._id === id || o.id === id) ? { ...o, status } : o));
    if (selected && (selected._id === id || selected.id === id)) {
      setSelected(prev => ({ ...prev, status }));
    }
  }

  if (loading) return (
    <div className="flex items-center gap-3 py-12 px-4">
      <div className="w-4 h-4 border-2 border-sand border-t-ink rounded-full animate-spin" />
      <span className="text-[11px] tracking-[2px] uppercase text-sand font-body">Loading orders...</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif italic font-light text-4xl">Orders</h1>
          <span className="text-sand text-2xl not-italic font-body font-normal">({orders.length})</span>
          {newOrderBadge && (
            <span className="bg-green-500 text-white text-[8px] font-bold tracking-[1.5px] uppercase px-2 py-1 animate-pulse font-body">
              NEW ORDER!
            </span>
          )}
        </div>
        <button onClick={() => { load(); setNewOrderBadge(false); }}
          className="text-[10px] font-bold tracking-[2px] uppercase px-5 py-2.5 border border-sand hover:border-ink font-body transition-colors">
          ↺ REFRESH
        </button>
      </div>

      <div className="bg-white">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-[90px_1fr_1.5fr_2fr_70px_90px_110px] gap-3 px-5 py-3 bg-ink text-white text-[9px] font-bold tracking-[2px] uppercase font-body">
          {["Order", "Customer", "Contact", "Items", "Total", "Date", "Status"].map(h => <span key={h}>{h}</span>)}
        </div>

        {orders.length === 0 && <p className="px-5 py-8 text-[12px] text-sand font-body">No orders yet.</p>}

        {orders.map(o => {
          const oid = o._id || o.id;
          return (
            <div key={oid}>
              {/* Desktop row */}
              <div
                className="hidden md:grid grid-cols-[90px_1fr_1.5fr_2fr_70px_90px_110px] gap-3 px-5 py-4 border-b border-sand items-center hover:bg-cream transition-colors cursor-pointer"
                onClick={() => setSelected(o)}>
                <span className="text-[11px] font-bold font-body text-brand">{o.id || o.orderId}</span>
                <div>
                  <p className="text-[11px] font-medium font-body truncate">{o.userName || "—"}</p>
                  <p className="text-[10px] text-ink/50 truncate font-body">{typeof o.user === "string" ? o.user : o.user?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-sand font-body truncate">{o.userPhone || o.phone || "—"}</p>
                  <p className="text-[10px] text-sand font-body truncate">{o.addr?.slice(0, 30)}{o.addr?.length > 30 ? "…" : ""}</p>
                </div>
                <span className="text-[10px] text-sand truncate font-body">{o.items?.map(i => `${i.title}×${i.qty}`).join(", ")}</span>
                <span className="text-[13px] font-semibold font-body">{fmt(o.total)}</span>
                <span className="text-[10px] text-sand font-body">{o.date?.toString().slice(0, 10)}</span>
                <select value={o.status}
                  onClick={e => e.stopPropagation()}
                  onChange={e => { e.stopPropagation(); changeStatus(oid, e.target.value); }}
                  className={`border bg-transparent text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-1.5 focus:outline-none appearance-none cursor-pointer font-body ${statusStyle(o.status)}`}>
                  {["pending", "shipped", "delivered", "cancelled"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Mobile row */}
              <div className="md:hidden p-5 border-b border-sand flex flex-col gap-2 cursor-pointer hover:bg-cream" onClick={() => setSelected(o)}>
                <div className="flex justify-between">
                  <span className="text-[12px] font-bold font-body text-brand">{o.id || o.orderId}</span>
                  <span className="text-[11px] text-sand font-body">{o.date?.toString().slice(0, 10)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium font-body">{o.userName || (typeof o.user === "string" ? o.user : "")}</span>
                  {o.userPhone && <span className="text-[10px] text-sand font-body">· {o.userPhone}</span>}
                </div>
                <p className="text-[11px] text-sand truncate font-body">{o.items?.map(i => i.title).join(", ")}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-semibold font-body">{fmt(o.total)}</span>
                  <select value={o.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => { e.stopPropagation(); changeStatus(oid, e.target.value); }}
                    className={`border bg-transparent text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-1.5 focus:outline-none appearance-none cursor-pointer font-body ${statusStyle(o.status)}`}>
                    {["pending", "shipped", "delivered", "cancelled"].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} onStatusChange={changeStatus} />
      )}
    </div>
  );
}
