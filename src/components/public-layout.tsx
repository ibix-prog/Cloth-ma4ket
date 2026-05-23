import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, Moon, Sun, LogOut, User, Crown } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { AnnouncementBar } from "@/components/announcement-bar";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { cartCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/?category=Sarees", label: "Sarees" },
    { href: "/?category=Lehengas", label: "Lehengas" },
    { href: "/?category=Kurta Sets", label: "Kurta Sets" },
    { href: "/?category=Jewelry", label: "Jewelry" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <AnnouncementBar />
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Crown className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
              <span className="font-serif text-xl font-bold text-primary tracking-tight">
                Shahi Vastram
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary rounded-md hover:bg-primary/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-md transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link href="/cart" className="relative p-2 text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-md transition-all">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="hidden sm:flex items-center gap-1">
                  {isAdmin && (
                    <Link href="/admin" className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Admin
                    </Link>
                  )}
                  <Link href="/orders" className="p-2 text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-md transition-all" title="My Orders">
                    <User className="w-5 h-5" />
                  </Link>
                  <button onClick={signOut} className="p-2 text-foreground/70 hover:text-destructive hover:bg-destructive/5 rounded-md transition-all" title="Sign out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors shadow-sm">
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-foreground/70 hover:text-primary rounded-md"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background/98 backdrop-blur-md">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-2 mt-2 space-y-1">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-md">
                        <Crown className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-primary/5 rounded-md">
                      <User className="w-4 h-4" /> My Orders
                    </Link>
                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-md w-full text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-md">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Main content ─── */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
