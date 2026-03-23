import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import WelcomeScreen from "@/components/WelcomeScreen";

beforeEach(() => {
  cleanup();
});

describe("WelcomeScreen", () => {
  it("renders the welcome heading", () => {
    render(<WelcomeScreen onEnter={() => {}} />);
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
  });

  it("renders the tagline text", () => {
    render(<WelcomeScreen onEnter={() => {}} />);
    expect(screen.getByText("A small moment of calm, just for you.")).toBeInTheDocument();
  });

  it("renders an Enter button", () => {
    render(<WelcomeScreen onEnter={() => {}} />);
    expect(screen.getByRole("button", { name: /enter/i })).toBeInTheDocument();
  });

  it("calls onEnter when the Enter button is clicked", () => {
    const onEnter = vi.fn();
    render(<WelcomeScreen onEnter={onEnter} />);
    fireEvent.click(screen.getByRole("button", { name: /enter/i }));
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it("renders AudioPlayer when audioUrl is provided", () => {
    vi.spyOn(HTMLAudioElement.prototype, "play").mockImplementation(() => Promise.resolve());
    render(<WelcomeScreen audioUrl="/audio/welcome.mp3" onEnter={() => {}} />);
    expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
  });

  it("does not render AudioPlayer when audioUrl is null", () => {
    render(<WelcomeScreen audioUrl={null} onEnter={() => {}} />);
    expect(screen.queryByRole("button", { name: /play audio/i })).not.toBeInTheDocument();
  });
});
