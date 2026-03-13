import { useEffect, useRef, useState } from "react";

const GIS_URL   = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Google OAuth hook using the Authorization Code flow with popup.
 *
 * Why NOT One Tap / prompt():
 *   - google.accounts.id.prompt() calls /gsi/status which returns 403
 *     on http://localhost in Chrome 114+ due to third-party cookie restrictions.
 *   - renderButton() hidden iframe approach also fails with COOP errors.
 *
 * What we use instead:
 *   - google.accounts.oauth2.initCodeClient() — opens a real popup window,
 *     works on localhost and production, not affected by cookie/FedCM policy.
 *   - The popup returns an authorization code which we exchange on the backend
 *     for an ID token using Google's tokeninfo endpoint.
 *
 * Returns { signIn, ready, configured }
 */
export function useGoogleAuth(onCredential) {
  const configured = Boolean(
    CLIENT_ID &&
    CLIENT_ID !== "your-google-client-id.apps.googleusercontent.com"
  );

  const [ready, setReady]   = useState(false);
  const clientRef           = useRef(null);
  const callbackRef         = useRef(onCredential);

  useEffect(() => { callbackRef.current = onCredential; }, [onCredential]);

  useEffect(() => {
    if (!configured) return;

    function init() {
      // Use oauth2 code client — opens a proper popup, works everywhere
      clientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id:  CLIENT_ID,
        scope:      "openid email profile",
        ux_mode:    "popup",
        callback:   handleCode,
      });
      setReady(true);
    }

    if (window.google?.accounts?.oauth2) { init(); return; }

    if (!document.querySelector(`script[src="${GIS_URL}"]`)) {
      const script   = document.createElement("script");
      script.src     = GIS_URL;
      script.async   = true;
      script.defer   = true;
      script.onload  = init;
      script.onerror = () => console.error("[GoogleAuth] Failed to load GIS script");
      document.head.appendChild(script);
    } else {
      const iv = setInterval(() => {
        if (window.google?.accounts?.oauth2) { clearInterval(iv); init(); }
      }, 50);
      return () => clearInterval(iv);
    }
  }, [configured]);

  // Called by GIS with { code } after user selects their Google account
  async function handleCode({ code, error }) {
    if (error) {
      console.error("[GoogleAuth] OAuth error:", error);
      callbackRef.current({ error: error === "access_denied" ? "cancelled" : error });
      return;
    }
    if (!code) {
      callbackRef.current({ error: "no_code" });
      return;
    }
    // Forward the code to the parent — the parent sends it to the backend
    callbackRef.current({ code });
  }

  function signIn() {
    if (!ready || !clientRef.current) return;
    clientRef.current.requestCode();
  }

  return { signIn, ready, configured };
}
