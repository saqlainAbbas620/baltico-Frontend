import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/store";
import { fmt, statusStyle } from "../data/utils";
import { apiProfile, apiGetMyOrders } from "../api";

export default function ProfilePage() {
  const { user, orders: storeOrders, updateProfile, notify } = useStore();
  const navigate = useNavigate();
  const [addr,    setAddr]    = useState(user?.address || "");
  const [phone,   setPhone]   = useState(user?.phone || "");
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders,  setOrders]  = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  if (!user) { navigate("/auth"); return null; }

  async function fetchOrders() {
    setOrdersLoading(true);
    try {
      const res = await apiGetMyOrders();
      const apiOrders = res.data?.data?.orders || [];
      // Merge API orders with any local orders placed this session
      // (local orders have no _id yet if the API call somehow failed)
      const localOnly = storeOrders.filter(lo =>
        !apiOrders.some(ao => ao._id === lo._id || ao.id === lo.id)
      );
      setOrders([...apiOrders, ...localOnly]);
    } catch {
      // API down — show store's local orders so user always sees something
      setOrders(storeOrders.filter(o => o.user === user.email || o.user === user.id));
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    // Re-fetch when a new order is placed in this session
    window.addEventListener("lumiere:new-order", fetchOrders);
    return () => window.removeEventListener("lumiere:new-order", fetchOrders);
  }, []);

  async function save() {
    if (pass && pass !== confirm) { notify("Passwords don't match", true); return; }
    if (pass && pass.length < 6)  { notify("Password must be at least 6 characters", true); return; }
    setLoading(true);
    try {
      const res = await apiProfile({ address: addr, phone, ...(pass ? { password: pass } : {}) });
      const updated = res.data?.data?.user;
      updateProfile({ address: updated?.address ?? addr, phone: updated?.phone ?? phone });
      setPass(""); setConfirm("");
      notify("Profile saved");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to save profile", true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="mb-9">
        <h1 className="font-serif italic font-light text-4xl mb-1">My Account</h1>
        <p className="text-[12px] text-sand font-body">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

        {/* Profile form */}
        <div className="border border-sand p-7 flex flex-col gap-5">
          <h2 className="text-[10px] font-bold tracking-[3px] uppercase pb-4 border-b border-sand font-body">Profile</h2>
          <div className="flex flex-col gap-0">
            <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">SHIPPING ADDRESS</label>
            <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="Your full address" className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70 mb-4" />
            <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">PHONE</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44..." className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70 mb-4" />
            <div className="border-t border-sand pt-4 flex flex-col gap-0">
              <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">NEW PASSWORD</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Leave blank to keep current" className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70 mb-4" />
              <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">CONFIRM PASSWORD</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
            </div>
          </div>
          <button onClick={save} disabled={loading} className="bg-ink text-white text-[10px] font-bold tracking-[3px] uppercase py-4 hover:opacity-70 disabled:opacity-40 font-body mt-1">
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        {/* Orders */}
        <div className="border border-sand p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-4 border-b border-sand">
            <h2 className="text-[10px] font-bold tracking-[3px] uppercase font-body">Order History</h2>
            <button onClick={fetchOrders} className="text-[9px] font-bold tracking-[2px] uppercase text-sand hover:text-ink font-body transition-colors">
              ↺ Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-3 h-3 border-2 border-sand border-t-ink rounded-full animate-spin" />
              <span className="text-[11px] text-sand font-body">Loading orders...</span>
            </div>
          ) : !orders.length ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-[13px] text-sand font-body">No orders yet.</p>
              <button onClick={() => navigate("/")} className="text-[10px] font-bold tracking-[2px] uppercase border border-sand px-5 py-2.5 hover:border-ink transition-colors font-body">
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-sand">
              {orders.map(o => {
                const statusIcons = { pending:"🕐", shipped:"🚚", delivered:"✅", cancelled:"✕" };
                const statusColors = {
                  pending:   "text-yellow-600 bg-yellow-50  border-yellow-300",
                  shipped:   "text-blue-600   bg-blue-50    border-blue-300",
                  delivered: "text-green-600  bg-green-50   border-green-300",
                  cancelled: "text-red-500    bg-red-50     border-red-300",
                };
                return (
                  <div key={o.id || o._id} className="py-4 flex flex-col gap-3">
                    {/* Row 1: ID + date + status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[12px] font-bold tracking-wide font-body text-brand">{o.id || o.orderId}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-sand font-body">{o.date?.toString().slice(0,10)}</span>
                        <span className={`text-[9px] font-bold tracking-[1.5px] border px-2 py-0.5 uppercase font-body flex items-center gap-1 ${statusColors[o.status] || "text-sand border-sand"}`}>
                          {statusIcons[o.status]} {o.status}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Item thumbnails */}
                    {o.items?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {o.items.slice(0,4).map((item, idx) => (
                          <div key={idx} className="relative flex-shrink-0">
                            {item.img
                              ? <img src={item.img} alt={item.title} className="w-9 h-11 object-cover bg-cream" />
                              : <div className="w-9 h-11 bg-cream flex items-center justify-center text-[8px] text-sand font-body">IMG</div>
                            }
                            {item.qty > 1 && (
                              <span className="absolute -top-1 -right-1 bg-ink text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center font-body">{item.qty}</span>
                            )}
                          </div>
                        ))}
                        {o.items.length > 4 && (
                          <span className="text-[10px] text-sand font-body">+{o.items.length - 4} more</span>
                        )}
                      </div>
                    )}

                    {/* Row 3: item names + total */}
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-[10px] text-sand font-body truncate flex-1">
                        {o.items?.map(i => `${i.title} ×${i.qty}`).join(" · ")}
                      </p>
                      <span className="text-[15px] font-semibold font-body flex-shrink-0">{fmt(o.total)}</span>
                    </div>

                    {/* Delivery address */}
                    {o.addr && (
                      <p className="text-[10px] text-sand/80 font-body flex items-center gap-1">
                        <span>📍</span> {o.addr}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
