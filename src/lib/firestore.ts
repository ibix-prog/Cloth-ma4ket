import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp, 
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "@/hooks/use-cart";
import { cacheGet, cacheSet, cacheInvalidate } from "./product-cache";
export type { Product } from "@/hooks/use-cart";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: any;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(filters?: { category?: string; featured?: boolean; search?: string }): Promise<Product[]> {
  const cacheKey = `products:${JSON.stringify(filters || {})}`;
  const cached = cacheGet<Product[]>(cacheKey);
  if (cached) return cached;

  let q = query(collection(db, "products"));
  if (filters?.category) q = query(q, where("category", "==", filters.category));
  if (filters?.featured !== undefined) q = query(q, where("featured", "==", filters.featured));

  const snapshot = await getDocs(q);
  let products = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
    );
  }

  cacheSet(cacheKey, products);
  return products;
}

export async function getProduct(id: string): Promise<Product | null> {
  const cacheKey = `product:${id}`;
  const cached = cacheGet<Product>(cacheKey);
  if (cached) return cached;

  const docRef = doc(db, "products", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const product = { id: snapshot.id, ...snapshot.data() } as Product;
  cacheSet(cacheKey, product);
  return product;
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  cacheInvalidate("products:");
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  cacheInvalidate("products:");
  cacheInvalidate(`product:${id}`);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
  cacheInvalidate("products:");
  cacheInvalidate(`product:${id}`);
}

// ─── Custom Categories ────────────────────────────────────────────────────────

export interface CustomCategory {
  name: string;
  emoji: string;
  image: string;
}

const DEFAULT_CATEGORIES: CustomCategory[] = [
  { name: "Sarees",     emoji: "🥻", image: "https://images.unsplash.com/photo-1610189013233-0498b5a00a89?q=80&w=600&auto=format&fit=crop" },
  { name: "Kurta Sets", emoji: "👗", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop" },
  { name: "Lehengas",   emoji: "✨", image: "https://images.unsplash.com/photo-1621538995326-1d120a10df11?q=80&w=600&auto=format&fit=crop" },
  { name: "Jewelry",    emoji: "💎", image: "https://images.unsplash.com/photo-1599643478524-fb66f809d435?q=80&w=600&auto=format&fit=crop" },
];

export async function getCustomCategories(): Promise<CustomCategory[]> {
  const cached = cacheGet<CustomCategory[]>("categories");
  if (cached) return cached;
  try {
    const snap = await getDoc(doc(db, "settings", "categories"));
    if (!snap.exists()) { cacheSet("categories", DEFAULT_CATEGORIES); return DEFAULT_CATEGORIES; }
    const data = snap.data();
    const cats: CustomCategory[] = data.list || DEFAULT_CATEGORIES;
    cacheSet("categories", cats);
    return cats;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCustomCategories(list: CustomCategory[]): Promise<void> {
  await setDoc(doc(db, "settings", "categories"), { list }, { merge: true });
  cacheInvalidate("categories");
}

export { DEFAULT_CATEGORIES };

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)).sort((a, b) => {
    const aT = a.createdAt?.toMillis?.() || 0;
    const bT = b.createdAt?.toMillis?.() || 0;
    return bT - aT;
  });
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface SiteSettings {
  whatsapp?: string;
  phone?: string;
  announcement?: string;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const cached = cacheGet<SiteSettings>("settings:contact");
  if (cached) return cached;
  try {
    const snap = await getDoc(doc(db, "settings", "contact"));
    if (!snap.exists()) return {};
    const data = snap.data() as SiteSettings;
    cacheSet("settings:contact", data);
    return data;
  } catch {
    return {};
  }
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  await setDoc(doc(db, "settings", "contact"), data, { merge: true });
  cacheInvalidate("settings:contact");
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function saveUserProfile(user: any): Promise<void> {
  if (!user?.uid || !user?.email) return;
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    createdAt: serverTimestamp(),
  }, { merge: true });
}
