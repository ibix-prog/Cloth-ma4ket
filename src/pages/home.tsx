import { useEffect, useState, useCallback } from "react";
import { getProducts, getCustomCategories, CustomCategory } from "@/lib/firestore";
import { Product } from "@/hooks/use-cart";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowRight, Sparkles } from "lucide-react";

// Skeleton card for loading state
function ProductSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border bg-card animate-pulse">
      <div className="aspect-[3/4] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [cats, setCats] = useState<CustomCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  // Read ?category from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, []);

  // Load categories (cached after first fetch)
  useEffect(() => {
    getCustomCategories().then(data => { setCats(data); setCatsLoading(false); });
  }, []);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getProducts(category ? { category } : undefined);
        if (cancelled) return;
        let filtered = data;
        if (debouncedSearch) {
          const s = debouncedSearch.toLowerCase();
          filtered = data.filter(p =>
            p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
          );
        }
        setProducts(filtered);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [category, debouncedSearch]);

  const clearFilters = useCallback(() => {
    setCategory(null);
    setSearch("");
    setDebouncedSearch("");
  }, []);

  const showHero = !category && !debouncedSearch;

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ─── Hero ─── */}
      {showHero && (
        <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "85vh" }}>
          <img
            src="https://images.unsplash.com/photo-1583391733958-d25e019688bc?q=80&w=1800&auto=format&fit=crop"
            alt="Shahi Vastram Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 text-amber-300 font-sans text-sm font-semibold tracking-widest uppercase mb-6 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4" />
              Royal Indian Boutique
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Dress in the<br />
              <span className="text-amber-300">Colors of India</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/85 font-sans mb-10 leading-relaxed">
              A curated royal bazaar of premium ethnic wear,<br className="hidden sm:block" /> crafted with tradition and elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-sans font-bold px-8 py-3 rounded-full transition-colors shadow-lg text-base"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => cats[0] && setCategory(cats[0].name)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-sans font-medium px-8 py-3 rounded-full transition-colors backdrop-blur-sm border border-white/30 text-base"
              >
                Browse {cats[0]?.name || "Collection"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Categories ─── */}
      {showHero && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">Shop by Category</h2>
              <p className="text-muted-foreground font-sans">Explore our curated collections</p>
            </div>
            {catsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className={`grid gap-4 ${cats.length <= 2 ? "grid-cols-2 max-w-sm mx-auto" : cats.length === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
                {cats.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left bg-muted"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        {cat.emoji}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-xs text-white/70 font-sans mb-1">{cat.emoji}</p>
                      <h3 className="font-serif text-lg font-bold text-white">{cat.name}</h3>
                      <p className="text-xs text-white/60 font-sans mt-1 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                        Shop now <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Product Collection ─── */}
      <section id="collection" className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {category ? `${category} Collection` : "Our Collection"}
              </h2>
              {(category || debouncedSearch) && (
                <button onClick={clearFilters} className="text-sm text-primary mt-1 hover:underline font-sans inline-flex items-center gap-1">
                  ← Back to all
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search products…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed">
              <div className="text-5xl mb-4">🪔</div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground font-sans text-sm mb-4">
                {debouncedSearch ? `No results for "${debouncedSearch}"` : "This collection is empty."}
              </p>
              <button onClick={clearFilters} className="text-primary hover:underline font-sans text-sm">
                View all products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── Footer strip ─── */}
      <footer className="border-t bg-muted/30 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif text-2xl font-bold text-primary mb-1">Shahi Vastram</p>
          <p className="text-muted-foreground font-sans text-sm">Premium Indian Ethnic Wear · Crafted with Tradition</p>
        </div>
      </footer>
    </div>
  );
}
