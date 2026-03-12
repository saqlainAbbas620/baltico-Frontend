import { useState, useRef, useCallback } from "react";
import { apiUploadImage, apiDeleteImage } from "../../api";

/**
 * ImagePicker — dual-mode image input for BaltiCo admin
 *
 * Props:
 *   label       string   — field label shown above
 *   value       string   — current image URL (controlled)
 *   publicId    string   — current Cloudinary publicId (null if URL)
 *   onChange    fn(url, publicId) — called when image changes
 *   onClear     fn()     — called when image is explicitly removed
 *   optional    bool     — show "(optional)" hint
 */
export default function ImagePicker({ label, value, publicId, onChange, onClear, optional = false }) {
  const [mode,       setMode]     = useState("url");   // "url" | "upload"
  const [dragging,   setDragging] = useState(false);
  const [uploading,  setUploading]= useState(false);
  const [urlInput,   setUrlInput] = useState(value || "");
  const [error,      setError]    = useState("");
  const fileRef = useRef(null);

  // ── Upload file to Cloudinary via backend ────────────────────────────────
  async function uploadFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Max file size is 10 MB"); return; }

    setError("");
    setUploading(true);

    try {
      // If there's a current Cloudinary image, delete it first
      if (publicId) await apiDeleteImage(publicId).catch(() => {});

      const fd = new FormData();
      fd.append("image", file);
      const res = await apiUploadImage(fd);
      const { url, publicId: newPublicId } = res.data.data;
      onChange(url, newPublicId);
      setUrlInput(url);
    } catch {
      // Fallback: create a local object URL for preview (backend not connected)
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl, null);
      setUrlInput(localUrl);
      setError("Upload failed — using local preview");
    } finally {
      setUploading(false);
    }
  }

  // ── Apply pasted URL ─────────────────────────────────────────────────────
  async function applyUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setError("");

    // If replacing a Cloudinary-hosted image, clean it up
    if (publicId && url !== value) {
      await apiDeleteImage(publicId).catch(() => {});
    }
    onChange(url, null);
  }

  // ── Clear image ──────────────────────────────────────────────────────────
  async function clear() {
    if (publicId) await apiDeleteImage(publicId).catch(() => {});
    setUrlInput("");
    setError("");
    if (onClear) onClear();
    else onChange("", null);
  }

  // ── Drag handlers ────────────────────────────────────────────────────────
  const onDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true);  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop      = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [publicId, value]);

  const hasImage = Boolean(value);

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-bold tracking-[2.5px] uppercase text-ink/50 font-body">
          {label} {optional && <span className="font-normal normal-case tracking-normal text-sand">(optional)</span>}
        </label>
        {/* Mode toggle */}
        <div className="flex border border-sand overflow-hidden">
          {["url", "upload"].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`text-[8px] font-bold tracking-[1.5px] uppercase px-2.5 py-1 transition-colors font-body ${
                mode === m ? "bg-ink text-white" : "text-sand hover:text-ink"
              }`}
            >
              {m === "url" ? "🔗 URL" : "📁 FILE"}
            </button>
          ))}
        </div>
      </div>

      {/* Current image preview */}
      {hasImage && (
        <div className="relative group w-full aspect-4/3 overflow-hidden bg-cream border border-sand">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={clear}
              className="bg-red-600 text-white text-[9px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 hover:opacity-80 font-body"
            >
              ✕ REMOVE
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-white text-ink text-[9px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 hover:opacity-80 font-body"
            >
              ↑ REPLACE
            </button>
          </div>
          {/* Cloudinary badge */}
          {publicId && (
            <span className="absolute top-2 left-2 bg-[#3448c5] text-white text-[7px] font-bold tracking-[1.5px] uppercase px-1.5 py-0.5 font-body">
              ☁ CLOUDINARY
            </span>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyUrl()}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 border-0 border-b border-sand bg-transparent py-2 text-sm focus:outline-none focus:border-ink transition-colors font-body placeholder-sand/60 text-ink"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="text-[9px] font-bold tracking-[1.5px] uppercase border border-sand px-3 hover:border-ink hover:bg-ink hover:text-white transition-all font-body whitespace-nowrap"
          >
            APPLY
          </button>
        </div>
      )}

      {/* Upload / drag-drop mode */}
      {mode === "upload" && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-8 px-4 ${
            dragging
              ? "border-brand bg-brand/5 scale-[1.01]"
              : uploading
              ? "border-sand bg-cream cursor-not-allowed"
              : "border-sand hover:border-ink hover:bg-cream/50"
          }`}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-sand border-t-ink rounded-full animate-spin" />
              <p className="text-[10px] font-bold tracking-[2px] uppercase text-sand font-body">UPLOADING...</p>
            </>
          ) : dragging ? (
            <>
              <p className="text-3xl">⬇</p>
              <p className="text-[10px] font-bold tracking-[2px] uppercase text-brand font-body">DROP TO UPLOAD</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 border border-sand flex items-center justify-center text-xl text-sand">
                ↑
              </div>
              <p className="text-[10px] font-bold tracking-[2px] uppercase text-ink/50 font-body text-center">
                Click or drag image here
              </p>
              <p className="text-[9px] text-sand font-body">JPEG · PNG · WebP · GIF · max 10 MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => uploadFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[10px] text-red-500 font-body">{error}</p>
      )}
    </div>
  );
}
