"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, GraduationCap, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/colleges", label: "Colleges" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/community", label: "Community" },
  { href: "/ambassadors", label: "Ambassadors" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const isVerified = user?.verificationStatus === "verified";

  const authArea = (mobile = false) => {
    if (loading) {
      return <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />;
    }
    if (!user) {
      return (
        <>
          <Button variant={mobile ? "outline" : "ghost"} className={mobile ? "flex-1" : ""} asChild>
            <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
          </Button>
          <Button className={mobile ? "flex-1" : ""} asChild>
            <Link href="/signup" onClick={() => setOpen(false)}>Signup</Link>
          </Button>
        </>
      );
    }
    return (
      <div className={cn("flex items-center gap-2", mobile && "w-full flex-col items-stretch")}>
        {user.role === "admin" ? (
          <Button variant="outline" asChild>
            <Link href="/admin" onClick={() => setOpen(false)}>
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          </Button>
        ) : isVerified ? (
          <Badge variant="verified" className="h-9 px-3">
            <BadgeCheck className="h-4 w-4" /> Verified
          </Badge>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/verify" onClick={() => setOpen(false)}>
              <BadgeCheck className="h-4 w-4" /> Get Verified
            </Link>
          </Button>
        )}
        <span className="hidden max-w-[140px] truncate text-sm font-medium sm:inline">
          {user.name}
        </span>
        <Button variant="ghost" size={mobile ? "default" : "icon"} onClick={onLogout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
          {mobile && <span>Log out</span>}
        </Button>
      </div>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all",
        scrolled ? "glass shadow-sm" : "bg-transparent",
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg">
            Campus<span className="text-gradient">Connect</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {authArea()}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="glass border-t lg:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">{authArea(true)}</div>
          </div>
        </div>
      )}
    </header>
  );
}
