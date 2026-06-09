"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { NAVIGATION_START_EVENT } from "@/lib/ui/navigation-feedback";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      setActive(false);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const startProgress = () => {
      setActive(true);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");

      if (link) {
        const href = link.getAttribute("href");

        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("//") &&
          link.getAttribute("target") !== "_blank" &&
          !link.hasAttribute("download")
        ) {
          startProgress();
        }

        return;
      }

      const submitControl = target.closest(
        'button[type="submit"], input[type="submit"]',
      );

      if (submitControl instanceof HTMLButtonElement && submitControl.disabled) {
        return;
      }

      if (submitControl) {
        startProgress();
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener(NAVIGATION_START_EVENT, startProgress);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener(NAVIGATION_START_EVENT, startProgress);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`nav-progress${active ? " is-active" : ""}`}
      role="presentation"
    />
  );
}
