"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#calculator", label: "Calculator" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Credex home">
            <span className="flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/12 text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_12px_rgba(94,234,212,0.3)]">
              <BarChart3 className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-normal sm:text-base">
              Credex Audit
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/audit">
                <Sparkles aria-hidden="true" />
                Start audit
              </Link>
            </Button>
            {/* Mobile hamburger */}
            <button
              className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="mobile-menu z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="flex items-center justify-between py-2">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/12 text-primary">
                <BarChart3 className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">Credex Audit</span>
            </Link>
            <button
              className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <Button asChild size="lg" className="w-full">
              <Link href="/audit" onClick={() => setMobileOpen(false)}>
                <Sparkles aria-hidden="true" />
                Start free audit
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
