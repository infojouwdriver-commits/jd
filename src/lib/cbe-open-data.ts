type Database = {
  prepare(sql: string): { get(number: string): Record<string, string | null> | undefined };
  close(): void;
};
type Sqlite = { DatabaseSync: new (file: string, options: { readOnly: boolean }) => Database };

export type OpenDataCompany = {
  kbo_number: string;
  name: string;
  address: string | null;
  source: 'cbe_open_data';
  snapshot_date: string;
};

// undefined means the configured snapshot could not be opened; null is a completed lookup with no match.
export function lookupOpenDataCompany(number: string, language: 'fr' | 'nl'): OpenDataCompany | null | undefined {
  const file = process.env.CBE_OPEN_DATA_PATH;
  if (!file) return undefined;

  let db: Database | undefined;
  try {
    const sqlite = process.getBuiltinModule('node:sqlite') as Sqlite | undefined;
    if (!sqlite) return undefined;
    db = new sqlite.DatabaseSync(file, { readOnly: true });
    const row = db.prepare(`
      SELECT number, name_fr, name_nl, name_other, address_fr, address_nl, day
      FROM companies CROSS JOIN cbe_snapshot WHERE number=?
    `).get(number);
    if (!row) return null;

    const alternate = language === 'fr' ? 'nl' : 'fr';
    const name = row['name_' + language] || row['name_' + alternate] || row.name_other;
    return name && row.day && /^\d{4}-\d{2}-\d{2}$/.test(row.day) ? {
      kbo_number: number,
      name,
      address: row['address_' + language] || row['address_' + alternate],
      source: 'cbe_open_data',
      snapshot_date: row.day,
    } : undefined;
  } catch {
    return undefined;
  } finally {
    db?.close();
  }
}
