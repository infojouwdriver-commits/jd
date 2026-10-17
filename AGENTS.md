# JOUW DRIVER — coding reference

Start with [docs/CODE_MAP_AR.md](docs/CODE_MAP_AR.md) and the feature-to-file table.
The local Graphify map lives at `graphify-out/graph.json`; the searchable file and
symbol index is `graphify-out/SOURCE_INDEX.md`. Existing nested instructions
(including `driver-app/AGENTS.md`), DESIGN.md and UX-CONTRACT.md still apply.

## Before changing code

1. Run `python3 scripts/code-map.py --check` to check freshness. A stale map is
   orientation only; inspect the current source and refresh the map when possible.
2. Use `graphify query "<feature or symbol>" --budget 1500`, `graphify explain
   "<symbol>"`, or `graphify affected "<symbol>"` for focused navigation. English
   symbol names are more reliable than translating identifiers into Arabic.
3. Read the actual source at the returned file/symbol before editing. Inferred
   edges are hypotheses, not proof of runtime behavior or security.
4. If Graphify is unavailable or misses a relationship, use SOURCE_INDEX.md and
   normal source search. The reference must never block debugging or verification.

## Building and updating

Use the pinned, dedicated Python environment and `python scripts/code-map.py`;
see docs/CODE_MAP_AR.md. Rebuild after source edits and commit the map alongside
its source changes. `--check` detects changed, added and deleted indexed sources
and changed output artifacts. Only use `--allow-shrink` after reviewing deletions.

The repository's privacy/scope rules override the generic installed Graphify
skill: use this builder rather than unrestricted `/graphify .`, `extract .`,
`update .`, `watch .`, database introspection, global indexing, or cloud sync.
The builder reads only allowlisted git-indexed source files. Do not index .env,
keys, exports, backups, signed documents, production data, screenshots, or logs.
Do not enable model-based extraction or paid services for this reference.

The official Graphify Codex skill and references are installed under
`.codex/skills/graphify/` for compatible Codex hosts. A host must support local
skills/CLI access; committing these files does not install tools on every machine.
