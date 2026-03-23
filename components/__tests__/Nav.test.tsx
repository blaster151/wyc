import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

import Nav from "@/components/Nav";
import { usePathname } from "next/navigation";

const mockedUsePathname = vi.mocked(usePathname);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockedUsePathname.mockReturnValue("/");
});

describe("Nav", () => {
  it("renders a menu toggle button", () => {
    render(<Nav />);
    expect(
      screen.getByRole("button", { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it("menu is closed by default", () => {
    render(<Nav />);
    expect(screen.queryByRole("link", { name: /home/i })).not.toBeInTheDocument();
  });

  it("opens menu on click and shows nav links", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /support/i })).toBeInTheDocument();
  });

  it("shows close button when menu is open", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(
      screen.getByRole("button", { name: /close menu/i })
    ).toBeInTheDocument();
  });

  it("closes menu when toggle is clicked again", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.queryByRole("link", { name: /home/i })).not.toBeInTheDocument();
  });

  it("closes menu when a nav link is clicked", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    fireEvent.click(screen.getByRole("link", { name: /support/i }));
    expect(screen.queryByRole("link", { name: /home/i })).not.toBeInTheDocument();
  });

  it("Home link points to /", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
  });

  it("Support link points to /support", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("link", { name: /support/i })).toHaveAttribute(
      "href",
      "/support"
    );
  });

  it("has aria-expanded attribute on toggle button", () => {
    render(<Nav />);
    const btn = screen.getByRole("button", { name: /open menu/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(btn);
    expect(
      screen.getByRole("button", { name: /close menu/i })
    ).toHaveAttribute("aria-expanded", "true");
  });
});
