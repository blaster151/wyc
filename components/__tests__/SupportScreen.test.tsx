import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";

vi.mock("@/lib/content", () => ({
  fetchConfig: vi.fn(),
}));

import SupportScreen from "@/components/SupportScreen";
import { fetchConfig } from "@/lib/content";

const mockedFetchConfig = vi.mocked(fetchConfig);

const SAMPLE_CONFIG = {
  version: 1,
  appName: "WYC",
  timerDurationMs: 7000,
  donationUrl: "https://ko-fi.com/example",
  supportNote: "Made with love. Consider supporting.",
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SupportScreen", () => {
  it("shows loading spinner while config loads", () => {
    mockedFetchConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<SupportScreen />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders the support note from config", async () => {
    mockedFetchConfig.mockResolvedValue({ ...SAMPLE_CONFIG });
    await act(async () => {
      render(<SupportScreen />);
    });
    expect(
      screen.getByText("Made with love. Consider supporting.")
    ).toBeInTheDocument();
  });

  it("renders a donation link that opens in new tab", async () => {
    mockedFetchConfig.mockResolvedValue({ ...SAMPLE_CONFIG });
    await act(async () => {
      render(<SupportScreen />);
    });
    const link = screen.getByRole("link", { name: /support this project/i });
    expect(link).toHaveAttribute("href", "https://ko-fi.com/example");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a Start again link to home", async () => {
    mockedFetchConfig.mockResolvedValue({ ...SAMPLE_CONFIG });
    await act(async () => {
      render(<SupportScreen />);
    });
    const link = screen.getByRole("link", { name: /start again/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("hides donation link when donationUrl is empty", async () => {
    mockedFetchConfig.mockResolvedValue({ ...SAMPLE_CONFIG, donationUrl: "" });
    await act(async () => {
      render(<SupportScreen />);
    });
    expect(
      screen.queryByRole("link", { name: /support this project/i })
    ).not.toBeInTheDocument();
  });

  it("hides support note when supportNote is empty", async () => {
    mockedFetchConfig.mockResolvedValue({ ...SAMPLE_CONFIG, supportNote: "" });
    await act(async () => {
      render(<SupportScreen />);
    });
    expect(
      screen.queryByText("Made with love. Consider supporting.")
    ).not.toBeInTheDocument();
  });
});
