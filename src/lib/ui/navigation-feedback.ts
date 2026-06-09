export const NAVIGATION_START_EVENT = "app:navigation-start";

export function signalNavigationStart() {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}
