import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AudioPlayer from "@/components/AudioPlayer";

// Mock HTMLAudioElement play/pause since jsdom doesn't implement them
beforeEach(() => {
  cleanup();
  vi.spyOn(HTMLAudioElement.prototype, "play").mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLAudioElement.prototype, "pause").mockImplementation(() => {});
});

describe("AudioPlayer", () => {
  it("renders nothing when src is undefined", () => {
    const { container } = render(<AudioPlayer src={undefined} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when src is null", () => {
    const { container } = render(<AudioPlayer src={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a play button when src is provided", () => {
    render(<AudioPlayer src="/audio/test.mp3" />);
    const button = screen.getByRole("button", { name: "Play audio" });
    expect(button).toBeInTheDocument();
  });

  it("toggles to pause label after clicking play", () => {
    render(<AudioPlayer src="/audio/test.mp3" />);
    const button = screen.getByRole("button", { name: "Play audio" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Pause audio" })).toBeInTheDocument();
  });

  it("toggles back to play label after clicking pause", () => {
    render(<AudioPlayer src="/audio/test.mp3" />);
    const button = screen.getByRole("button", { name: "Play audio" });
    fireEvent.click(button); // play
    fireEvent.click(screen.getByRole("button", { name: "Pause audio" })); // pause
    expect(screen.getByRole("button", { name: "Play audio" })).toBeInTheDocument();
  });

  it("renders an audio element with the correct src", () => {
    const { container } = render(<AudioPlayer src="/audio/test.mp3" />);
    const audio = container.querySelector("audio");
    expect(audio).toHaveAttribute("src", "/audio/test.mp3");
  });
});
