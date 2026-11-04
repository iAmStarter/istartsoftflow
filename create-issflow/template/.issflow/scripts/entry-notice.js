#!/usr/bin/env node
// Repo-internal PostToolUse hook (NOT shipped by create-issflow — build.js only
// copies agents/commands/skills/hooks/istartsoft-flow/templates + README).
// When root entry shims are edited, nudge to keep AGENTS.md / host adapters aligned.
'use strict';
let data = '';
process.stdin.on('data', (c) => (data += c)).on('end', () => {
  try {
    const f = (JSON.parse(data || '{}').tool_input || {}).file_path || '';
    if (/(^|[\\/])CLAUDE\.md$/.test(f)) {
      process.stdout.write(JSON.stringify({
        systemMessage: 'CLAUDE.md is a host shim — keep `@AGENTS.md` as the only SoT pointer. Sync BMAD if needed: save_artifact type=claude-md',
      }));
    } else if (/(^|[\\/])AGENTS\.md$/.test(f)) {
      process.stdout.write(JSON.stringify({
        systemMessage: 'AGENTS.md changed — keep it an index of `.issflow/istartsoft-flow/METHODOLOGY.md` (anti-drift: do not paste hard rules here).',
      }));
    }
  } catch (_) { /* ignore malformed hook input */ }
});
