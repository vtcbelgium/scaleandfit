// tests/url-state.test.ts
import { describe, expect, it } from "vitest";
import { encodeStudioState, decodeStudioState, buildShareUrl } from "../src/utils/url-state";

describe("url-state", () => {
  it("round-trip encodeStudioState -> decodeStudioState", () => {
    const state: { suite: string; a: number; b: number; metric: boolean } = { suite: "visual-sizer", a: 55, b: 65, metric: true };
    const encoded = encodeStudioState(state);
    const decoded = decodeStudioState(encoded);
    expect(decoded).toEqual({ suite: "visual-sizer", a: "55", b: "65", metric: "true" });
  });

  it("hash override precedence over query search params", () => {
    const search = "?a=10&b=20";
    const hash = "#a=30&c=40";
    const decoded = decodeStudioState(search, hash);
    expect(decoded).toEqual({ a: "30", b: "20", c: "40" });
  });

  it("buildShareUrl strips old params cleanly", () => {
    const originAndPath = "https://scaleandfit.com/visual-sizer/?old=1";
    const state: { a: number; b: number } = { a: 55, b: 65 };
    const shareUrl = buildShareUrl(originAndPath, state);
    expect(shareUrl).toBe("https://scaleandfit.com/visual-sizer/?a=55&b=65");
  });
});
