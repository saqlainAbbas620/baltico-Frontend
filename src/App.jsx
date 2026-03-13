import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { StoreProvider, useStore } from "./context/store";
import { getToken } from "./api/axiosInstance";
import Navbar      from "./components/layout/Navbar";
import Footer      from "./components/layout/Footer";
import Toast       from "./components/ui/Toast";
import HomePage        from "./pages/HomePage";
import CategoryPage    from "./pages/CategoryPage";
import ProductPage     from "./pages/ProductPage";
import AllProductsPage from "./pages/AllProductsPage";
import CartPage        from "./pages/CartPage";
import CheckoutPage    from "./pages/CheckoutPage";
import AuthPage        from "./pages/AuthPage";
import ProfilePage     from "./pages/ProfilePage";
import AboutPage       from "./pages/AboutPage";
import AdminPage       from "./pages/admin/AdminPage";

const NO_FOOTER = ["/admin", "/checkout", "/auth"];

// ── Email verification redirect handler ──────────────────────────────────────
function VerifyRedirectHandler() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const error = params.get("error");
    if (error) {
      window.history.replaceState({}, "", location.pathname);
      toast.error(decodeURIComponent(error));
      navigate("/auth", { replace: true });
      return;
    }

    if (params.get("verified") !== "true") return;

    const token   = params.get("token");
    const name    = decodeURIComponent(params.get("name")  || "");
    const email   = decodeURIComponent(params.get("email") || "");
    const isAdmin = params.get("isAdmin") === "true";
    const id      = params.get("id") || null;

    window.history.replaceState({}, "", location.pathname);

    if (!token || !email) {
      toast.error("Verification link is invalid. Please request a new one.");
      navigate("/auth", { replace: true });
      return;
    }

    localStorage.setItem("baltico_token", token);
    login(name, email, isAdmin, { id });
    toast.success("✅ Email verified! Welcome to Baltico.");
    navigate("/", { replace: true });
  }, []); // eslint-disable-line

  return null;
}

// ── Session expiry handler ────────────────────────────────────────────────────
// Called by the axios interceptor when BOTH access token and refresh cookie fail.
// Must call clearSession() from store so React state is updated immediately —
// just removing localStorage keys does NOT update the user state in memory.
function SessionHandler() {
  const navigate      = useNavigate();
  const { clearSession } = useStore();

  useEffect(() => {
    function handleExpired() {
      clearSession();
      toast.error("Session expired. Please sign in again.");
      navigate("/auth", { replace: true });
    }
    window.addEventListener("baltico:session-expired", handleExpired);
    return () => window.removeEventListener("baltico:session-expired", handleExpired);
  }, [clearSession, navigate]);

  return null;
}

// ── Route guards ──────────────────────────────────────────────────────────────
// sessionChecked: wait for the mount-time /auth/me validation to complete before
// rendering protected routes — prevents a flash of protected content on expired sessions.
function RequireAuth({ children }) {
  const { user, sessionChecked } = useStore();

  // Still validating — render nothing so the page doesn't flash
  if (!sessionChecked) return null;

  // Must have both a React user state AND a stored token
  const hasToken = Boolean(getToken());
  return (user && hasToken) ? children : <Navigate to="/auth" replace />;
}

function RequireAdmin({ children }) {
  const { user, sessionChecked } = useStore();

  if (!sessionChecked) return null;

  const hasToken = Boolean(getToken());
  if (!user || !hasToken) return <Navigate to="/auth" replace />;
  if (!user.isAdmin)       return <Navigate to="/"    replace />;
  return children;
}

// ── Layout ────────────────────────────────────────────────────────────────────
function Layout() {
  const location = useLocation();
  const hideFooter = NO_FOOTER.some(p => location.pathname.startsWith(p));

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                element={<HomePage />} />
          <Route path="/category/:cat"   element={<CategoryPage />} />
          <Route path="/product/:id"     element={<ProductPage />} />
          <Route path="/products"        element={<AllProductsPage />} />
          <Route path="/cart"            element={<CartPage />} />
          <Route path="/about"           element={<AboutPage />} />
          <Route path="/auth"            element={<AuthPage />} />
          <Route path="/checkout"        element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/profile"         element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/admin"           element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <Toast />
      <VerifyRedirectHandler />
      <SessionHandler />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Layout />
      </StoreProvider>
    </BrowserRouter>
  );
}
