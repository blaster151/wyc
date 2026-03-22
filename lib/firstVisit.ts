const STORAGE_KEY = "wyc_visited";

export function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === null;
}

export function markVisited(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "true");
}
