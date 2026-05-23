import { useEffect, useState } from "react";
import {
  Loader2, Plus, Trash2, Save, CheckCircle2, GripVertical, Image as ImageIcon
} from "lucide-react";
import { getCustomCategories, saveCustomCategories, DEFAULT_CATEGORIES, CustomCategory } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const EMOJI_OPTIONS = ["🥻","👗","✨","💎","👒","🧣","🧤","👘","🪭","🌸","🔥","⭐","🎀","🪷","🌺"];

export default function Categories() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // new category inputs
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("✨");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    getCustomCategories().then(cats => { setCategories(cats); setLoading(false); });
  }, []);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return;
    setCategories(prev => [...prev, { name, emoji: newEmoji, image: newImage.trim() || "" }]);
    setNewName("");
    setNewImage("");
    setNewEmoji("✨");
  };

  const handleRemove = (idx: number) => {
    setCategories(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCustomCategories(categories);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setCategories(DEFAULT_CATEGORIES);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1 font-sans text-sm">
            Manage the category cards shown on the homepage.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-primary font-sans transition-colors"
        >
          Reset to defaults
        </button>
      </div>

      {/* Add new category */}
      <Card className="border shadow-sm bg-card">
        <CardHeader className="border-b pb-4">
          <CardTitle className="font-serif text-lg">Add New Category</CardTitle>
          <CardDescription className="font-sans text-sm">
            It will show as a card on the homepage and as a filter option.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4 font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                placeholder="e.g. Dupattas"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Emoji</label>
              <div className="flex gap-1 flex-wrap">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewEmoji(e)}
                    className={`w-8 h-8 text-base rounded-md transition-all ${newEmoji === e ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Image URL <span className="text-muted-foreground font-normal">(optional — paste any Unsplash or image link)</span>
            </label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={newImage}
              onChange={e => setNewImage(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} disabled={!newName.trim()} className="w-full">
            <Plus className="mr-2 w-4 h-4" />
            Add Category
          </Button>
        </CardContent>
      </Card>

      {/* Current categories */}
      <Card className="border shadow-sm bg-card">
        <CardHeader className="border-b pb-4">
          <CardTitle className="font-serif text-lg">Current Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2 font-sans">
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No categories yet.</p>
          ) : (
            categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors group">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                <span className="text-xl w-7 flex-shrink-0">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                  {cat.image && (
                    <p className="text-xs text-muted-foreground truncate">{cat.image}</p>
                  )}
                </div>
                {cat.image && (
                  <div className="w-10 h-10 rounded-md overflow-hidden border flex-shrink-0">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving || saved} className="w-full h-11">
        {saving ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="mr-2 h-4 w-4" />Saved! Homepage updated.</>
        ) : (
          <><Save className="mr-2 h-4 w-4" />Save Categories</>
        )}
      </Button>
    </div>
  );
}
