import { useState, useEffect } from "react";
import { useStore } from "../../context/store";
import { apiGetBanner, apiUpdateBanner, apiGetCategoryImages, apiUpdateCategoryImage } from "../../api";
import ImagePicker from "../../components/ui/ImagePicker";

const CAT_LABELS = { women: "Women", men: "Men", children: "Children / Kids" };

export default function BannerCMS() {
  const { banner, setBanner, categoryImages, setCategoryImages, notify } = useStore();
  const [bannerPublicId, setBannerPublicId] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [catSaving, setCatSaving] = useState({});

  const [catImages, setCatImages] = useState({
    women:    { url: categoryImages.women,    publicId: null },
    men:      { url: categoryImages.men,      publicId: null },
    children: { url: categoryImages.children, publicId: null },
  });

  useEffect(() => {
    // Fetch banner publicId so Cloudinary cleanup works on replace
    apiGetBanner()
      .then(res => {
        const { url, publicId } = res.data?.data || {};
        if (url) setBanner(url);
        if (publicId) setBannerPublicId(publicId);
      })
      .catch(() => {});

    // Fetch category images with publicIds
    apiGetCategoryImages().then(res => {
      const cats = res.data?.data?.categories;
      if (cats) {
        setCatImages({
          women:    { url: cats.women?.url    || categoryImages.women,    publicId: cats.women?.publicId    || null },
          men:      { url: cats.men?.url      || categoryImages.men,      publicId: cats.men?.publicId      || null },
          children: { url: cats.children?.url || categoryImages.children, publicId: cats.children?.publicId || null },
        });
      }
    }).catch(() => {});
  }, []);

  async function handleBannerChange(url, publicId) {
    setSaving(true);
    try {
      await apiUpdateBanner({ url, publicId });
      setBanner(url);
      setBannerPublicId(publicId);
      notify("Banner updated!");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to save banner", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleCategoryChange(cat, url, publicId) {
    setCatSaving(prev => ({ ...prev, [cat]: true }));
    try {
      await apiUpdateCategoryImage(cat, { url, publicId });
      setCatImages(prev => ({ ...prev, [cat]: { url, publicId } }));
      setCategoryImages(prev => ({ ...prev, [cat]: url }));
      notify(`${CAT_LABELS[cat]} image updated!`);
    } catch (err) {
      notify(err?.response?.data?.message || `Failed to save ${CAT_LABELS[cat]} image`, true);
    } finally {
      setCatSaving(prev => ({ ...prev, [cat]: false }));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif italic font-light text-4xl">CMS</h1>

      {/* Hero Banner */}
      <div className="bg-white p-6 flex flex-col gap-6 border-t-4 border-brand">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-bold tracking-[3px] uppercase font-body">Hero Banner</h2>
          <span className="text-[8px] font-bold tracking-[1.5px] bg-brand text-white px-2 py-0.5 font-body">HOMEPAGE</span>
        </div>
        {banner && (
          <div className="relative aspect-21/5 overflow-hidden bg-cream">
            <img src={banner} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-bold tracking-[3px] font-body">HERO BANNER</span>
            </div>
          </div>
        )}
        <div className="max-w-lg">
          <ImagePicker label="UPLOAD / PASTE BANNER URL" value={banner} publicId={bannerPublicId}
            onChange={handleBannerChange} onClear={() => { setBanner(""); setBannerPublicId(null); }} />
        </div>
        {saving && <p className="text-[10px] font-bold tracking-[2px] uppercase text-sand font-body animate-pulse">SAVING...</p>}
        <p className="text-[11px] text-sand font-body border-t border-sand pt-4">
          Recommended: 1600px wide, 16:5 landscape. Cloudinary images are auto-deleted when replaced.
        </p>
      </div>

      {/* Category Images */}
      <div className="bg-white p-6 flex flex-col gap-6 border-t-4 border-amber">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-bold tracking-[3px] uppercase font-body">Category Section Images</h2>
          <span className="text-[8px] font-bold tracking-[1.5px] bg-amber text-white px-2 py-0.5 font-body">HOMEPAGE</span>
        </div>
        <p className="text-[11px] text-sand font-body -mt-4">
          These appear as the 3 category tiles on the homepage. Upload or paste a URL for each.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["women", "men", "children"].map(cat => (
            <div key={cat} className="flex flex-col gap-3">
              <div className="relative aspect-3/4 overflow-hidden bg-cream">
                {catImages[cat]?.url ? (
                  <img src={catImages[cat].url} alt={cat} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-sand font-body">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                  <span className="text-white text-[10px] font-bold tracking-[3px] font-body">{CAT_LABELS[cat].toUpperCase()}</span>
                </div>
              </div>
              {catSaving[cat] && <p className="text-[9px] font-bold tracking-[2px] uppercase text-sand font-body animate-pulse">SAVING...</p>}
              <ImagePicker
                label={`${CAT_LABELS[cat].toUpperCase()} IMAGE`}
                value={catImages[cat]?.url || ""}
                publicId={catImages[cat]?.publicId}
                onChange={(url, pid) => handleCategoryChange(cat, url, pid)}
                onClear={() => {
                  setCatImages(prev => ({ ...prev, [cat]: { url: "", publicId: null } }));
                  setCategoryImages(prev => ({ ...prev, [cat]: "" }));
                }}
              />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-sand font-body border-t border-sand pt-4">
          Recommended: portrait/square images, 700px wide. Changes are reflected immediately on the homepage.
        </p>
      </div>
    </div>
  );
}
