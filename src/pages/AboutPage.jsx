export default function AboutPage() {
  return (
    <div>
      {/* Hero split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[78vh]">
        <div className="overflow-hidden">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900" alt="" className="w-full h-full object-cover object-top" />
        </div>
        <div className="bg-cream flex flex-col justify-end px-12 py-14">
          <p className="text-[10px] font-bold tracking-[4px] uppercase text-sand mb-5 font-body">EST. 2023 — SKARDU</p>
          <h1 className="font-display text-6xl md:text-7xl leading-[1.05]">Fashion is a<br />personal language.</h1>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-5xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-5">
          <h2 className="font-serif italic font-light text-4xl leading-snug">Born in the city,<br />worn worldwide.</h2>
          <p className="text-[15px] leading-[1.9] text-ink/60 font-body">BaltiCo was founded in Skardu in 2023, when two designers with backgrounds in streetwear and haute couture set out to merge the two worlds — without compromise.</p>
          <p className="text-[15px] leading-[1.9] text-ink/60 font-body">Every piece carries an intention. We collaborate with small-batch mills and fair-wage factories who believe quality and ethics should never be in conflict.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=700" alt="" className="w-full aspect-3/4 object-cover" />
      </div>

      {/* Stats */}
      <div className="bg-ink grid grid-cols-2 md:grid-cols-4">
        {[["18,000+","Customers"],["3","Collections/year"],["100%","Ethical sourcing"],["42","Countries"]].map(([n,l]) => (
          <div key={n} className="flex flex-col gap-2 px-10 py-12 border-r border-white/10 last:border-0">
            <span className="font-display text-5xl text-gold">{n}</span>
            <span className="text-[11px] uppercase tracking-[1.5px] text-white/40 font-body">{l}</span>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="py-24 px-8 flex flex-col items-center text-center gap-4">
        <p className="font-serif italic font-light text-2xl md:text-3xl max-w-160 leading-[1.55]">
          "To create fashion that empowers — celebrating diversity of body, culture, and creative spirit."
        </p>
        <span className="text-[11px] tracking-[2px] text-sand uppercase font-body">— BaltiCo Mission Statement</span>
      </div>
    </div>
  );
}
