'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
test('landing page describes current native discovery and read-only doctor', () => {
  for (const feature of ['.agents/skills/', '.codex/agents/*.toml', '.cursor/agents/*.md', 'CORE.md', '--doctor', 'sessionStart', 'subagentStop']) assert.ok(html.includes(feature), feature);
  assert.match(html, /read-only installation diagnostic, not a live-host test/);
  assert.match(html, /ตรวจการติดตั้งแบบอ่านอย่างเดียว ไม่ใช่การทดสอบ host จริง/);
  assert.match(html, /Codex hooks are not installed/);
  assert.match(html, /ยังไม่ติดตั้ง hook ให้ Codex/);
  assert.match(html, /duplicate skill names/);
  assert.match(html, /ชื่อสกิลซ้ำ/);
});
test('landing page explains risk lanes and practical verification limits bilingually', () => {
  assert.match(html, /quick for bounded reversible edits, planned for new behavior, and high-risk/);
  assert.match(html, /quick สำหรับการแก้ที่จำกัดและย้อนคืนได้/);
  assert.match(html, /without a redundant discovery round/);
  assert.match(html, /โดยไม่ต้องถามซ้ำอีกรอบ/);
  assert.match(html, /Browser checks need an available browser and safe test fixtures/);
  assert.match(html, /การตรวจ browser ต้องมีเครื่องมือและข้อมูลทดสอบที่ปลอดภัย/);
  assert.match(html, /actual cost depends on models, history, tools and retries/);
  assert.match(html, /does not include an autonomous browser/);
});
test('metadata and body do not promise unskippable hooks or fixed costs', () => {
  assert.doesNotMatch(html, /can't skip|can't be skipped|can't cut corners|guaranteed to fire|Nothing gets skipped|fire every session|bill stays flat|Cost doesn't grow|full hooks|hooks ยิงแน่นอน|เกตที่ข้ามไม่ได้|จึงข้ามไม่ได้|ไม่มีขั้นตอนโดนข้าม/i);
  assert.doesNotMatch(html, /nothing is real until you merge|ของจริงไม่พังจนกว่าคุณจะ merge/);
  const metadata = [...html.matchAll(/<meta[^>]+(?:name|property)="(?:description|og:description|twitter:description)"[^>]*>/g)].map(m => m[0]);
  assert.equal(metadata.length, 3);
  assert.ok(metadata.every(m => /native|Native/.test(m)));
});
