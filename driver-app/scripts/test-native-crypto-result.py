import importlib.util
import sqlite3
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('verifier', Path(__file__).with_name('check-native-crypto-result.py'))
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)


class ResultTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def write(self, probe='123-1', status='passed', version=1, folder='one'):
        path = self.path / folder
        path.mkdir(exist_ok=True)
        with sqlite3.connect(path / 'native-crypto-smoke.db') as db:
            db.execute('CREATE TABLE IF NOT EXISTS native_crypto_smoke(probe_id TEXT PRIMARY KEY,version INTEGER,status TEXT)')
            db.execute('INSERT OR REPLACE INTO native_crypto_smoke VALUES(?,?,?)', (probe, version, status))

    def test_current_only(self):
        self.assertIsNone(verifier.read_result(self.path, '123-1'))
        self.write('123-1')
        self.assertEqual(verifier.read_result(self.path, '123-1'), 'passed')
        self.assertIsNone(verifier.read_result(self.path, '123-2'))
        self.write('123-2', 'failed')
        self.assertEqual(verifier.read_result(self.path, '123-2'), 'failed')
        self.write('123-3', version=2)
        self.assertIsNone(verifier.read_result(self.path, '123-3'))

    def test_ambiguous_and_invalid(self):
        self.write()
        self.write(folder='two')
        with self.assertRaises(ValueError):
            verifier.read_result(self.path, '123-1')
        with self.assertRaises(ValueError):
            verifier.read_result(self.path, "123-1' OR 1=1")

    def test_no_creation(self):
        self.assertIsNone(verifier.read_result(self.path, '123-1'))
        self.assertEqual(list(self.path.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
