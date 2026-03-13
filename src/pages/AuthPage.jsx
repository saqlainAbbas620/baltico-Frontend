import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/store";
import { apiLogin, apiRegister, apiGoogleAuth, apiResendVerification } from "../api";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.9 6.1C12.6 13 17.9 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.2-10.1 7.2-17z"/>
      <path fill="#FBBC05" d="M10.7 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.2-6.2z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.3-4.1-13.2-9.7l-8.2 6.2C6.7 42.6 14.7 48 24 48z"/>
    </svg>
  );
}

function VerifyPending({ email, onBack }) {
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);
  const [error,     setError]     = useState("");

  async function resend() {
    setResending(true); setError("");
    try { await apiResendVerification(email); setResent(true); }
    catch (err) { setError(err.response?.data?.message || "Failed to resend. Try again."); }
    finally { setResending(false); }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-5 sm:px-8 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
        <div className="w-14 h-14 border-2 border-ink flex items-center justify-center text-2xl">✉</div>
        <div>
          <h2 className="font-serif italic font-light text-2xl sm:text-3xl mb-2">Check your inbox</h2>
          <p className="text-[13px] text-sand font-body leading-relaxed">We sent a verification link to</p>
          <p className="text-[14px] font-semibold font-body mt-1 break-all">{email}</p>
        </div>
        <div className="bg-cream border border-sand w-full p-4 sm:p-5 flex flex-col gap-2 text-left">
          {["Open the email from BaltiCo", 'Click the "VERIFY EMAIL" button', "You'll be automatically signed in"].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 bg-ink text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-body">{i+1}</span>
              <p className="text-[12px] font-body text-ink/70">{step}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-sand font-body">Link expires in 24 hours.</p>
        {resent ? (
          <p className="text-[11px] text-green-600 font-body font-semibold">✓ New verification email sent!</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] text-sand font-body">Didn't receive it?</p>
            <button onClick={resend} disabled={resending}
              className="text-[10px] font-bold tracking-[2px] uppercase border border-sand px-5 py-2.5 hover:border-ink transition-colors disabled:opacity-40 font-body">
              {resending ? "SENDING..." : "RESEND EMAIL"}
            </button>
          </div>
        )}
        {error && <p className="text-[11px] text-red-500 font-body">{error}</p>}
        <button onClick={onBack} className="text-[10px] text-sand hover:text-ink transition-colors font-body tracking-[1.5px] uppercase">← Back to sign in</button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { login, notify } = useStore();
  const navigate = useNavigate();
  const [mode,         setMode]         = useState("login");
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [pass,         setPass]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [pendingEmail, setPendingEmail] = useState(null);

  // ── Google One Tap ──────────────────────────────────────────────────────────
  const { signIn: googleSignIn, ready: googleReady, configured: googleConfigured } =
    useGoogleAuth(handleGoogleCallback);

  async function handleGoogleCallback(response) {
    // response is either { code } (oauth2 flow) or { credential } (legacy One Tap)
    // or { error } if user cancelled
    if (response.error === "cancelled") return; // user closed the popup
    if (response.error) { notify("Google sign-in failed", true); return; }

    const payload = response.code
      ? { code: response.code }
      : { credential: response.credential };

    if (!payload.code && !payload.credential) {
      notify("Google sign-in failed", true);
      return;
    }

    setError("");
    try {
      const res = await apiGoogleAuth(payload);
      const { token, user } = res.data.data;
      localStorage.setItem("baltico_token", token);
      login(user.name, user.email, user.isAdmin, { address: user.address, phone: user.phone, avatar: user.avatar, id: user.id });
      notify(`Welcome, ${user.name}!`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Google sign-in failed.";
      setError(msg); notify(msg, true);
    }
  }

  async function submit() {
    setError("");
    if (mode === "signup" && !name.trim()) { setError("Enter your name"); return; }
    if (!email.trim()) { setError("Enter your email"); return; }
    if (!pass)         { setError("Enter your password"); return; }
    setLoading(true);
    try {
      const res  = mode === "login" ? await apiLogin(email.trim(), pass) : await apiRegister(name.trim(), email.trim(), pass);
      const data = res.data.data;
      if (data?.requiresVerification) { setPendingEmail(data.email || email.trim()); setLoading(false); return; }
      const { token, user } = data;
      localStorage.setItem("baltico_token", token);
      login(user.name, user.email, user.isAdmin, { address: user.address, phone: user.phone, avatar: user.avatar, id: user.id });
      notify(`Welcome, ${user.name}!`); navigate("/");
    } catch (err) {
      if (!err.response) {
        const isAdmin = email.trim() === "admin@baltico.com";
        login(name || email.split("@")[0], email.trim(), isAdmin);
        notify("Signed in (demo mode)"); navigate("/");
      } else {
        const msg = err.response?.data?.message || "Something went wrong";
        setError(msg);
        if (err.response?.status === 403 && msg.toLowerCase().includes("verify")) setPendingEmail(email.trim());
      }
    } finally { setLoading(false); }
  }

  if (pendingEmail) return <VerifyPending email={pendingEmail} onBack={() => { setPendingEmail(null); setMode("login"); }} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-56px)]">
      {/* Form panel */}
      <div className="flex flex-col justify-center items-center px-5 sm:px-8 py-10 sm:py-16">
        <div className="w-full max-w-90 flex flex-col gap-5">
          <div>
            <div className="font-display text-[30px] sm:text-[34px] mb-1">BaltiCo</div>
            <p className="text-[13px] text-sand font-body">{mode === "login" ? "Sign in to your account" : "Create an account"}</p>
          </div>

          <div className="flex border-b border-sand">
            {[["login","SIGN IN"],["signup","REGISTER"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`text-[10px] font-bold tracking-[2.5px] pb-3 mr-6 border-b -mb-px transition-colors font-body ${mode===m?"border-ink text-ink":"border-transparent text-sand hover:text-ink"}`}>
                {label}
              </button>
            ))}
          </div>

          {googleConfigured ? (
            <button
              onClick={googleSignIn}
              disabled={!googleReady}
              className="w-full border border-sand py-3.5 flex items-center justify-center gap-3 hover:border-ink hover:bg-cream transition-all disabled:opacity-40 disabled:cursor-not-allowed font-body"
            >
              <GoogleIcon />
              <span className="text-[11px] font-semibold tracking-[1.5px]">
                {googleReady ? "CONTINUE WITH GOOGLE" : "LOADING..."}
              </span>
            </button>
          ) : (
            <div className="w-full border border-sand py-3.5 flex items-center justify-center gap-3 opacity-40 cursor-not-allowed">
              <GoogleIcon />
              <span className="text-[11px] font-semibold tracking-[1.5px] font-body text-sand">GOOGLE (configure .env)</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-sand" />
            <span className="text-[10px] font-bold tracking-[2px] text-sand font-body">OR</span>
            <div className="flex-1 h-px bg-sand" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-body px-4 py-3 flex items-start gap-2">
              <span className="shrink-0">⚠</span> <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:gap-5">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">FULL NAME</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                  className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">PASSWORD</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && submit()}
                className="border-0 border-b border-sand bg-transparent py-3 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/70" />
            </div>
          </div>

          <button onClick={submit} disabled={loading}
            className="bg-ink text-white text-[11px] font-bold tracking-[3px] uppercase py-4 hover:opacity-70 transition-opacity disabled:opacity-40 font-body mt-1">
            {loading
              ? <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "SIGNING IN..." : "CREATING..."}
                </span>
              : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"
            }
          </button>

        </div>
      </div>

      {/* Editorial photo — hidden on mobile */}
      <div className="hidden lg:block relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000" alt=""
          className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-black/40 flex items-end p-14">
          <p className="font-serif italic font-light text-[22px] text-white leading-snug max-w-70">
            Style is a way to say who you are without speaking.
          </p>
        </div>
      </div>
    </div>
  );
}
