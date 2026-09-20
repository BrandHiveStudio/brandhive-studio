import { callGeminiEndpoint } from "../src/lib/ai/hive.ts";

const checks = [];
const test = (name, condition) => {
  checks.push({ name, pass: Boolean(condition) });
};

const mock = (body, status = 200) => async (url, init) => {
  return new Response(JSON.stringify(body), { status });
};

const contents = [{ role: "user", parts: [{ text: "Hello" }] }];

const valid = await callGeminiEndpoint(
  "models/gemini-3.8-flash", "MOCK_KEY", "mock prompt", contents,
  async (url, init) => {
    const body = JSON.parse(init.body);
    test("model path normalized", url.includes("/gemini-3.8-flash:generateContent"));
    test("API key sent in header", init.headers["x-goog-api-key"] === "MOCK_KEY");
    test("non-thinking model omits thinkingConfig", !("thinkingConfig" in body.generationConfig));
    return new Response(JSON.stringify({
      candidates: [{ finishReason: "STOP", content: { parts: [{ text: '{"reply":"Mock success"}' }] } }]
    }), { status: 200 });
  }
);
test("valid response extracted", valid.ok && valid.text === '{"reply":"Mock success"}');

const thinking = await callGeminiEndpoint(
  "gemini-2.5-flash", "MOCK_KEY", "prompt", contents,
  async (url, init) => {
    const body = JSON.parse(init.body);
    test("thinking model gets thinkingBudget 0", body.generationConfig.thinkingConfig?.thinkingBudget === 0);
    return new Response(JSON.stringify({ candidates: [] }), { status: 200 });
  }
);
test("empty candidates safely rejected", !thinking.ok && thinking.text === "");

const thrown = await callGeminiEndpoint(
  "gemini-3.8-flash", "MOCK_KEY", "prompt", contents,
  async () => { throw new Error("MOCK_NETWORK_FAILURE"); }
);
test("fetch exception safely handled", !thrown.ok && thrown.httpStatus === 0 && thrown.fetchError === "MOCK_NETWORK_FAILURE");

const httpError = await callGeminiEndpoint(
  "gemini-3.8-flash", "MOCK_KEY", "prompt", contents,
  async () => new Response("{}", { status: 503 })
);
test("HTTP 503 safely rejected", !httpError.ok && httpError.httpStatus === 503);

console.log("\n--- PRODUCTION ENDPOINT MOCK TEST ---");
for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"} | ${c.name}`);
console.log(`\n${checks.filter(c => c.pass).length}/${checks.length} passed`);
if (checks.some(c => !c.pass)) process.exitCode = 1;

