"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  getRoutePath,
  NAVIGATION_START_EVENT,
} from "@/lib/ui/navigation-feedback";

const PROGRESS_FALLBACK_MS = 10_000;

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const previousPathname = useRef(pathname);
  const pathnameRef = useRef(pathname);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      setActive(false);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      previousPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const stopProgress = () => {
      setActive(false);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

    const startProgress = () => {
      setActive(true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(stopProgress, PROGRESS_FALLBACK_MS);
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
          !link.hasAttribute("download") &&
          getRoutePath(href) !== pathnameRef.current
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
      stopProgress();
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
