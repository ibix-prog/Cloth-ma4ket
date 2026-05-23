import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, ImagePlus, Truck } from "lucide-react";
import { createProduct, updateProduct, Product, getCustomCategories, CustomCategory } from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().min(1, "Price is required"),
  originalPrice: z.coerce.number().optional(),
  category: z.string().min(1, "Category is required"),
  inStock: z.boolean().default(true),
  stockCount: z.coerce.number().optional(),
  featured: z.boolean().default(false),
  homeDelivery: z.boolean().default(true),
});

export function ProductForm({ product, onSuccess }: { product?: Product | null; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<string[]>(product?.colors || []);
  const [colorInput, setColorInput] = useState("");
  const [images, setImages] = useState<string[]>(product?.imageUrls || []);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    getCustomCategories().then(setCategories);
  }, []);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      originalPrice: product?.originalPrice || 0,
      category: product?.category || "",
      inStock: product?.inStock ?? true,
      stockCount: product?.stockCount || 0,
      featured: product?.featured ?? false,
      homeDelivery: product?.homeDelivery ?? true,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed", () => {}, (err) => { console.error(err); setUploading(false); }, async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setImages(prev => [...prev, url]);
        setUploading(false);
      });
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const addSize = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes(prev => [...prev, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const addColor = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors(prev => [...prev, colorInput.trim()]);
      setColorInput("");
    }
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    setSubmitting(true);
    try {
      const productData = { ...data, sizes, colors, imageUrls: images };
      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-sans pb-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Product Name</FormLabel>
              <FormControl><Input placeholder="E.g. Royal Burgundy Silk Saree" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₹)</FormLabel>
              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="originalPrice" render={({ field }) => (
            <FormItem>
              <FormLabel>Original Price (₹) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="stockCount" render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Count</FormLabel>
              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Describe the product..." rows={3} className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Images */}
        <div className="space-y-3">
          <label className="text-sm font-medium leading-none">Product Images</label>
          <div className="flex gap-3 flex-wrap">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg border overflow-hidden flex-shrink-0 group">
                <img src={img} alt="Product" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(s => s.filter((_, i) => i !== idx))}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground hover:text-primary">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
              <span className="text-[10px] mt-1">{uploading ? "Uploading…" : "Add Photo"}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Sizes & Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Sizes</label>
            <div className="flex gap-2">
              <Input placeholder="S, M, L, Free Size…" value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSize(e)} />
              <Button type="button" variant="secondary" size="sm" onClick={addSize}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((size, idx) => (
                <Badge key={idx} variant="outline" className="pl-2.5 pr-1 py-1">
                  {size}
                  <button type="button" onClick={() => setSizes(s => s.filter((_, i) => i !== idx))} className="ml-1 text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Colors</label>
            <div className="flex gap-2">
              <Input placeholder="Red, Gold, Ivory…" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addColor(e)} />
              <Button type="button" variant="secondary" size="sm" onClick={addColor}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {colors.map((color, idx) => (
                <Badge key={idx} variant="outline" className="pl-2.5 pr-1 py-1">
                  {color}
                  <button type="button" onClick={() => setColors(c => c.filter((_, i) => i !== idx))} className="ml-1 text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-5">
          <FormField control={form.control} name="inStock" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <FormLabel className="text-sm font-medium cursor-pointer">In Stock</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="featured" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <FormLabel className="text-sm font-medium cursor-pointer">Featured</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="homeDelivery" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-green-50/50 dark:bg-green-900/10">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                <FormLabel className="text-sm font-medium cursor-pointer">Home Delivery</FormLabel>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="w-full h-11" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Add Product"}
        </Button>
      </form>
    </Form>
  );
}
