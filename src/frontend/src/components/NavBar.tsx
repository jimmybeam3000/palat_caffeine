import { Link } from "@tanstack/react-router";
import {
  Activity,
  Database,
  GitFork,
  LayoutDashboard,
  Menu,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/graph", label: "Entity Graph", icon: GitFork },
  { to: "/investigation", label: "Investigation", icon: Search },
  { to: "/feed", label: "Ops Feed", icon: Activity },
  { to: "/integration", label: "Integration Hub", icon: Database },
] as const;

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-card border-b border-border/40 shadow-sm"
      data-ocid="nav"
    >
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 transition-smooth hover:opacity-80"
            data-ocid="nav-logo"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/20 border border-primary/40">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-semibold text-sm tracking-wide text-foreground">
              Palantir<span className="text-primary ml-0.5">Intel</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-smooth",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  "[&.active]:text-foreground [&.active]:bg-primary/10 [&.active]:border-b-2 [&.active]:border-primary [&.active]:rounded-b-none",
                )}
                data-ocid={`nav-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.18_150)] animate-pulse" />
              Live
            </span>
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            className="md:hidden p-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            data-ocid="nav-burger"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-border/40 bg-card py-2 px-4 flex flex-col gap-1"
          data-ocid="nav-mobile-menu"
        >
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium transition-smooth",
                "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                "[&.active]:text-foreground [&.active]:bg-primary/10 [&.active]:border-l-2 [&.active]:border-primary [&.active]:pl-[10px]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
