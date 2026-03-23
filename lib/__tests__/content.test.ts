import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAffirmations, fetchWelcome, fetchConfig } from "@/lib/content";

function mockFetch(data: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchAffirmations", () => {
  it("returns only active affirmations", async () => {
    global.fetch = mockFetch({
      version: 1,
      affirmations: [
        { id: "a1", text: "Active one", active: true },
        { id: "a2", text: "Inactive", active: false },
        { id: "a3", text: "Active two", active: true },
      ],
    });

    const result = await fetchAffirmations();
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.id)).toEqual(["a1", "a3"]);
  });

  it("returns empty array on fetch failure", async () => {
    global.fetch = mockFetch(null, false);
    const result = await fetchAffirmations();
    expect(result).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const result = await fetchAffirmations();
    expect(result).toEqual([]);
  });

  it("fetches from the correct URL", async () => {
    global.fetch = mockFetch({ version: 1, affirmations: [] });
    await fetchAffirmations();
    expect(global.fetch).toHaveBeenCalledWith("/content/affirmations.json");
  });
});

describe("fetchWelcome", () => {
  it("returns the welcome matching the given date", async () => {
    global.fetch = mockFetch({
      version: 1,
      welcomes: [
        {
          id: "w1",
          text: "March message",
          audioUrl: null,
          effectiveDateStart: "2026-03-01",
          effectiveDateEnd: "2026-03-31",
        },
        {
          id: "w2",
          text: "April message",
          audioUrl: null,
          effectiveDateStart: "2026-04-01",
          effectiveDateEnd: "2026-04-30",
        },
      ],
      fallback: { text: "Fallback" },
    });

    const result = await fetchWelcome(new Date("2026-03-15"));
    expect(result.id).toBe("w1");
    expect(result.text).toBe("March message");
  });

  it("returns fallback text when no date range matches", async () => {
    global.fetch = mockFetch({
      version: 1,
      welcomes: [
        {
          id: "w1",
          text: "Old message",
          audioUrl: null,
          effectiveDateStart: "2025-01-01",
          effectiveDateEnd: "2025-12-31",
        },
      ],
      fallback: { text: "Custom fallback" },
    });

    const result = await fetchWelcome(new Date("2026-03-15"));
    expect(result.text).toBe("Custom fallback");
  });

  it("returns default fallback on fetch failure", async () => {
    global.fetch = mockFetch(null, false);
    const result = await fetchWelcome(new Date("2026-03-15"));
    expect(result.text).toBe("Welcome. Take a moment for yourself.");
    expect(result.id).toBe("fallback");
  });

  it("returns default fallback on network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const result = await fetchWelcome(new Date("2026-03-15"));
    expect(result.text).toBe("Welcome. Take a moment for yourself.");
  });
});

describe("fetchConfig", () => {
  it("returns parsed config", async () => {
    const config = {
      version: 1,
      appName: "WYC",
      timerDurationMs: 7000,
      donationUrl: "https://ko-fi.com/test",
      supportNote: "Thanks!",
    };
    global.fetch = mockFetch(config);

    const result = await fetchConfig();
    expect(result).toEqual(config);
  });

  it("returns default config on failure", async () => {
    global.fetch = mockFetch(null, false);
    const result = await fetchConfig();
    expect(result.appName).toBe("WYC");
    expect(result.timerDurationMs).toBe(7000);
    expect(result.donationUrl).toBe("");
  });

  it("fetches from the correct URL", async () => {
    global.fetch = mockFetch({ version: 1, appName: "WYC", timerDurationMs: 7000, donationUrl: "", supportNote: "" });
    await fetchConfig();
    expect(global.fetch).toHaveBeenCalledWith("/content/config.json");
  });
});
