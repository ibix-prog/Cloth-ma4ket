import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Trash2, Minus, Plus, ArrowRight, ArrowLeft, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { createOrder } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerAddress: z.string().min(10, "Complete address is required"),
  notes: z.string().optional(),
});

export default function Cart() {
  const { items, updateQuantity, removeItem, cartTotal, clearCart } = useCart();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [successId, setSuccessId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user && items.length > 0) {
      setLocation("/login");
    }
  }, [user, loading, items, setLocation]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.displayName || "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    if (items.length === 0 || !user) return;
    setSubmitting(true);
    try {
      const orderId = await createOrder({
        userId: user.uid,
        userEmail: user.email || "",
        ...data,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          imageUrl: item.product.imageUrls?.[0] || "",
          size: item.selectedSize || undefined,
          color: item.selectedColor || undefined
        })),
        total: cartTotal,
        status: "pending",
      });
      setSuccessId(orderId);
      clearCart();
    } catch (err) {
      console.error("Failed to place order", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (successId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-background">
        <Card className="max-w-md w-full text-center border-none shadow-xl bg-card">
          <CardContent className="pt-10 pb-10 px-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-2">Thank you for shopping with Shahi Vastram.</p>
            <p className="font-medium text-foreground mb-8 font-mono bg-muted p-2 rounded">ID: {successId}</p>
            <Link href="/orders">
              <Button size="lg" className="w-full mb-3 bg-primary">View My Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our latest collections and find something beautiful.
        </p>
        <Link href="/">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border shadow-sm bg-card">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 aspect-square bg-muted flex-shrink-0">
                  <img 
                    src={item.product.imageUrls?.[0] || "https://placehold.co/150"} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 font-serif text-foreground">{item.product.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 space-x-3 font-sans">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>
                    </div>
                    <span className="font-bold text-lg text-primary whitespace-nowrap">
                      ₹{item.product.price}
                    </span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border rounded-md bg-background">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="w-10 text-center text-sm font-medium text-foreground">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive flex items-center text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline pt-4 font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="lg:col-span-5">
          <Card className="border shadow-md sticky top-24 bg-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 font-serif text-foreground">Order Summary</h3>
              <div className="space-y-3 mb-6 text-sm font-sans">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-secondary font-medium">Free</span>
                </div>
                <Separator className="my-2 bg-border" />
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{cartTotal}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4 mt-8 font-serif text-foreground">Delivery Details</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 font-sans">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Complete Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="House/Flat No., Street, Landmark, City, PIN" className="resize-none bg-background" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Any special instructions" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 mt-6 text-base bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <>
                        Place Order <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
