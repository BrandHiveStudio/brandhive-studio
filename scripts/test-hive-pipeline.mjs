// HIVE AI Pipeline Tests - node scripts/test-hive-pipeline.mjs

function buildMockFetch(scenarios) {
  let idx = 0;
  return async () => {
    const s = scenarios[idx] != null ? scenarios[idx] : scenarios[scenarios.length - 1];
    idx++;
    if (s.throws) throw new Error(s.throws);
    return new Response(JSON.stringify(s.body), { status: s.status != null ? s.status : 200 });
  };
}

async function callGeminiApi(targetModel, fetchFn) {
  const cleanModel = targetModel.trim().replace(/^["']|["']$/g, '').replace(/^models\//, '');
  const isThinkingModel = cleanModel.startsWith('gemini-2.5') || cleanModel.includes('thinking') || cleanModel === 'gemini-flash-latest';
  const generationConfig = { temperature: 0.7, responseMimeType: 'application/json' };
  if (isThinkingModel) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  try {
    const res = await fetchFn('https://x', { method: 'POST', body: JSON.stringify({ generationConfig }) });
    if (!res.ok) return { ok: false, httpStatus: res.status, text: '', finishReason: '' };
    const data = await res.json();
    const candidate = data && data.candidates && data.candidates[0];
    const finishReason = (candidate && candidate.finishReason) ? candidate.finishReason : '';
    const text = (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0]) ? candidate.content.parts[0].text : '';
    if (!text || !text.trim()) return { ok: false, httpStatus: res.status, text: '', finishReason };
    return { ok: true, httpStatus: res.status, text, finishReason };
  } catch (err) {
    return { ok: false, httpStatus: 0, text: '', finishReason: '', fetchError: err.message };
  }
}

async function runPipeline(primary, secondary, fetchFn, fallback) {
  let resp = await callGeminiApi(primary, fetchFn);
  if (!resp.ok || !resp.text.trim()) resp = await callGeminiApi(secondary, fetchFn);
  if (resp.ok && resp.text.trim()) {
    let raw = resp.text.trim();
    let parsed = {};
    try { parsed = JSON.parse(raw); } catch(e) { if (!raw.startsWith('{')) parsed = { reply: raw }; }
    if (parsed.reply && parsed.reply.trim()) return { reply: parsed.reply.trim(), needsLeadCapture: Boolean(parsed.needsLeadCapture) };
  }
  return fallback;
}

let passed = 0, failed = 0;
function gem(t, fr) { fr = fr || 'STOP'; return { candidates: [{ finishReason: fr, content: { parts: [{ text: t }] } }] }; }
function empty(fr) { fr = fr || 'OTHER'; return { candidates: [{ finishReason: fr }] }; }
const FB = { reply: 'FALLBACK_REPLY', needsLeadCapture: false };
async function test(name, fn) { try { await fn(); console.log('  PASS:', name); passed++; } catch(e) { console.error('  FAIL:', name, '--', e.message); failed++; } }
function assert(c, m) { if (!c) throw new Error(m); }

async function main() {
  console.log('\n=== HIVE AI Pipeline Tests ===');
  console.log('\nGroup 1: callGeminiApi unit tests\n');
  await test('Valid 200 -> ok=true', async function() {
    var r = await callGeminiApi('gemini-3.8-flash', buildMockFetch([{ body: gem(JSON.stringify({ reply: 'hi', needsLeadCapture: false })) }]));
    assert(r.ok && r.text.length > 0, 'ok=true text present');
  });
  await test('HTTP 503 -> ok=false', async function() {
    var r = await callGeminiApi('gemini-3.8-flash', buildMockFetch([{ body: {}, status: 503 }]));
    assert(!r.ok && r.httpStatus === 503, 'ok=false 503');
  });
  await test('Empty candidates -> ok=false', async function() {
    var r = await callGeminiApi('gemini-3.8-flash', buildMockFetch([{ body: { candidates: [] } }]));
    assert(!r.ok, 'ok=false');
  });
  await test('finishReason=OTHER no text -> ok=false', async function() {
    var r = await callGeminiApi('gemini-3.8-flash', buildMockFetch([{ body: empty('OTHER') }]));
    assert(!r.ok && r.finishReason === 'OTHER', 'ok=false finishReason=OTHER');
  });
  await test('Fetch throws -> fetchError set', async function() {
    var r = await callGeminiApi('gemini-3.8-flash', buildMockFetch([{ body: null, throws: 'ECONNRESET' }]));
    assert(!r.ok && r.httpStatus === 0 && r.fetchError === 'ECONNRESET', 'fetch error');
  });
  await test('gemini-3.8-flash: thinkingConfig NOT sent', async function() {
    var body = {};
    var mf = async function(u, o) { body = JSON.parse(o.body); return new Response(JSON.stringify(gem('x')), { status: 200 }); };
    await callGeminiApi('gemini-3.8-flash', mf);
    assert(!('thinkingConfig' in body.generationConfig), 'thinkingConfig absent for gemini-3.8-flash');
  });
  await test('gemini-2.5-flash: thinkingBudget:0 sent', async function() {
    var body = {};
    var mf = async function(u, o) { body = JSON.parse(o.body); return new Response(JSON.stringify(gem('x')), { status: 200 }); };
    await callGeminiApi('gemini-2.5-flash', mf);
    assert(body.generationConfig && body.generationConfig.thinkingConfig && body.generationConfig.thinkingConfig.thinkingBudget === 0, 'thinkingBudget=0 for gemini-2.5-flash');
  });
  console.log('\nGroup 2: Pipeline dispatch scenarios\n');
  await test('A: Primary valid -> reply 1 call', async function() {
    var c = 0;
    var mf = async function() { c++; return new Response(JSON.stringify(gem(JSON.stringify({ reply: 'Primary ok', needsLeadCapture: false }))), { status: 200 }); };
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash', mf, FB);
    assert(r.reply === 'Primary ok' && c === 1, 'Reply from primary 1 call');
  });
  await test('B: Primary empty -> secondary valid', async function() {
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash',
      buildMockFetch([{ body: empty() }, { body: gem(JSON.stringify({ reply: 'Secondary ok', needsLeadCapture: false })) }]), FB);
    assert(r.reply === 'Secondary ok', 'Reply from secondary');
  });
  await test('C: Both empty -> fallback', async function() {
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash', buildMockFetch([{ body: empty() }, { body: empty('SAFETY') }]), FB);
    assert(r.reply === 'FALLBACK_REPLY', 'Should return fallback');
  });
  await test('D: Primary throws -> secondary valid', async function() {
    var c = 0;
    var mf = async function() { c++; if (c === 1) throw new Error('ECONNREFUSED'); return new Response(JSON.stringify(gem(JSON.stringify({ reply: 'Sec ok', needsLeadCapture: false }))), { status: 200 }); };
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash', mf, FB);
    assert(r.reply === 'Sec ok', 'Reply from secondary after throw');
  });
  await test('E: Both throw -> fallback', async function() {
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash', async function() { throw new Error('ETIMEDOUT'); }, FB);
    assert(r.reply === 'FALLBACK_REPLY', 'Should return fallback');
  });
  await test('F: Primary 503 -> secondary valid', async function() {
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash',
      buildMockFetch([{ body: {}, status: 503 }, { body: gem(JSON.stringify({ reply: 'Sec 503', needsLeadCapture: false })) }]), FB);
    assert(r.reply === 'Sec 503', 'Reply from secondary after 503');
  });
  await test('G: Broken JSON -> fallback', async function() {
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash', buildMockFetch([{ body: gem('{broken}') }, { body: empty() }]), FB);
    assert(r.reply === 'FALLBACK_REPLY', 'Should return fallback when JSON broken');
  });
  await test('H: No path returns empty reply', async function() {
    var r = await runPipeline('gemini-3.8-flash', 'gemini-2.5-flash', buildMockFetch([{ body: empty() }, { body: empty() }]), FB);
    assert(r.reply && r.reply.trim().length > 0, 'reply must never be empty');
  });
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  if (failed > 0) process.exit(1);
}
main().catch(function(e) { console.error(e); process.exit(1); });