import { useNavigate } from "react-router-dom";

const LINKS = [
  { title: "Shop", links: [["Women","/category/women"],["Men","/category/men"],["Kids","/category/children"]] },
  { title: "Info", links: [["About","/about"],["Careers",null],["Sustainability",null]] },
  { title: "Help", links: [["Shipping",null],["Returns",null],["Contact",null]] },
];

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-ink text-white mt-12 sm:mt-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-8 sm:gap-12 pb-8 sm:pb-10 border-b border-white/10 mb-5 sm:mb-6">
          <div>
            <button onClick={() => navigate("/")} className="font-display text-2xl sm:text-3xl hover:opacity-60 transition-opacity block mb-2">BaltiCo</button>
            <p className="text-[11px] tracking-[3px] uppercase text-white/40 font-body">Defining the culture.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {LINKS.map(col => (
              <div key={col.title}>
                <h4 className="text-[9px] sm:text-[10px] font-bold tracking-[3px] uppercase text-white/40 mb-2 sm:mb-3 font-body">{col.title}</h4>
                {col.links.map(([label, path]) => (
                  <button key={label}
                    onClick={() => path && navigate(path)}
                    className="block text-[12px] sm:text-[13px] text-white/60 hover:text-white transition-colors mb-1 sm:mb-1.5 font-body text-left">
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-[10px] sm:text-[11px] text-white/30 font-body">
          <span>© 2026 BaltiCo. All rights reserved.</span>
          <span className="text-gold/40" >Developed By: <a href="https://www.linkedin.com/in/saqlain-abbas-913a84258/" target="_blank">Saqlain Abbas</a></span>
        </div>
      </div>
    </footer>
  );
}
