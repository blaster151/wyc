import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/content", () => ({
  fetchAffirmations: vi.fn(),
  fetchConfig: vi.fn(),
}));

vi.mock("@/lib/shuffle", () => ({
  shuffleArray: vi.fn((arr: unknown[]) => [...arr]),
}));

import AffirmationFlow from "@/components/AffirmationFlow";
import { fetchAffirmations, fetchConfig } from "@/lib/content";
import { shuffleArray } from "@/lib/shuffle";

const mockedFetchAffirmations = vi.mocked(fetchAffirmations);
const mockedFetchConfig = vi.mocked(fetchConfig);
const mockedShuffle = vi.mocked(shuffleArray);

const SAMPLE_AFFS = [
  { id: "aff-001", text: "First affirmation.", attribution: null, imageUrl: null, active: true },
  { id: "aff-002", text: "Second affirmation.", attribution: null, imageUrl: null, active: true },
  { id: "aff-003", text: "Third affirmation.", attribution: null, imageUrl: null, active: true },
];

const SAMPLE_CONFIG = {
  version: 1,
  appName: "WYC",
  timerDurationMs: 7000,
  donationUrl: "https://example.com",
  supportNote: "Thanks!",
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useFakeTimers();
  mockedShuffle.mockImplementation((arr) => [...arr]);
});

describe("AffirmationFlow", () => {
  it("shows loading spinner while fetching", () => {
    mockedFetchAffirmations.mockReturnValue(new Promise(() => {}));
    mockedFetchConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AffirmationFlow onComplete={() => {}} />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows empty-state message when no affirmations loaded", async () => {
    mockedFetchAffirmations.mockResolvedValue([]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });
    expect(screen.getByText(/no affirmations available/i)).toBeInTheDocument();
  });

  it("renders the first affirmation after loading", async () => {
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });
    expect(screen.getByText("First affirmation.")).toBeInTheDocument();
  });

  it("renders Next button (not Finish) on non-last card", async () => {
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /finish/i })).not.toBeInTheDocument();
  });

  it("advances to next affirmation on Next click", async () => {
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Second affirmation.")).toBeInTheDocument();
  });

  it("shows Finish button on last card", async () => {
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });

    // Advance to last card
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Third affirmation.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finish/i })).toBeInTheDocument();
  });

  it("calls onComplete when Finish is clicked", async () => {
    const onComplete = vi.fn();
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={onComplete} />);
    });

    // Advance through all cards
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /finish/i }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("user can advance before timer finishes (soft nudge)", async () => {
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });

    // Click Next immediately — without waiting for timer
    const nextBtn = screen.getByRole("button", { name: /next/i });
    expect(nextBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);
    expect(screen.getByText("Second affirmation.")).toBeInTheDocument();
  });

  it("renders a presence timer (progressbar)", async () => {
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("calls shuffleArray once on initial load", async () => {
    mockedFetchAffirmations.mockResolvedValue([...SAMPLE_AFFS]);
    mockedFetchConfig.mockResolvedValue(SAMPLE_CONFIG);
    await act(async () => {
      render(<AffirmationFlow onComplete={() => {}} />);
    });
    expect(mockedShuffle).toHaveBeenCalledOnce();
  });
});
