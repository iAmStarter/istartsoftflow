#!/usr/bin/env node
// Repo-internal PostToolUse hook (NOT shipped by create-issflow — build.js only
// copies agents/commands/skills/hooks/istartsoft-flow). Cross-platform (Node).
// When CLAUDE.md is written/edited, nudge to sync it into iStartSoft BMAD/iSSM.
'use strict';
let data = '';
process.stdin.on('data', (c) => (data += c)).on('end', () => {
  try {
    const f = (JSON.parse(data || '{}').tool_input || {}).file_path || '';
    if (/(^|[\\/])CLAUDE\.md$/.test(f)) {
      process.stdout.write(JSON.stringify({ systemMessage: '⚠️ CLAUDE.md changed — sync BMAD: save_artifact type=claude-md' }));
    }
  } catch (_) { /* ignore malformed hook input */ }
});
