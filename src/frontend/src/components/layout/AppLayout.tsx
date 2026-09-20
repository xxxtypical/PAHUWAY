import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import type { ReactNode } from "react";

/**
 * Persistent marketplace shell: sticky header, routed content, mobile bottom
 * navigation, and the caffeine.ai attribution footer.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 sm:pt-6 md:pb-12">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <footer className="border-t border-border bg-secondary/60 px-4 py-6 pb-24 md:pb-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>
            Sagana — Filipino food, delivered across Metro Manila and beyond.
          </p>
          <p>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
