#!/usr/bin/env python3
"""Build a read-only lookup index from an official CBE Open Data full ZIP."""
import argparse
import csv
from datetime import datetime
import io
import os
from pathlib import Path
import re
import sqlite3
import tempfile
import zipfile


def rows(archive, filename):
    with archive.open(filename) as member:
        yield from csv.DictReader(io.TextIOWrapper(member, encoding="utf-8-sig", newline=""))


def number(value):
    if not re.fullmatch(r"[01][0-9]{3}\.[0-9]{3}\.[0-9]{3}", value):
        return None
    digits = value.replace(".", "")
    return digits if int(digits[-2:]) == 97 - int(digits[:8]) % 97 else None


def address(row, language, other):
    street = row["Street" + language] or row["Street" + other]
    town = row["Municipality" + language] or row["Municipality" + other]
    if not street or not town or not row["Zipcode"]:
        return None
    location = " ".join(filter(None, (street, row["HouseNumber"])))
    if row["Box"]:
        location += (" boîte " if language == "FR" else " bus ") + row["Box"]
    country = row["Country" + language] or row["Country" + other]
    result = ", ".join(filter(None, (location, row["Zipcode"] + " " + town, country)))
    return result if len(result) <= 400 else None


def build_database(archive, db):
    meta = {row["Variable"]: row["Value"] for row in rows(archive, "meta.csv")}
    if meta.get("ExtractType", "").lower() != "full":
        raise ValueError("Expected a full CBE Open Data export")
    snapshot = datetime.strptime(meta["SnapshotDate"], "%d-%m-%Y").date().isoformat()
    db.executescript("""
        PRAGMA journal_mode=OFF;
        PRAGMA synchronous=OFF;
        PRAGMA user_version=1;
        CREATE TABLE cbe_snapshot(day TEXT NOT NULL);
        CREATE TABLE companies(
            number TEXT PRIMARY KEY, name_fr TEXT, name_nl TEXT, name_other TEXT,
            address_fr TEXT, address_nl TEXT
        ) WITHOUT ROWID;
    """)
    with db:
        db.execute("INSERT INTO cbe_snapshot VALUES (?)", (snapshot,))
        db.executemany("INSERT INTO companies(number) VALUES (?)", (
            (key,) for row in rows(archive, "enterprise.csv")
            if row["Status"] == "AC" and (key := number(row["EnterpriseNumber"]))
        ))
        for row in rows(archive, "denomination.csv"):
            key = number(row["EntityNumber"])
            name = row["Denomination"]
            if not key or row["TypeOfDenomination"] != "001" or not 0 < len(name) <= 200:
                continue
            column = {"1": "name_fr", "2": "name_nl"}.get(row["Language"], "name_other")
            db.execute(f"UPDATE companies SET {column}=? WHERE number=? AND {column} IS NULL", (name, key))
        db.executemany(
            "UPDATE companies SET address_fr=?, address_nl=? WHERE number=? AND address_fr IS NULL AND address_nl IS NULL",
            (
                (address(row, "FR", "NL"), address(row, "NL", "FR"), key)
                for row in rows(archive, "address.csv")
                if row["TypeOfAddress"] == "REGO" and not row["DateStrikingOff"]
                and (key := number(row["EntityNumber"]))
            ),
        )
        db.execute("DELETE FROM companies WHERE name_fr IS NULL AND name_nl IS NULL AND name_other IS NULL")
    db.execute("VACUUM")
    if db.execute("PRAGMA quick_check").fetchone() != ("ok",):
        raise ValueError("CBE lookup index failed its integrity check")
    count = db.execute("SELECT count(*) FROM companies").fetchone()[0]
    if count == 0:
        raise ValueError("The CBE export contained no active companies with names")
    return snapshot, count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    with tempfile.NamedTemporaryFile(dir=args.destination.parent, delete=False) as temp:
        pending = Path(temp.name)
    try:
        with zipfile.ZipFile(args.archive) as archive, sqlite3.connect(pending) as db:
            snapshot, count = build_database(archive, db)
        db.close()
        pending.chmod(0o640)
        os.replace(pending, args.destination)
    finally:
        pending.unlink(missing_ok=True)
    print(f"CBE Open Data {snapshot}: indexed {count} active enterprises")


if __name__ == "__main__":
    main()
