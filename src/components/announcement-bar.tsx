import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/firestore";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getSiteSettings().then(s => {
      if (s.announcement && s.announcement.trim()) {
        setMessage(s.announcement.trim());
      }
    });
  }, []);

  if (!message || dismissed) return null;

  return (
    <div className="w-full bg-primary text-primary-foreground text-center text-sm font-sans font-medium py-2 px-4 relative flex items-center justify-center gap-2">
      <span>{message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
