import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";

describe("billing worker", () => {
  it("returns live Stripe mode on /api/health", async () => {
    const request = new Request("http://example.com/api/health");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, provider: "stripe", mode: "live" });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await SELF.fetch("http://example.com/");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });
});
