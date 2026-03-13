import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/store";
import { HiOutlineShoppingBag, HiOutlineUser } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import { FiChevronRight, FiSearch } from "react-icons/fi";

const NAV_LINKS = [
  { label: "NEW IN",  path: "/" },
  { label: "WOMEN",   path: "/category/women" },
  { label: "MEN",     path: "/category/men" },
  { label: "KIDS",    path: "/category/children" },
  { label: "ABOUT",   path: "/about" },
];

export default function MobileMenu({ onClose }) {
  const { cart, user, logout } = useStore();
  const navigate = useNavigate();
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const nav = (path) => { navigate(path); onClose(); };

  return (
    <div className="fixed inset-0 z-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute top-0 left-0 w-[85vw] max-w-90 h-full bg-white flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-sand shrink-0">
          {/* <span className="font-display text-xl">BaltiCo</span> */}
          <button onClick={() => navigate("/")} className="font-display text-xl">BaltiCo</button>
          <div className="flex items-center gap-3">
            <button onClick={() => nav(user ? "/profile" : "/auth")} className="p-1">
              <HiOutlineUser size={18} />
            </button>
            <button onClick={() => nav("/cart")} className="relative p-1">
              <HiOutlineShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-ink text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button onClick={onClose} className="p-1">
              <RxCross2 size={18} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-sand text-gray-400 shrink-0">
          <FiSearch size={14} />
          <input
            className="flex-1 bg-transparent text-sm placeholder-gray-400 focus:outline-none font-body"
            placeholder="Search"
          />
        </div>

        {/* Nav links */}
        <nav className="flex flex-col flex-1 overflow-y-auto">
          {NAV_LINKS.map(({ label, path }) => (
            <button key={label} onClick={() => nav(path)}
              className="flex items-center justify-between px-5 py-5 border-b border-sand text-[13px] font-semibold tracking-[2.5px] hover:bg-cream transition-colors text-left font-body">
              {label}
              <FiChevronRight className="text-gray-300 shrink-0" size={14} />
            </button>
          ))}
          <button onClick={() => nav("/category/sale")}
            className="flex items-center justify-between px-5 py-5 border-b border-sand text-[13px] font-semibold tracking-[2.5px] text-red-600 hover:bg-cream transition-colors font-body">
            SALE
            <FiChevronRight className="text-red-300" size={14} />
          </button>
          {user?.isAdmin && (
            <button onClick={() => nav("/admin")}
              className="flex items-center justify-between px-5 py-5 border-b border-sand text-[13px] font-semibold tracking-[2.5px] text-gold hover:bg-cream transition-colors font-body">
              ADMIN PANEL
              <FiChevronRight className="text-yellow-300" size={14} />
            </button>
          )}
        </nav>

        {/* Footer */}
        <div className="px-5 py-5 border-t border-sand shrink-0">
          {user ? (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-sand font-body tracking-[1px]">
                SIGNED IN AS {user.name?.toUpperCase()}
              </p>
              <button
                onClick={() => { logout(); onClose(); navigate("/"); }}
                className="flex items-center gap-2 text-[11px] font-semibold tracking-[2px] uppercase hover:opacity-50 font-body">
                <HiOutlineUser size={15} /> LOG OUT
              </button>
            </div>
          ) : (
            <button onClick={() => nav("/auth")}
              className="flex items-center gap-2 text-[11px] font-semibold tracking-[2px] uppercase hover:opacity-50 font-body">
              <HiOutlineUser size={15} /> LOG IN / REGISTER
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
