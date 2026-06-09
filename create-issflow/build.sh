#!/usr/bin/env bash
# build.sh — rebuild template/ from the repo-root .claude kit.
# Run after changing any agent/command/skill/hook/methodology, before publishing.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"               # repo root (one level up)
TPL="$HERE/template/.claude"
rm -rf "$HERE/template"; mkdir -p "$TPL"
cp -R "$ROOT/.claude/agents" \
      "$ROOT/.claude/commands" \
      "$ROOT/.claude/skills" \
      "$ROOT/.claude/hooks" \
      "$ROOT/.claude/istartsoft-flow" "$TPL/"
echo "rebuilt template/ from $ROOT/.claude ($(find "$TPL" -type f | wc -l | tr -d ' ') files)"
