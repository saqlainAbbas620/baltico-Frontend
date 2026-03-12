import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/store";
import { MdDashboard, MdInventory2, MdImage, MdLocalShipping } from "react-icons/md";
import { IoArrowBackOutline } from "react-icons/io5";
import Dashboard from "./Dashboard";
import Products  from "./Products";
import BannerCMS from "./BannerCMS";
import Orders    from "./Orders";

const TABS = [
  { id: "dashboard", label: "Dashboard", short: "Dash",   Icon: MdDashboard   },
  { id: "products",  label: "Products",  short: "Items",  Icon: MdInventory2  },
  { id: "cms",       label: "CMS",       short: "CMS",    Icon: MdImage       },
  { id: "orders",    label: "Orders",    short: "Orders", Icon: MdLocalShipping },
];

export default function AdminPage() {
  const { user }   = useStore();
  const navigate   = useNavigate();
  const [tab, setTab]             = useState("dashboard");
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    const handler = () => setNewOrderAlert(true);
    window.addEventListener("BaltiCo:new-order", handler);
    return () => window.removeEventListener("BaltiCo:new-order", handler);
  }, []);

  if (!user?.isAdmin) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-[13px] font-bold tracking-[4px] font-body">ACCESS DENIED</p>
      <button onClick={() => navigate("/")} className="bg-ink text-white text-[10px] font-bold tracking-[3px] uppercase px-8 py-3 hover:opacity-70 font-body">
        RETURN HOME
      </button>
    </div>
  );

  const tabsWithBadge = TABS.map(t => ({
    ...t,
    badge: t.id === "orders" && newOrderAlert,
  }));

  function selectTab(id) {
    setTab(id);
    if (id === "orders") setNewOrderAlert(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col lg:grid lg:grid-cols-[220px_1fr]">

      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden lg:flex bg-ink text-white flex-col sticky top-14 h-[calc(100vh-56px)]">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="font-display text-2xl mb-0.5">BaltiCo</div>
          <p className="text-[9px] font-bold tracking-[3px] text-gold font-body">ADMIN CONSOLE</p>
        </div>
        <nav className="flex-1 py-3 px-2.5 flex flex-col gap-0.5">
          {tabsWithBadge.map(({ id, label, Icon, badge }) => (
            <button key={id} onClick={() => selectTab(id)}
              className={`flex items-center gap-3 px-4 py-3 text-[11px] font-semibold tracking-[1.5px] uppercase text-left border-l-2 transition-all font-body ${tab === id ? "text-gold bg-gold/10 border-gold" : "text-white/50 border-transparent hover:text-white hover:bg-white/5"}`}>
              <Icon size={14} /> {label}
              {badge && <span className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-4 border-t border-white/10 text-[10px] font-semibold tracking-[2px] text-white/30 hover:text-white transition-colors font-body">
          <IoArrowBackOutline size={12} /> BACK TO STORE
        </button>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────────────── */}
      <div className="lg:hidden bg-ink text-white flex items-center justify-between px-4 py-3 sticky top-14 z-40">
        <div>
          <div className="font-display text-lg leading-none">BaltiCo</div>
          <p className="text-[8px] font-bold tracking-[2px] text-gold font-body">ADMIN</p>
        </div>
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[9px] font-bold tracking-[1.5px] text-white/50 hover:text-white font-body">
          <IoArrowBackOutline size={11} /> STORE
        </button>
      </div>

      {/* ── Mobile tab bar ────────────────────────────────────────────────── */}
      <div className="lg:hidden bg-white border-b border-sand flex sticky top-24 z-30">
        {tabsWithBadge.map(({ id, short, Icon, badge }) => (
          <button key={id} onClick={() => selectTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[8px] font-bold tracking-[1px] uppercase font-body transition-colors relative ${tab === id ? "text-ink border-b-2 border-ink" : "text-sand hover:text-ink"}`}>
            <Icon size={16} />
            {short}
            {badge && <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
          </button>
        ))}
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="bg-[#f7f7f5] p-4 sm:p-6 lg:p-7 flex-1 overflow-y-auto pb-8">
        {tab === "dashboard" && <Dashboard />}
        {tab === "products"  && <Products />}
        {tab === "cms"       && <BannerCMS />}
        {tab === "orders"    && <Orders />}
      </main>
    </div>
  );
}
