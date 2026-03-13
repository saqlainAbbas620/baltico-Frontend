import { useState, useEffect, useCallback } from "react";
import { useStore } from "../../context/store";
import { fmt, finalPrice, stockFromQty } from "../../data/utils";
import { apiCreateProduct, apiUpdateProduct, apiDeleteProduct, apiGetProducts } from "../../api";
import { MdEdit, MdDelete } from "react-icons/md";
import ImagePicker from "../../components/ui/ImagePicker";

const BLANK = {
  title: "", cat: "women", price: "", disc: "0", quantity: "100",
  sizes: "XS,S,M,L,XL", img: "", imgPublicId: null,
  img2: "", img2PublicId: null, desc: "",
};

// ── Stable FormInput (outside Products to avoid cursor-jump) ──────────────────
function FormInput({ label, value, onChange, placeholder, type = "text", span2 = false }) {
  return (
    <div className={`flex flex-col gap-1.5 ${span2 ? "md:col-span-2" : ""}`}>
      <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="border-0 border-b border-sand bg-transparent py-2.5 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
    </div>
  );
}

function ProductForm({ initial = BLANK, onSave, onCancel, saving, isEdit }) {
  const [f, setF] = useState(initial);
  const set = useCallback((k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value })), []);

  const qtyNum       = parseInt(f.quantity, 10);
  const stockPreview = isNaN(qtyNum) ? "in" : stockFromQty(qtyNum);
  const stockColor   = stockPreview === "out" ? "text-red-500" : stockPreview === "low" ? "text-amber-500" : "text-green-600";
  const stockLabel   = stockPreview === "out" ? "OUT OF STOCK" : stockPreview === "low" ? "LOW STOCK (< 10)" : "IN STOCK";

  return (
    <div className={`bg-white p-6 flex flex-col gap-5 border-t-4 ${isEdit ? "border-amber" : "border-brand"}`}>
      <h3 className="text-[10px] font-bold tracking-[3px] uppercase pb-3 border-b border-sand font-body">
        {isEdit ? "✏️ Edit Product" : "New Product"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput label="TITLE *"            value={f.title}    onChange={set("title")}    placeholder="Product title" span2 />
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">CATEGORY</label>
          <select value={f.cat} onChange={set("cat")} className="border-0 border-b border-sand bg-transparent py-2.5 text-sm focus:outline-none focus:border-ink font-body">
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="children">Children</option>
          </select>
        </div>
        <FormInput label="PRICE (£) *"        value={f.price}    onChange={set("price")}    placeholder="295"          type="number" />
        <FormInput label="DISCOUNT %"         value={f.disc}     onChange={set("disc")}     placeholder="0"            type="number" />
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">QUANTITY IN STOCK</label>
          <input type="number" value={f.quantity} onChange={set("quantity")} placeholder="100" min="0"
            className="border-0 border-b border-sand bg-transparent py-2.5 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
          <span className={`text-[9px] font-bold tracking-[1.5px] font-body ${stockColor}`}>→ {stockLabel}</span>
        </div>
        <FormInput label="SIZES (comma sep)"  value={f.sizes}    onChange={set("sizes")}    placeholder="XS,S,M,L,XL" span2 />
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">DESCRIPTION</label>
          <textarea value={f.desc} onChange={set("desc")} placeholder="Product description..." rows={2}
            className="border-0 border-b border-sand bg-transparent py-2.5 text-sm focus:outline-none focus:border-ink resize-none font-body placeholder-sand/70" />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-sand/50">
          <ImagePicker label="MAIN IMAGE *"  value={f.img}  publicId={f.imgPublicId}
            onChange={(url, pid) => setF(prev => ({ ...prev, img: url,  imgPublicId: pid }))}
            onClear={() => setF(prev => ({ ...prev, img: "",  imgPublicId: null }))} />
          <ImagePicker label="HOVER IMAGE"   value={f.img2} publicId={f.img2PublicId}
            onChange={(url, pid) => setF(prev => ({ ...prev, img2: url, img2PublicId: pid }))}
            onClear={() => setF(prev => ({ ...prev, img2: "", img2PublicId: null }))} optional />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={() => onSave(f)} disabled={saving}
          className="bg-ink text-white text-[10px] font-bold tracking-[3px] uppercase px-8 py-3 hover:opacity-70 disabled:opacity-40 font-body">
          {saving ? "SAVING..." : isEdit ? "SAVE CHANGES" : "ADD PRODUCT"}
        </button>
        <button onClick={onCancel}
          className="border border-sand text-[10px] font-bold tracking-[3px] uppercase px-6 py-3 hover:border-ink transition-colors font-body">
          CANCEL
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ product, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white p-8 max-w-sm w-full mx-4 flex flex-col gap-5">
        <p className="text-[10px] font-bold tracking-[3px] uppercase text-red-500 font-body">DELETE PRODUCT</p>
        <p className="text-[14px] font-medium font-body">Delete <strong>{product.title}</strong>?</p>
        <p className="text-[12px] text-sand font-body">This will also remove its Cloudinary images.</p>
        <div className="flex gap-3 pt-2 border-t border-sand">
          <button onClick={onConfirm} disabled={loading}
            className="bg-red-600 text-white text-[10px] font-bold tracking-[2px] uppercase px-6 py-3 hover:opacity-70 disabled:opacity-40 font-body">
            {loading ? "DELETING..." : "YES, DELETE"}
          </button>
          <button onClick={onCancel}
            className="border border-sand text-[10px] font-bold tracking-[2px] uppercase px-6 py-3 hover:border-ink transition-colors font-body">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { products, addProduct, removeProduct, updateProduct, setProducts, notify } = useStore();
  const [mode,         setMode]         = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);

  // Fetch latest products from API on mount
  useEffect(() => {
    apiGetProducts()
      .then(res => {
        const f = res.data?.data?.products;
        if (f?.length) setProducts(f.map(p => ({ ...p, id: p._id || p.id })));
      })
      .catch(() => {}); // silently keep seed/store products on API failure
  }, []);

  async function handleAdd(f) {
    if (!f.title.trim()) { notify("Product title is required", true); return; }
    if (!f.price)        { notify("Product price is required", true);  return; }

    const payload = {
      title:    f.title.trim(),
      cat:      f.cat,
      price:    +f.price,
      disc:     +f.disc || 0,
      quantity: +f.quantity || 100,
      sizes:    typeof f.sizes === "string" ? f.sizes.split(",").map(s => s.trim()).filter(Boolean) : f.sizes,
      img:      f.img || "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600",
      imgPublicId:  f.imgPublicId  || null,
      img2:         f.img2 || null,
      img2PublicId: f.img2PublicId || null,
      desc:     f.desc || "",
    };

    setSaving(true);
    try {
      const res     = await apiCreateProduct(payload);
      const created = res.data?.data?.product;
      addProduct({ ...payload, ...(created || {}), id: created?._id || created?.id || Date.now() });
      setMode(null);
      notify("Product added successfully");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to add product", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(f) {
    if (!f.title.trim()) { notify("Product title is required", true); return; }
    if (!f.price)        { notify("Product price is required", true);  return; }

    const payload = {
      title:    f.title.trim(),
      cat:      f.cat,
      price:    +f.price,
      disc:     +f.disc || 0,
      quantity: +f.quantity || 0,
      sizes:    typeof f.sizes === "string" ? f.sizes.split(",").map(s => s.trim()).filter(Boolean) : f.sizes,
      img:      f.img || "",
      imgPublicId:  f.imgPublicId  || null,
      img2:         f.img2 || null,
      img2PublicId: f.img2PublicId || null,
      desc:     f.desc || "",
    };

    const tid = editTarget._id || editTarget.id;
    setSaving(true);
    try {
      const res     = await apiUpdateProduct(tid, payload);
      const updated = res.data?.data?.product;
      updateProduct(tid, updated || payload);
      setMode(null);
      setEditTarget(null);
      notify("Product updated successfully");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to update product", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const tid = deleteTarget._id || deleteTarget.id;
    try {
      await apiDeleteProduct(tid);
      removeProduct(tid);
      setDeleteTarget(null);
      notify("Product deleted");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to delete product", true);
      setDeleting(false);
    }
  }

  const safeEditInitial = editTarget ? {
    title:        editTarget.title,
    cat:          editTarget.cat,
    price:        String(editTarget.price),
    disc:         String(editTarget.disc || 0),
    quantity:     String(editTarget.quantity !== undefined ? editTarget.quantity : 100),
    sizes:        Array.isArray(editTarget.sizes) ? editTarget.sizes.join(",") : (editTarget.sizes || ""),
    img:          editTarget.img || "",
    imgPublicId:  editTarget.imgPublicId || null,
    img2:         editTarget.img2 || "",
    img2PublicId: editTarget.img2PublicId || null,
    desc:         editTarget.desc || "",
  } : BLANK;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif italic font-light text-4xl">
          Products <span className="text-sand text-2xl not-italic font-body font-normal">({products.length})</span>
        </h1>
        <button
          onClick={() => { setMode(mode === "add" ? null : "add"); setEditTarget(null); }}
          className={`text-[10px] font-bold tracking-[2px] uppercase px-5 py-2.5 font-body transition-all ${mode === "add" ? "border border-sand hover:border-ink" : "bg-ink text-white hover:opacity-70"}`}>
          {mode === "add" ? "✕ CANCEL" : "+ ADD PRODUCT"}
        </button>
      </div>

      {mode === "add" && (
        <ProductForm initial={BLANK} onSave={handleAdd} onCancel={() => setMode(null)} saving={saving} isEdit={false} />
      )}
      {mode === "edit" && editTarget && (
        <ProductForm
          key={editTarget._id || editTarget.id}
          initial={safeEditInitial}
          onSave={handleUpdate}
          onCancel={() => { setMode(null); setEditTarget(null); }}
          saving={saving} isEdit={true} />
      )}

      <div className="bg-white flex flex-col divide-y divide-sand">
        {products.length === 0 && <p className="px-5 py-8 text-[12px] text-sand font-body">No products yet.</p>}
        {products.map(p => {
          const pid = p._id || p.id;
          const sc  = p.stock === "low" ? "text-amber border-amber" : p.stock === "out" ? "text-red-500 border-red-500" : "text-green-500 border-green-500";
          const sl  = p.stock === "low" ? `LOW (${p.quantity ?? ""})` : p.stock === "out" ? "OUT" : "IN";
          return (
            <div key={pid} className={`flex items-center gap-4 px-4 py-3 transition-colors ${(editTarget?._id || editTarget?.id) === pid ? "bg-amber/5 border-l-2 border-amber" : "hover:bg-cream"}`}>
              <img src={p.img} alt={p.title} className="w-12 aspect-3/4 object-cover bg-cream shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium font-body truncate">{p.title}</p>
                <p className="text-[9px] tracking-[2px] uppercase text-sand font-body">{p.cat}</p>
              </div>
              <span className="text-[13px] font-semibold font-body hidden sm:block">{fmt(finalPrice(p))}</span>
              <span className={`text-[9px] font-bold tracking-[1.5px] uppercase border px-2 py-0.5 font-body hidden md:block ${sc}`}>{sl}</span>
              <button onClick={() => { setEditTarget(p); setMode("edit"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="flex items-center gap-1.5 text-[9px] font-bold tracking-[1.5px] uppercase border border-sand px-3 py-1.5 hover:border-ink hover:bg-ink hover:text-white transition-all font-body">
                <MdEdit size={12} /> EDIT
              </button>
              <button onClick={() => setDeleteTarget(p)}
                className="flex items-center gap-1.5 text-[9px] font-bold tracking-[1.5px] uppercase border border-red-200 text-red-500 px-3 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-body">
                <MdDelete size={12} /> DEL
              </button>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <DeleteModal product={deleteTarget} onConfirm={handleDelete} onCancel={() => { setDeleteTarget(null); setDeleting(false); }} loading={deleting} />
      )}
    </div>
  );
}
