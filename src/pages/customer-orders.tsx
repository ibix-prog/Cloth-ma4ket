import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getUserOrders, Order } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomerOrders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
      return;
    }
    
    if (user) {
      const fetchOrders = async () => {
        try {
          const data = await getUserOrders(user.uid);
          setOrders(data);
        } catch (err) {
          console.error("Failed to load orders", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-16 bg-muted/30 border-dashed">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2 text-foreground">No orders yet</h3>
            <p className="text-muted-foreground mb-6">You haven't placed any orders with us.</p>
            <Link href="/">
              <span className="text-primary font-medium hover:underline cursor-pointer">
                Start Shopping
              </span>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden bg-card border shadow-sm">
              <CardHeader className="bg-muted/50 border-b py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                  <div>
                    <div className="text-sm text-muted-foreground">Order ID</div>
                    <div className="font-mono font-medium text-foreground">{order.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium text-foreground">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="font-bold text-primary">₹{order.total}</div>
                  </div>
                  <div>
                    <Badge variant="outline" className={`capitalize
                      ${order.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0 border">
                        <img 
                          src={item.imageUrl ? item.imageUrl : "https://placehold.co/100"} 
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 font-sans">
                        <Link href={`/product/${item.productId}`}>
                          <h4 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1">
                            {item.productName}
                          </h4>
                        </Link>
                        <div className="text-sm text-muted-foreground space-x-3 mt-1">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <div className="font-bold text-foreground font-sans">
                        ₹{item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
