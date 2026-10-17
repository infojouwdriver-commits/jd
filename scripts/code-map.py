#!/usr/bin/env python3
"""Build/check JOUW DRIVER's local, code-only Graphify reference.

Use the pinned Graphify environment in requirements-code-map.txt.
Only git-indexed source in the allowlist is read; never scan a working tree
recursively or connect to a database/model/cloud service.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
from importlib.metadata import version
import json
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "graphify-out"
VERSION = "0.9.92"
PREFIXES = ("src/", "driver-app/src/", "driver-app/app/", "mobile/plugins/",
            "mobile/scripts/", "migrations/", "scripts/", "deploy/", "security/")
SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sh",
            ".sql", ".java", ".kt", ".swift", ".m", ".h", ".css"}
CONFIGS = {"next.config.ts", "capacitor.config.ts", "driver-app/app.config.js", "driver-app/App.tsx",
           "mobile/config.mjs", "tsconfig.json", "driver-app/tsconfig.json",
           "package.json", "driver-app/package.json", "mobile/package.json", "pnpm-workspace.yaml"}
PRIVATE = re.compile(r"(^|/)(?:\.env[^/]*|private[^/]*|backups?|run|upload|exports?|"
                     r"node_modules|\.git|dist|build|verification)(/|$)", re.I)


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True)


def selected_paths() -> list[str]:
    paths = git("ls-files", "-z").split("\0")
    selected = []
    for name in paths:
        if not name or PRIVATE.search(name) or "/tests/" in name:
            continue
        p = Path(name)
        if name not in CONFIGS and not (name.startswith(PREFIXES) and p.suffix in SUFFIXES):
            continue
        file = ROOT / p
        if file.is_symlink() or not file.is_file() or ROOT not in file.resolve().parents:
            raise ValueError(f"Missing or unsafe indexed source: {name}")
        selected.append(name)
    return sorted(selected)


def fingerprint() -> dict[str, str]:
    return {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
            for name in selected_paths()}


def check() -> None:
    recorded = json.loads((OUT / "source-manifest.json").read_text())
    current = fingerprint()
    previous = recorded["files"]
    changed = sorted(k for k in current.keys() | previous.keys()
                     if current.get(k) != previous.get(k))
    if changed:
        print("Code map is stale; rebuild. Changed, added or removed sources:")
        print("\n".join(changed[:40]))
        raise SystemExit(1)
    for name, expected in recorded["artifacts"].items():
        if hashlib.sha256((OUT / name).read_bytes()).hexdigest() != expected:
            raise SystemExit(f"Code map artifact mismatch: {name}; rebuild.")
    print(f"Code map is current: {len(current)} source files; artifacts verified.")


def build(allow_shrink: bool) -> None:
    if version("graphifyy") != VERSION:
        raise SystemExit(f"Install graphifyy[sql]=={VERSION} in the dedicated environment.")
    from graphify.extract import extract
    from graphify.build import build_from_json
    from graphify.cluster import cluster, score_all, label_communities_by_hub
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json
    from graphify.diagnostics import diagnose_extraction
    from graphify.tree_html import write_tree_html

    files = fingerprint()
    if not files:
        raise SystemExit("No eligible indexed source files.")
    print(f"Corpus: {len(files)} tracked source files; local AST only; no model calls.")
    # Cache is disposable and outside the repository. Root remains the real repo
    # for correct source IDs, relative paths, imports and TypeScript aliases.
    with tempfile.TemporaryDirectory(prefix="jd-code-map-") as tmp:
        extraction = extract([ROOT / p for p in files], root=ROOT,
                             cache_root=Path(tmp), max_workers=4)
    graph = build_from_json(extraction, root=ROOT, directed=True)
    if not graph.number_of_nodes():
        raise SystemExit("Empty extraction; existing outputs preserved.")
    # Prevent accidental indexing of files outside the explicit corpus.
    for node_id, data in graph.nodes(data=True):
        source = data.get("source_file")
        if source and source not in files:
            if str(node_id).startswith("ref_") or data.get("type") == "module":
                data["external_module"] = source
                data["source_file"] = ""
                data["source_location"] = ""
            else:
                raise SystemExit(f"Unexpected graph source: {source}")
    health = diagnose_extraction(extraction, directed=True, root=ROOT)
    if health.get("producer_suppression", {}).get("path"):
        health["producer_suppression"]["path"] = "graphify/extract.py"
    communities = cluster(graph)
    labels = label_communities_by_hub(graph, communities)
    scores = score_all(graph, communities)
    head = git("rev-parse", "HEAD").strip()
    with tempfile.TemporaryDirectory(prefix="jd-code-map-output-") as tmp:
        dest = Path(tmp)
        old = OUT / "graph.json"
        # Let Graphify's shrink guard inspect the previous map before any writes.
        if old.exists():
            (dest / "graph.json").write_bytes(old.read_bytes())
        if not to_json(graph, communities, str(dest / "graph.json"), force=allow_shrink,
                       built_at_commit=head, community_labels=labels,
                       original_links=extraction["edges"]):
            raise SystemExit("Map shrank. Review deletions; use --allow-shrink only if intended.")
        detection = {"total_files": len(files),
                     "total_words": sum(len((ROOT / name).read_text(encoding="utf-8").split()) for name in files),
                     "files": {"code": list(files)}}
        report = generate(graph, communities, scores, labels, god_nodes(graph),
                          surprising_connections(graph, communities), detection,
                          {"input": 0, "output": 0}, "JOUW DRIVER",
                          suggested_questions=suggest_questions(graph, communities, labels),
                          built_at_commit=head)
        report = report.replace("- Run `git rev-parse HEAD` and compare to check if the graph is stale.",
                                "- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.")
        report = report.replace("- Run `graphify update .` after code changes (no API cost).",
                                "- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).")
        report += ("\n## Extraction diagnostics and limits\n\n"
                   f"- Raw extraction has {health.get('dangling_endpoint_edges', 0)} unresolved internal-endpoint edges "
                   f"and {health.get('self_loop_edges', 0)} self-loop edges; inspect health.json.\n"
                   f"- The simple analysis graph can collapse {health.get('directed_same_endpoint_collapsed_edges', 0)} "
                   "parallel relations. graph.json preserves the original exported links.\n"
                   "- Source declarations in excluded baseline SQL dumps are not indexed; "
                   "dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.\n"
                   "- The exported map has no dangling endpoints; Graphify may create reference nodes, "
                   "which do not establish a verified definition or runtime call.\n")
        (dest / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
        by_file = defaultdict(list)
        for _, data in graph.nodes(data=True):
            if data.get("source_file"):
                by_file[data["source_file"]].append(data)
        lines = ["# JOUW DRIVER — Source index", "",
                 "Generated structural index; not a line-by-line explanation.",
                 "Source fingerprints are authoritative: run `python scripts/code-map.py --check`.",
                 "CSS is fingerprinted and listed; Graphify does not structurally parse CSS.", "",
                 "Links target the working tree, so line positions can move after changes.", ""]
        for name in files:
            safe = name.replace("[", "%5B").replace("]", "%5D").replace(" ", "%20")
            lines += [f"## [{name}](../{safe})", ""]
            for node in sorted(by_file[name], key=lambda n: (int(re.search(r"\d+", n.get("source_location") or "L0").group())
                                                            if re.search(r"\d+", n.get("source_location") or "L0") else 0,
                                                            n.get("label", ""))):
                loc = node.get("source_location") or ""
                label = node.get("label", "").replace("|", "\\|").replace("`", "'")
                lines.append(f"- `{label}` — [{loc or 'source'}](../{safe}#{loc})")
            if not by_file[name]:
                lines.append("- Tracked source; no structural symbols extracted.")
            lines.append("")
        (dest / "SOURCE_INDEX.md").write_text("\n".join(lines), encoding="utf-8")
        (dest / "health.json").write_text(json.dumps(health, ensure_ascii=False, indent=2) + "\n")
        write_tree_html(graph_path=dest / "graph.json", output_path=dest / "GRAPH_TREE.html",
                        project_label="JOUW DRIVER", top_k_edges=12)
        artifacts = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in dest.iterdir()}
        metadata = {"graphify_version": VERSION, "source_commit_context": head,
                    "scope": "tracked allowlisted source only; no semantic extraction",
                    "input_tokens": 0, "output_tokens": 0, "files": files,
                    "artifacts": artifacts,
                    "nodes": graph.number_of_nodes(), "edges": graph.number_of_edges(),
                    "raw_edges": len(extraction["edges"]), "communities": len(communities),
                    "confidence_counts": dict(Counter(e.get("confidence", "EXTRACTED")
                                                      for e in extraction["edges"]))}
        (dest / "source-manifest.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
        # No outputs replace the previous set until extraction/export succeeds.
        OUT.mkdir(exist_ok=True)
        for p in dest.iterdir():
            (OUT / p.name).write_bytes(p.read_bytes())
    print(f"Graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} directed edges, "
          f"{len(communities)} communities. Extraction model tokens: 0.")
    flags = {k: health.get(k, 0) for k in ("dangling_endpoint_edges", "missing_endpoint_edges",
             "self_loop_edges", "directed_same_endpoint_collapsed_edges") if health.get(k, 0)}
    print(f"Graph health caveats: {flags or 'none'}; full diagnostics: graphify-out/health.json")
    if graph.number_of_nodes() > 5000:
        print("Large graph: HTML export uses the community overview; use the source index for detail.")
    check()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify source and output hashes; no Graphify dependency")
    parser.add_argument("--allow-shrink", action="store_true", help="Accept a reviewed reduction in graph size")
    args = parser.parse_args()
    check() if args.check else build(args.allow_shrink)
