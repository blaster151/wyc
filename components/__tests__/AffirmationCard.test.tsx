import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AffirmationCard from "@/components/AffirmationCard";
import type { Affirmation } from "@/lib/types";

beforeEach(() => {
  cleanup();
});

const BASE: Affirmation = {
  id: "aff-001",
  text: "You are exactly where you need to be.",
  attribution: null,
  imageUrl: null,
  active: true,
};

describe("AffirmationCard", () => {
  it("renders the affirmation text", () => {
    render(<AffirmationCard affirmation={BASE} />);
    expect(
      screen.getByText("You are exactly where you need to be.")
    ).toBeInTheDocument();
  });

  it("does not render attribution when null", () => {
    render(<AffirmationCard affirmation={BASE} />);
    // Only the main text paragraph should be present
    const paragraphs = screen.getAllByRole("paragraph");
    expect(paragraphs).toHaveLength(1);
  });

  it("renders attribution when provided", () => {
    render(
      <AffirmationCard
        affirmation={{ ...BASE, attribution: "Thich Nhat Hanh" }}
      />
    );
    expect(screen.getByText(/Thich Nhat Hanh/)).toBeInTheDocument();
  });

  it("applies background image style when imageUrl is provided", () => {
    const { container } = render(
      <AffirmationCard
        affirmation={{ ...BASE, imageUrl: "/images/sky.jpg" }}
      />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.backgroundImage).toContain("/images/sky.jpg");
  });

  it("uses solid background color when no imageUrl", () => {
    const { container } = render(
      <AffirmationCard affirmation={BASE} />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe("rgb(26, 26, 46)");
  });

  it("renders with full-screen layout classes", () => {
    const { container } = render(
      <AffirmationCard affirmation={BASE} />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains("min-h-screen")).toBe(true);
  });
});
