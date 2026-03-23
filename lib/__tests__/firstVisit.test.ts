import { describe, it, expect, beforeEach } from "vitest";
import { isFirstVisit, markVisited } from "@/lib/firstVisit";

describe("firstVisit", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("isFirstVisit", () => {
    it("returns true when localStorage key is absent", () => {
      expect(isFirstVisit()).toBe(true);
    });

    it("returns false when localStorage key is set", () => {
      localStorage.setItem("wyc_visited", "true");
      expect(isFirstVisit()).toBe(false);
    });
  });

  describe("markVisited", () => {
    it("sets the localStorage key", () => {
      expect(localStorage.getItem("wyc_visited")).toBeNull();
      markVisited();
      expect(localStorage.getItem("wyc_visited")).toBe("true");
    });

    it("makes isFirstVisit return false after being called", () => {
      expect(isFirstVisit()).toBe(true);
      markVisited();
      expect(isFirstVisit()).toBe(false);
    });
  });
});
