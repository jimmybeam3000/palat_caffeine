import { Outlet } from "@tanstack/react-router";
import { NavBar } from "./NavBar";

export function Layout() {
  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground font-body">
      <NavBar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <footer className="bg-card border-t border-border/40 py-3 px-6 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
        <span>
          © {new Date().getFullYear()} Palantir Intel — Intelligence Operations
          Platform
        </span>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-smooth"
        >
          Built with love using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
