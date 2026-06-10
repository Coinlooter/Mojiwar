import type { ReactNode } from "react";

import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <NavigationProgress />
      <SiteHeader />
      <main className="site-main" id="main-content">
        <div className="page-shell">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
