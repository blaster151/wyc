import { describe, it, expect, vi } from "vitest";
import { shuffleArray } from "@/lib/shuffle";

describe("shuffleArray", () => {
  it("returns a new array (does not mutate original)", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  it("contains all original elements", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffleArray(original);
    expect(result).toHaveLength(original.length);
    expect(result.sort()).toEqual([...original].sort());
  });

  it("handles empty array", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("handles single-element array", () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  it("eventually produces a different order (probabilistic)", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // Run 10 shuffles — at least one should differ from original order
    const results = Array.from({ length: 10 }, () => shuffleArray(original));
    const someDifferent = results.some(
      (r) => JSON.stringify(r) !== JSON.stringify(original)
    );
    expect(someDifferent).toBe(true);
  });

  it("works with non-number types", () => {
    const words = ["hello", "world", "foo"];
    const result = shuffleArray(words);
    expect(result).toHaveLength(3);
    expect(result.sort()).toEqual(["foo", "hello", "world"]);
  });
});
