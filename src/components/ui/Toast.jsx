import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 2800,
        success: {
          style: {
            background: "#0a0a0a",
            color: "#ffffff",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            borderRadius: "0",
            padding: "14px 24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            minWidth: "220px",
          },
          iconTheme: { primary: "#4CAF50", secondary: "#ffffff" },
        },
        error: {
          duration: 3500,
          style: {
            background: "#0a0a0a",
            color: "#F9CF00",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            borderRadius: "0",
            padding: "14px 24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            minWidth: "220px",
          },
          iconTheme: { primary: "#F19F4D", secondary: "#0a0a0a" },
        },
      }}
    />
  );
}
