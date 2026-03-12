import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiGetProducts, apiCreateOrder, apiGetCategoryImages } from "../api";
import { SEED_PRODUCTS, SEED_BANNER, SEED_CATEGORY_IMAGES } from "../data/seed";
import { stockFromQty } from "../data/utils";

// ─── Context ───────────────────────────────────────────────────────────────────
const Store = createContext(null);

export function StoreProvider({ children }) {
  // ── Persist user + cart in localStorage ───────────────────────────────────
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("baltico_user"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [cart, setCart] = useState(() => {
    try { const s = localStorage.getItem("baltico_cart"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  useEffect(() => {
    if (user) localStorage.setItem("baltico_user", JSON.stringify(user));
    else      localStorage.removeItem("baltico_user");
  }, [user]);
  useEffect(() => {
    localStorage.setItem("baltico_cart", JSON.stringify(cart));
  }, [cart]);

  // ── Products — fetched from API, fallback to seed ─────────────────────────
  const [products,        setProducts]        = useState(SEED_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    apiGetProducts()
      .then(res => {
        const fetched = res.data?.data?.products;
        if (fetched?.length) setProducts(fetched.map(p => ({ ...p, id: p._id || p.id })));
        else setProducts(SEED_PRODUCTS);
      })
      .catch(() => setProducts(SEED_PRODUCTS))
      .finally(() => setProductsLoading(false));
  }, []);

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);

  // ── CMS ───────────────────────────────────────────────────────────────────
  const [banner,         setBanner]         = useState(SEED_BANNER);
  const [categoryImages, setCategoryImages] = useState(SEED_CATEGORY_IMAGES);

  useEffect(() => {
    apiGetCategoryImages()
      .then(res => {
        const cats = res.data?.data?.categories;
        if (cats) setCategoryImages(prev => ({
          women:    cats.women?.url    || prev.women,
          men:      cats.men?.url      || prev.men,
          children: cats.children?.url || prev.children,
        }));
      })
      .catch(() => {});
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────
  function notify(msg, err = false) {
    if (err) toast.error(msg);
    else     toast.success(msg);
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  function addToCart(item) {
    setCart(prev => {
      const key    = `${item.id}-${item.size}`;
      const exists = prev.find(i => `${i.id}-${i.size}` === key);
      if (exists) return prev.map(i => `${i.id}-${i.size}` === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    notify("Added to cart");
  }
  function removeFromCart(id, size) {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
  }
  function updateQty(id, size, qty) {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id === id && i.size === size ? { ...i, qty } : i));
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  function login(name, email, isAdmin = false, extra = {}) {
    setUser({
      name, email,
      isAdmin: isAdmin || email === "admin@baltico.com",
      address: extra.address || "",
      phone:   extra.phone   || "",
      avatar:  extra.avatar  || "",
      id:      extra.id      || null,
    });
  }
  function logout() {
    import("../api").then(({ apiLogout }) => apiLogout().catch(() => {}));
    setUser(null);
    setCart([]);
    localStorage.removeItem("baltico_token");
    localStorage.removeItem("baltico_user");
    localStorage.removeItem("baltico_cart");
  }

  // ── Place order ───────────────────────────────────────────────────────────
  async function placeOrder(addr, phone, cartItems) {
    const items = cartItems || cart;
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);

    const res = await apiCreateOrder({
      items: items.map(i => ({
        productId: String(i._id || i.id),
        title: i.title,
        price: i.price,
        qty:   i.qty,
        size:  i.size,
        img:   i.img || "",
      })),
      total, addr, phone: phone || "", payment: "cod",
    });

    const apiOrder = res.data?.data?.order;
    const order = {
      id:        apiOrder?.id || apiOrder?.orderId || ("PA-" + Date.now().toString(36).toUpperCase()),
      _id:       apiOrder?._id,
      user:      user?.email,
      userName:  user?.name || "",
      userPhone: phone || "",
      items:     [...items],
      total,
      status:    apiOrder?.status || "pending",
      date:      apiOrder?.date   || new Date().toISOString().split("T")[0],
      addr,
      phone:     phone || "",
    };

    // Decrease local product quantities
    setProducts(prev => prev.map(p => {
      const pid     = String(p._id || p.id);
      const ordered = items.find(i => String(i._id || i.id) === pid);
      if (!ordered) return p;
      const newQty = Math.max(0, (p.quantity ?? 100) - ordered.qty);
      return { ...p, quantity: newQty, stock: stockFromQty(newQty) };
    }));

    setOrders(prev => [order, ...prev]);
    setCart([]);
    window.dispatchEvent(new CustomEvent("baltico:new-order", { detail: order }));
    return order;
  }

  // ── Admin: products ───────────────────────────────────────────────────────
  function addProduct(p) {
    const qty = p.quantity !== undefined ? +p.quantity : 100;
    setProducts(prev => [{
      ...p,
      id:        p._id || p.id || Date.now(),
      quantity:  qty,
      stock:     stockFromQty(qty),
      createdAt: p.createdAt || new Date().toISOString(),
    }, ...prev]);
    notify("Product added");
  }
  function removeProduct(id) {
    setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
    notify("Product removed");
  }
  function updateProduct(id, data) {
    setProducts(prev => prev.map(p => {
      if ((p._id || p.id) !== id) return p;
      const qty = data.quantity !== undefined ? +data.quantity : p.quantity;
      return { ...p, ...data, quantity: qty, stock: stockFromQty(qty) };
    }));
    notify("Product updated");
  }

  // ── Admin: orders ─────────────────────────────────────────────────────────
  function updateOrderStatus(id, status) {
    setOrders(prev => prev.map(o => (o._id === id || o.id === id) ? { ...o, status } : o));
    notify("Order updated");
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  function updateProfile(data) {
    setUser(prev => ({ ...prev, ...data }));
    notify("Profile saved");
  }

  return (
    <Store.Provider value={{
      user, cart, products, productsLoading, orders, banner, categoryImages,
      notify, addToCart, removeFromCart, updateQty,
      login, logout, placeOrder,
      addProduct, removeProduct, updateProduct, updateOrderStatus, updateProfile,
      setBanner, setCategoryImages, setProducts, setOrders,
    }}>
      {children}
    </Store.Provider>
  );
}

export function useStore() { return useContext(Store); }
