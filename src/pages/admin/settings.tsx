import { useEffect, useState } from "react";
import { Loader2, Phone, MessageCircle, Megaphone, Save, CheckCircle2 } from "lucide-react";
import { getSiteSettings, saveSiteSettings, SiteSettings } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings>({ whatsapp: "", phone: "", announcement: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 font-sans">Configure your store's contact channel and announcements.</p>
      </div>

      <Card className="border shadow-sm bg-card">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="font-serif text-lg">WhatsApp Contact</CardTitle>
              <CardDescription className="font-sans text-sm">
                Customers will see a WhatsApp button to reach you directly.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5 font-sans">
          <div className="space-y-2">
            <label className="text-sm font-medium">WhatsApp Number</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md border font-mono">+91</span>
              <Input
                placeholder="9876543210"
                value={settings.whatsapp || ""}
                onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value.replace(/\D/g, "") }))}
                className="font-mono"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter 10-digit Indian mobile number. A green WhatsApp button will appear on the public site.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone / Call Number <span className="text-muted-foreground font-normal">(optional)</span></label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="9876543210"
                value={settings.phone || ""}
                onChange={e => setSettings(s => ({ ...s, phone: e.target.value.replace(/\D/g, "") }))}
                className="font-mono"
                maxLength={10}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-card">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="font-serif text-lg">Announcement Banner</CardTitle>
              <CardDescription className="font-sans text-sm">
                Show a top banner on the site. Leave blank to hide it.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 font-sans">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Input
              placeholder="e.g. Free delivery on orders above ₹999 🎉"
              value={settings.announcement || ""}
              onChange={e => setSettings(s => ({ ...s, announcement: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Supports emojis. Shows as a thin gold bar at the top of every page.</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving || saved} className="w-full h-11">
        {saving ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="mr-2 h-4 w-4" />Saved!</>
        ) : (
          <><Save className="mr-2 h-4 w-4" />Save Settings</>
        )}
      </Button>
    </div>
  );
}
