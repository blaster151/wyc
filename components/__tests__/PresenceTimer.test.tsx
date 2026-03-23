import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import PresenceTimer from "@/components/PresenceTimer";

beforeEach(() => {
  cleanup();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PresenceTimer", () => {
  it("renders a progressbar", () => {
    render(<PresenceTimer durationMs={5000} onComplete={() => {}} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<PresenceTimer durationMs={5000} onComplete={() => {}} />);
    expect(
      screen.getByRole("progressbar", { name: /presence timer/i })
    ).toBeInTheDocument();
  });

  it("calls onComplete after durationMs elapses", () => {
    const onComplete = vi.fn();
    render(<PresenceTimer durationMs={3000} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does not call onComplete before durationMs", () => {
    const onComplete = vi.fn();
    render(<PresenceTimer durationMs={5000} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("cleans up timeout on unmount", () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <PresenceTimer durationMs={5000} onComplete={onComplete} />
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
