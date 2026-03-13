import { useEffect, useRef, useState } from "react";

const GIS_URL   = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Lazily loads the Google Identity Services script and initialises
 * the library.  Returns:
 *   - signIn()        — triggers Google sign-in (One Tap → popup fallback)
 *   - ready           — true once the GIS library is loaded & init'd
 *   - configured      — true when a real client-id is present in .env
 */
export function useGoogleAuth(onCredential) {
  const configured = Boolean(
    CLIENT_ID &&
    CLIENT_ID !== "your-google-client-id.apps.googleusercontent.com"
  );

  const [ready, setReady] = useState(false);
  const callbackRef = useRef(onCredential);

  // Keep the callback ref fresh without re-running the effect
  useEffect(() => { callbackRef.current = onCredential; }, [onCredential]);

  useEffect(() => {
    if (!configured) return;

    function init() {
      window.google.accounts.id.initialize({
        client_id:             CLIENT_ID,
        callback:              (response) => callbackRef.current(response),
        auto_select:           false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt:  false, // disable FedCM to avoid silent failures
      });
      setReady(true);
    }

    // Script already loaded (e.g. hot-reload)
    if (window.google?.accounts?.id) {
      init();
      return;
    }

    // Inject script once
    if (!document.querySelector(`script[src="${GIS_URL}"]`)) {
      const script    = document.createElement("script");
      script.src      = GIS_URL;
      script.async    = true;
      script.defer    = true;
      script.onload   = init;
      script.onerror  = () => console.error("[useGoogleAuth] Failed to load GIS script");
      document.head.appendChild(script);
    } else {
      // Tag exists but hasn't fired onload yet — poll
      const iv = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(iv); init(); }
      }, 50);
      return () => clearInterval(iv);
    }
  }, [configured]);

  function signIn() {
    if (!ready || !window.google?.accounts?.id) return;

    // Try One Tap first; on any failure mode fall back to the pop-up flow
    window.google.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        // One Tap was suppressed (third-party cookie block, iframe, browser policy)
        // Fall back to the standard pop-up OAuth flow via renderButton trigger
        triggerPopup();
      }
    });
  }

  /**
   * Creates an invisible GIS button div off-screen and programmatically
   * clicks it. This is the only reliable cross-browser popup fallback —
   * google.accounts.id.prompt() won't show a popup if One Tap is blocked,
   * and oauth2.initTokenClient returns an access token, not an ID token,
   * so it can't be used with our /api/auth/google endpoint.
   */
  function triggerPopup() {
    const existing = document.getElementById("__gsi_popup_anchor__");
    if (existing) { existing.click(); return; }

    const div = document.createElement("div");
    div.id    = "__gsi_popup_anchor__";
    div.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;";
    document.body.appendChild(div);

    window.google.accounts.id.renderButton(div, {
      type:  "standard",
      theme: "outline",
      size:  "large",
    });

    // The rendered button is an iframe — click its inner button
    setTimeout(() => {
      const btn = div.querySelector("div[role='button']") || div.querySelector("button");
      if (btn) btn.click();
    }, 100);
  }

  return { signIn, ready, configured };
}
