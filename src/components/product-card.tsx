import { Link } from "wouter";
import { Product } from "@/hooks/use-cart";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const mainImage = product.imageUrls?.[0] || "https://placehold.co/400x500/f5f0e8/9b7553?text=No+Image";
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer h-full flex flex-col rounded-xl overflow-hidden border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={mainImage}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                Featured
              </span>
            )}
            {discount && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
          </div>
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="font-semibold text-foreground text-sm bg-background/90 px-4 py-2 rounded-full border shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <div className="bg-primary text-primary-foreground rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg">
              <ShoppingBag className="w-4 h-4" />
              View Product
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-sans font-medium mb-1">
            {product.category}
          </p>
          <h3 className="font-serif font-semibold text-foreground line-clamp-2 leading-snug flex-1 group-hover:text-primary transition-colors text-sm sm:text-base">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-primary text-base sm:text-lg">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
