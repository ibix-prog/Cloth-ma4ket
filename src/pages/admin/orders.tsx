import { useEffect, useState } from "react";
import { Loader2, PackageOpen, Phone, MessageCircle, ChevronDown, ChevronUp, MapPin, Calendar } from "lucide-react";
import { getOrders, updateOrderStatus, Order } from "@/lib/firestore";
import { getSiteSettings } from "@/lib/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200",
  shipped:   "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200",
};

function OrderCard({ order, onStatusChange, storePhone }: {
  order: Order;
  onStatusChange: (id: string, status: string) => void;
  storePhone?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Recent";

  const waLink = `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
    `Hi ${order.customerName}, this is Shahi Vastram. Regarding your order #${order.id.slice(-6).toUpperCase()} - `
  )}`;

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b bg-muted/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="font-mono font-bold text-primary text-xs">
              #{order.id.slice(-4).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground font-sans">{order.customerName}</p>
            <p className="text-xs text-muted-foreground font-sans flex items-center gap-1">
              <Calendar className="w-3 h-3" />{dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status select */}
          <Select value={order.status} onValueChange={v => onStatusChange(order.id, v)}>
            <SelectTrigger className={`h-8 text-xs font-semibold w-[130px] border ${STATUS_STYLES[order.status] || ""}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">🕐 Pending</SelectItem>
              <SelectItem value="confirmed">✅ Confirmed</SelectItem>
              <SelectItem value="shipped">🚚 Shipped</SelectItem>
              <SelectItem value="delivered">📦 Delivered</SelectItem>
              <SelectItem value="cancelled">❌ Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <span className="font-bold text-primary font-sans text-base whitespace-nowrap">₹{order.total.toLocaleString()}</span>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-sm">
          {/* Customer info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">Customer</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-mono">{order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{order.customerAddress}</span>
              </div>
              {order.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-800 dark:text-amber-300 text-xs">
                  <span className="font-semibold">Note: </span>{order.notes}
                </div>
              )}
            </div>

            {/* Contact buttons */}
            <div className="flex gap-2 pt-1">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5C] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
              Items ({order.items.length})
            </h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0 border">
                    {item.imageUrl
                      ? <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                      {item.size && <> · {item.size}</>}
                      {item.color && <> · {item.color}</>}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary flex-shrink-0">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [storePhone, setStorePhone] = useState<string | undefined>();

  const fetchOrders = async () => {
    try {
      const [data, settings] = await Promise.all([getOrders(), getSiteSettings()]);
      setOrders(data);
      if (settings.phone) setStorePhone(settings.phone);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as Order["status"] } : o));
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1 font-sans text-sm">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="text-xs text-muted-foreground hover:text-primary font-sans flex items-center gap-1 transition-colors">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 font-sans">
        {(["all", "pending", "confirmed", "shipped", "delivered"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filter === s ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            }`}>
              {counts[s as keyof typeof counts] ?? orders.filter(o => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed font-sans">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-muted-foreground">No {filter !== "all" ? filter : ""} orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              storePhone={storePhone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
