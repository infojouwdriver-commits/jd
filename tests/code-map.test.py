"""Safety and freshness checks for the developer reference (no Graphify needed)."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import hashlib

spec = importlib.util.spec_from_file_location("code_map", Path(__file__).parents[1] / "scripts/code-map.py")
code_map = importlib.util.module_from_spec(spec)
spec.loader.exec_module(code_map)


class CodeMapTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.out = self.root / "graphify-out"
        self.out.mkdir()
        for name in ("src/real.ts", "src/.env", "src/private-data/export.ts", "run/key.ts",
                     "driver-app/src/Home.tsx", "app.sql", "src/new-untracked.ts"):
            file = self.root / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text("export const example = 1;\n")
        self.index = ["src/real.ts", "src/.env", "src/private-data/export.ts", "run/key.ts",
                      "driver-app/src/Home.tsx", "app.sql"]
        for obj, value in (("ROOT", self.root), ("OUT", self.out)):
            p = patch.object(code_map, obj, value)
            p.start()
            self.addCleanup(p.stop)
        p = patch.object(code_map, "git", lambda *args: "\0".join(self.index))
        p.start()
        self.addCleanup(p.stop)

    def manifest(self):
        artifact = self.out / "graph.json"
        artifact.write_text('{"nodes":[]}')
        manifest = {"files": code_map.fingerprint(), "artifacts": {
            "graph.json": hashlib.sha256(artifact.read_bytes()).hexdigest()}}
        (self.out / "source-manifest.json").write_text(json.dumps(manifest))

    def test_only_indexed_allowlisted_source_is_selected(self):
        self.assertEqual(code_map.selected_paths(), ["driver-app/src/Home.tsx", "src/real.ts"])

    def test_symlink_is_rejected(self):
        (self.root / "src/link.ts").symlink_to(self.root / "app.sql")
        self.index.append("src/link.ts")
        with self.assertRaises(ValueError):
            code_map.selected_paths()

    def test_fresh_map_passes_without_graphify(self):
        self.manifest()
        code_map.check()

    def test_changed_added_and_removed_sources_make_map_stale(self):
        self.manifest()
        (self.root / "src/real.ts").write_text("changed")
        with self.assertRaises(SystemExit):
            code_map.check()
        self.manifest()
        self.index.append("src/new-untracked.ts")
        with self.assertRaises(SystemExit):
            code_map.check()
        self.manifest()
        self.index.remove("src/real.ts")
        with self.assertRaises(SystemExit):
            code_map.check()

    def test_tampered_graph_is_rejected(self):
        self.manifest()
        (self.out / "graph.json").write_text("changed")
        with self.assertRaises(SystemExit):
            code_map.check()


if __name__ == "__main__":
    unittest.main()
