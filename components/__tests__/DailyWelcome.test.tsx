import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";

// Mock next/navigation before importing the component
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock content fetcher
vi.mock("@/lib/content", () => ({
  fetchWelcome: vi.fn(),
}));

import DailyWelcome from "@/components/DailyWelcome";
import { fetchWelcome } from "@/lib/content";

const mockedFetchWelcome = vi.mocked(fetchWelcome);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const SAMPLE_WELCOME = {
  id: "wlc-001",
  text: "Good morning, friend.",
  audioUrl: null as string | null,
  effectiveDateStart: "2026-01-01",
  effectiveDateEnd: "2026-12-31",
};

describe("DailyWelcome", () => {
  it("shows loading spinner before content loads", () => {
    mockedFetchWelcome.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DailyWelcome />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("displays the welcome message after loading", async () => {
    mockedFetchWelcome.mockResolvedValue({ ...SAMPLE_WELCOME });
    render(<DailyWelcome />);
    expect(await screen.findByText("Good morning, friend.")).toBeInTheDocument();
  });

  it("renders the Begin button after loading", async () => {
    mockedFetchWelcome.mockResolvedValue({ ...SAMPLE_WELCOME });
    render(<DailyWelcome />);
    expect(await screen.findByRole("button", { name: /begin/i })).toBeInTheDocument();
  });

  it("navigates to /affirmations on Begin click", async () => {
    mockedFetchWelcome.mockResolvedValue({ ...SAMPLE_WELCOME });
    render(<DailyWelcome />);
    const btn = await screen.findByRole("button", { name: /begin/i });
    fireEvent.click(btn);
    expect(mockPush).toHaveBeenCalledWith("/affirmations");
  });

  it("renders AudioPlayer when welcome has audio", async () => {
    vi.spyOn(HTMLAudioElement.prototype, "play").mockImplementation(() => Promise.resolve());
    mockedFetchWelcome.mockResolvedValue({ ...SAMPLE_WELCOME, audioUrl: "/audio/daily.mp3" });
    render(<DailyWelcome />);
    expect(await screen.findByRole("button", { name: /play audio/i })).toBeInTheDocument();
  });

  it("does not render AudioPlayer when welcome has no audio", async () => {
    mockedFetchWelcome.mockResolvedValue({ ...SAMPLE_WELCOME, audioUrl: null });
    render(<DailyWelcome />);
    expect(await screen.findByText("Good morning, friend.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /play audio/i })).not.toBeInTheDocument();
  });

  it("displays fallback message text when no date-matched welcome exists", async () => {
    const fallback = {
      id: "fallback",
      text: "Welcome. Take a moment for yourself.",
      audioUrl: null,
      effectiveDateStart: "2000-01-01",
      effectiveDateEnd: "2099-12-31",
    };
    mockedFetchWelcome.mockResolvedValue(fallback);
    render(<DailyWelcome />);
    expect(
      await screen.findByText("Welcome. Take a moment for yourself.")
    ).toBeInTheDocument();
  });

  it("stays in loading state if fetchWelcome never resolves", async () => {
    mockedFetchWelcome.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DailyWelcome />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    // Begin button should not be present
    expect(screen.queryByRole("button", { name: /begin/i })).not.toBeInTheDocument();
  });
});
