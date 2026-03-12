import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/store";
import { HiOutlineShoppingBag, HiOutlineUser } from "react-icons/hi2";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const { cart, user } = useStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-sand">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 px-4 md:px-8">

          {/* Left — hamburger + desktop nav */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col gap-1.25 group p-1 -ml-1"
              aria-label="Open menu">
              <span className="block w-5 h-px bg-ink transition-transform group-hover:-translate-y-px" />
              <span className="block w-5 h-px bg-ink transition-transform group-hover:translate-y-px" />
            </button>
            <nav className="hidden md:flex gap-5">
              {[["women","WOMEN"],["men","MEN"],["children","KIDS"]].map(([cat, label]) => (
                <button key={cat}
                  onClick={() => navigate(`/category/${cat}`)}
                  className="text-[11px] font-semibold tracking-[2px] uppercase hover:opacity-40 transition-opacity font-body">
                  {label}
                </button>
              ))}
              <button onClick={() => navigate("/about")} className="text-[11px] font-semibold tracking-[2px] uppercase hover:opacity-40 transition-opacity font-body">About</button>
              <button onClick={() => navigate("/category/sale")} className="text-[11px] font-semibold tracking-[2px] uppercase text-red-600 hover:opacity-40 transition-opacity font-body">Sale</button>
            </nav>
          </div>

          {/* Logo */}
          <button onClick={() => navigate("/")} className="font-display text-2xl hover:opacity-60 transition-opacity">BaltiCo</button>

          {/* Right */}
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <button onClick={() => navigate(user ? "/profile" : "/auth")} className="hover:opacity-40 transition-opacity p-1">
              <HiOutlineUser size={20} strokeWidth={1.5} />
            </button>
            <button onClick={() => navigate("/cart")} className="relative hover:opacity-40 transition-opacity p-1">
              <HiOutlineShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-ink text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-body">{count}</span>
              )}
            </button>
            {user?.isAdmin && (
              <button onClick={() => navigate("/admin")} className="hidden sm:block bg-ink text-gold text-[9px] font-bold tracking-[2px] px-2.5 py-1 font-body hover:opacity-80">ADMIN</button>
            )}
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}
