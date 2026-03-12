import { useEffect, useRef, useState } from "react";

const GIS_URL = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Lazily loads the Google Identity Services script and initialises
 * the library.  Returns:
 *   - signIn()        — opens the One Tap / popup picker
 *   - ready           — true once the GIS library is loaded & init'd
 *   - configured      — true when a real client-id is present in .env
 */
export function useGoogleAuth(onCredential) {
  const configured = Boolean(
    CLIENT_ID && CLIENT_ID !== "your-google-client-id.apps.googleusercontent.com"
  );

  const [ready, setReady]   = useState(false);
  const callbackRef = useRef(onCredential);

  // Keep the callback ref fresh so the GIS initialise call never goes stale
  useEffect(() => { callbackRef.current = onCredential; }, [onCredential]);

  useEffect(() => {
    if (!configured) return;

    function init() {
      window.google.accounts.id.initialize({
        client_id:   CLIENT_ID,
        callback:    (response) => callbackRef.current(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setReady(true);
    }

    // If the script is already present (e.g. hot-reload), init immediately
    if (window.google?.accounts?.id) { init(); return; }

    // Otherwise inject the script once and wait for it
    if (!document.querySelector(`script[src="${GIS_URL}"]`)) {
      const script = document.createElement("script");
      script.src   = GIS_URL;
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      // Script tag exists but hasn't loaded yet — poll
      const iv = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(iv); init(); }
      }, 50);
      return () => clearInterval(iv);
    }
  }, [configured]);

  function signIn() {
    if (!ready) return;
    // prompt() shows One Tap; if the user dismisses it nothing bad happens
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap blocked (e.g. in an iframe) → fall back to FedCM / popup
        window.google.accounts.oauth2
          ?.initTokenClient({
            client_id: CLIENT_ID,
            scope: "openid email profile",
            callback: () => {},
          })
          ?.requestAccessToken();
      }
    });
  }

  return { signIn, ready, configured };
}
