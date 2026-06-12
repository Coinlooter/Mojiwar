export const NAVIGATION_START_EVENT = "app:navigation-start";

export function getRoutePath(href: string) {
  const withoutHash = href.split("#")[0] ?? href;
  const withoutQuery = withoutHash.split("?")[0] ?? withoutHash;

  return withoutQuery || "/";
}

export function signalNavigationStart() {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}
