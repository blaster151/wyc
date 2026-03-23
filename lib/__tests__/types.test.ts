import { describe, it, expect } from "vitest";
import type { Affirmation, WelcomeMessage, SiteConfig, AffirmationsFile, WelcomesFile } from "@/lib/types";

describe("types", () => {
  it("Affirmation shape is valid", () => {
    const aff: Affirmation = {
      id: "aff-001",
      text: "Test affirmation",
      attribution: null,
      imageUrl: null,
      active: true,
    };
    expect(aff.id).toBe("aff-001");
    expect(aff.active).toBe(true);
  });

  it("Affirmation optional fields can be omitted", () => {
    const aff: Affirmation = {
      id: "aff-002",
      text: "Minimal",
      active: false,
    };
    expect(aff.attribution).toBeUndefined();
    expect(aff.imageUrl).toBeUndefined();
  });

  it("WelcomeMessage shape is valid", () => {
    const wlc: WelcomeMessage = {
      id: "wlc-001",
      text: "Welcome",
      audioUrl: "https://example.com/audio.mp3",
      effectiveDateStart: "2026-01-01",
      effectiveDateEnd: "2026-12-31",
    };
    expect(wlc.effectiveDateStart).toBe("2026-01-01");
  });

  it("SiteConfig shape is valid", () => {
    const cfg: SiteConfig = {
      version: 1,
      appName: "WYC",
      timerDurationMs: 7000,
      donationUrl: "https://ko-fi.com/test",
      supportNote: "Thanks!",
    };
    expect(cfg.timerDurationMs).toBe(7000);
  });

  it("AffirmationsFile wraps affirmations with version", () => {
    const file: AffirmationsFile = {
      version: 1,
      affirmations: [],
    };
    expect(file.version).toBe(1);
    expect(file.affirmations).toEqual([]);
  });

  it("WelcomesFile includes fallback", () => {
    const file: WelcomesFile = {
      version: 1,
      welcomes: [],
      fallback: { text: "Default welcome" },
    };
    expect(file.fallback.text).toBe("Default welcome");
  });
});
