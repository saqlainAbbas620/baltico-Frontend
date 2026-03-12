import { IoCloseOutline } from "react-icons/io5";
import { useStore } from "../../context/store";
import { fmt } from "../../data/utils";

export default function CartItem({ item }) {
  const { removeFromCart, updateQty } = useStore();

  return (
    <div className="flex gap-3 sm:gap-4 py-4 sm:py-5 border-b border-sand">
      {/* Thumbnail */}
      <div className="w-20 sm:w-24 aspect-3/4 shrink-0 bg-cream overflow-hidden">
        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Top row */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-medium font-body leading-snug">{item.title}</p>
            <p className="text-[11px] uppercase tracking-wide text-sand font-body mt-0.5">
              Size: {item.size}
            </p>
            {/* Mobile price */}
            <p className="text-[14px] font-semibold font-body mt-1 sm:hidden">
              {fmt(item.price * item.qty)}
            </p>
          </div>
          <button
            onClick={() => removeFromCart(item.id, item.size)}
            className="text-sand hover:text-ink transition-colors shrink-0 p-0.5">
            <IoCloseOutline size={17} />
          </button>
        </div>

        {/* Bottom row — qty controls + desktop price */}
        <div className="flex items-center justify-between mt-2 sm:mt-0">
          <div className="flex items-center border border-sand">
            <button
              onClick={() => updateQty(item.id, item.size, item.qty - 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 text-base font-light hover:bg-cream transition-colors flex items-center justify-center">
              −
            </button>
            <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[12px] sm:text-[13px] font-medium border-l border-r border-sand font-body">
              {item.qty}
            </span>
            <button
              onClick={() => updateQty(item.id, item.size, item.qty + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 text-base font-light hover:bg-cream transition-colors flex items-center justify-center">
              +
            </button>
          </div>
          {/* Desktop price */}
          <span className="hidden sm:block text-[14px] font-semibold font-body">
            {fmt(item.price * item.qty)}
          </span>
        </div>
      </div>
    </div>
  );
}
