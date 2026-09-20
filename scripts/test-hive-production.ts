// HIVE AI — PRODUCTION CODE INTEGRATION TESTS
// Imports and tests the REAL callGeminiEndpoint from src/lib/ai/hive.ts.
// Run: npx tsx scripts/test-hive-production.ts
// No live API calls. No credentials. Uses mock fetch injection.
import { callGeminiEndpoint } from "../src/lib/ai/hive";
import type { GeminiCallResult } from "../src/lib/ai/hive";

// ---- Mock fetch factory ----
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
function buildMock(scenarios: Array<{ body: object | null; status?: number; throws?: string }>): FetchLike {
  let idx = 0;
  return async () => {
    const s = scenarios[idx] ?? scenarios[scenarios.length - 1];
    idx++;
    if (s.throws) throw new Error(s.throws);
    return new Response(JSON.stringify(s.body), { status: s.status ?? 200 });
  };
}

// ---- Helpers ----
function gem(t: string, fr = "STOP") {
  return { candidates: [{ finishReason: fr, content: { parts: [{ text: t }] } }] };
}
function empty(fr = "OTHER") { return { candidates: [{ finishReason: fr }] }; }
const DUMMY_KEY = "DUMMY_KEY_FOR_TESTS";
const DUMMY_SYSTEM = "test system prompt";
const DUMMY_CONTENTS: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [
  { role: "user", parts: [{ text: "hello" }] },
];

let passed = 0, failed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); console.log("  PASS:", name); passed++; }
  catch (e) { console.error("  FAIL:", name, "--", e instanceof Error ? e.message : e); failed++; }
}
function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }

async function main() {
  console.log("\n=== HIVE AI PRODUCTION CODE INTEGRATION TESTS ===");
  console.log("(importing from src/lib/ai/hive.ts — real production code)\n");

  // ---- Group 1: callGeminiEndpoint behaviour ----
  console.log("Group 1: callGeminiEndpoint — production code unit tests\n");

  await test("[PROD] Valid 200 response -> ok=true with text", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: gem(JSON.stringify({ reply: "hi", needsLeadCapture: false })) }])
    );
    assert(r.ok && r.text.length > 0, "Expected ok=true and text present");
    assert(r.finishReason === "STOP", "Expected finishReason=STOP");
  });

  await test("[PROD] HTTP 503 -> ok=false, httpStatus=503", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: {}, status: 503 }])
    );
    assert(!r.ok && r.httpStatus === 503, "Expected ok=false httpStatus=503");
  });

  await test("[PROD] Empty candidates array -> ok=false", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: { candidates: [] } }])
    );
    assert(!r.ok, "Expected ok=false for empty candidates");
  });

  await test("[PROD] finishReason=OTHER no text -> ok=false, finishReason captured", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: empty("OTHER") }])
    );
    assert(!r.ok, "Expected ok=false");
    assert(r.finishReason === "OTHER", "Expected finishReason=OTHER");
  });

  await test("[PROD] finishReason=SAFETY no text -> ok=false", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: empty("SAFETY") }])
    );
    assert(!r.ok && r.finishReason === "SAFETY", "Expected ok=false finishReason=SAFETY");
  });

  await test("[PROD] Fetch throws -> ok=false, httpStatus=0, fetchError set", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: null, throws: "ECONNRESET" }])
    );
    assert(!r.ok && r.httpStatus === 0 && r.fetchError === "ECONNRESET", "Expected fetch error");
  });

  await test("[PROD] gemini-3.8-flash: thinkingConfig NOT included in request body", async () => {
    let capturedBody: Record<string, unknown> = {};
    const mf: FetchLike = async (_, o) => {
      capturedBody = JSON.parse(o.body as string);
      return new Response(JSON.stringify(gem("x")), { status: 200 });
    };
    await callGeminiEndpoint("gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS, mf);
    const cfg = capturedBody.generationConfig as Record<string, unknown>;
    assert(!("thinkingConfig" in cfg), "thinkingConfig must be ABSENT for gemini-3.8-flash");
  });

  await test("[PROD] gemini-2.5-flash: thinkingConfig WITH thinkingBudget:0 sent", async () => {
    let capturedBody: Record<string, unknown> = {};
    const mf: FetchLike = async (_, o) => {
      capturedBody = JSON.parse(o.body as string);
      return new Response(JSON.stringify(gem("x")), { status: 200 });
    };
    await callGeminiEndpoint("gemini-2.5-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS, mf);
    const cfg = capturedBody.generationConfig as Record<string, unknown>;
    const tc = cfg.thinkingConfig as Record<string, unknown>;
    assert(tc?.thinkingBudget === 0, "thinkingBudget must be 0 for gemini-2.5-flash");
  });

  await test("[PROD] Endpoint URL contains model name (URL-encoded)", async () => {
    let capturedUrl = "";
    const mf: FetchLike = async (url, _) => {
      capturedUrl = url;
      return new Response(JSON.stringify(gem("x")), { status: 200 });
    };
    await callGeminiEndpoint("gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS, mf);
    assert(capturedUrl.includes("gemini-3.8-flash"), "URL must contain the model name");
    assert(capturedUrl.includes(":generateContent"), "URL must end with :generateContent");
  });

  await test("[PROD] API key is passed as x-goog-api-key header (not in URL or body)", async () => {
    let capturedHeaders: Record<string, string> = {};
    let capturedUrl = "";
    let capturedBody: Record<string, unknown> = {};
    const mf: FetchLike = async (url, o) => {
      capturedUrl = url;
      capturedHeaders = Object.fromEntries(new Headers(o.headers as HeadersInit).entries());
      capturedBody = JSON.parse(o.body as string);
      return new Response(JSON.stringify(gem("x")), { status: 200 });
    };
    await callGeminiEndpoint("gemini-3.8-flash", "MY_TEST_KEY", DUMMY_SYSTEM, DUMMY_CONTENTS, mf);
    assert(capturedHeaders["x-goog-api-key"] === "MY_TEST_KEY", "API key must be in x-goog-api-key header");
    assert(!capturedUrl.includes("MY_TEST_KEY"), "API key must NOT appear in the URL");
    const bodyStr = JSON.stringify(capturedBody);
    assert(!bodyStr.includes("MY_TEST_KEY"), "API key must NOT appear in the request body");
  });

  await test("[PROD] Missing candidates key entirely -> ok=false", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: {} }])
    );
    assert(!r.ok, "Expected ok=false when candidates key missing");
  });

  await test("[PROD] Candidate with null content -> ok=false", async () => {
    const r = await callGeminiEndpoint(
      "gemini-3.8-flash", DUMMY_KEY, DUMMY_SYSTEM, DUMMY_CONTENTS,
      buildMock([{ body: { candidates: [{ finishReason: "STOP", content: null }] } }])
    );
    assert(!r.ok, "Expected ok=false when content is null");
  });

  console.log("\n=== Results: " + passed + " passed, " + failed + " failed ===\n");
  if (failed > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });