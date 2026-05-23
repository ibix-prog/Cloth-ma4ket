import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Loader2, Minus, Plus, ShoppingBag, ArrowLeft, Check, Truck, Store } from "lucide-react";
import { getProduct } from "@/lib/firestore";
import { Product, useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const p = await getProduct(id);
        setProduct(p);
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 font-serif text-foreground">Product not found</h2>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) return;
    if (product.colors?.length && !selectedColor) return;
    
    addItem(product, quantity, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.sizes?.length && !selectedSize) return;
    if (product.colors?.length && !selectedColor) return;
    
    addItem(product, quantity, selectedSize, selectedColor);
    setLocation("/cart");
  };

  const missingSelections = [];
  if (product.sizes?.length && !selectedSize) missingSelections.push("size");
  if (product.colors?.length && !selectedColor) missingSelections.push("color");

  const images = product.imageUrls?.length 
    ? product.imageUrls
    : ["https://placehold.co/600x800/f8f9fa/a1a1aa?text=No+Image"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to shopping
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-muted rounded-2xl overflow-hidden relative border shadow-sm">
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {!product.inStock && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="text-sm px-3 py-1 shadow-sm">Out of Stock</Badge>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 transition-all ${activeImage === idx ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col py-2">
          <div className="mb-2">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full font-sans">
              {product.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-end gap-4 mb-6 font-sans">
            <span className="text-3xl font-bold text-primary">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-muted-foreground line-through mb-1">
                  ₹{product.originalPrice}
                </span>
                <span className="text-sm font-bold text-secondary bg-secondary/10 px-2 py-1 rounded mb-1">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="prose prose-sm md:prose-base text-muted-foreground mb-6 font-sans">
            <p>{product.description || "No description available."}</p>
          </div>

          {/* Delivery info */}
          <div className="flex gap-2 mb-6">
            {product.homeDelivery !== false ? (
              <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5" />
                Home Delivery Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground border text-xs font-semibold px-3 py-1.5 rounded-full">
                <Store className="w-3.5 h-3.5" />
                In-Store Pickup Only
              </span>
            )}
          </div>

          <div className="space-y-6 mb-8 font-sans">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-10 px-4 rounded-md border text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 px-4 rounded-md border text-sm font-medium transition-colors capitalize ${
                        selectedColor === color
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="w-12 text-center font-medium text-foreground">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-border grid grid-cols-2 gap-4">
            <Button 
              size="lg" 
              variant="outline"
              className={`w-full h-14 text-base transition-all ${added ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-primary text-primary hover:bg-primary/5'}`}
              disabled={!product.inStock || missingSelections.length > 0}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check className="mr-2 h-5 w-5" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
                </>
              )}
            </Button>
            <Button 
              size="lg" 
              className="w-full h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!product.inStock || missingSelections.length > 0}
              onClick={handleBuyNow}
            >
              {!product.inStock ? (
                "Out of Stock"
              ) : missingSelections.length > 0 ? (
                `Select ${missingSelections.join(" & ")}`
              ) : (
                "Buy Now"
              )}
            </Button>
          </div>
          {product.inStock && product.stockCount && product.stockCount < 10 && (
            <p className="text-center text-sm text-secondary mt-3 font-medium">
              Only {product.stockCount} left in stock - order soon!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
