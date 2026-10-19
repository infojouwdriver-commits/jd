import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {jsPDF} from 'jspdf';

const exports = {};
let rendered = [];
class CapturedPDF extends jsPDF {
  constructor(options) {
    super(options);
    const original = this.text;
    this.text = (...args) => { rendered.push(args[0]); return original.apply(this, args); };
  }
}
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/legal/vervoerbewijs.ts', import.meta.url), 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText, {exports, Date, require: name => {
  if (name === 'jspdf') return {jsPDF: CapturedPDF};
  if (name === './pdf-fonts') return {configurePdfFonts() {}};
  throw Error(`Unexpected import ${name}`);
}});

test('receipt dates and trip times use Brussels summer/winter time regardless of server timezone', () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
      process.env.TZ = timezone;
      for (const [start, end, date, time, arrival] of [
        ['2026-10-14T06:19:13Z', '2026-10-14T06:22:15Z', '14/10/2026', '08:19', '08:22'],
        ['2026-01-14T06:19:13Z', '2026-01-14T06:22:15Z', '14/01/2026', '07:19', '07:22'],
        ['2026-07-14T22:19:13Z', '2026-07-14T22:22:15Z', '15/07/2026', '00:19', '00:22'],
      ]) {
        rendered = [];
        const fixture = {company: {name: 'Synthetic'}, driver: {full_name: 'Synthetic'}, vehicle: {brand: 'Test', model: 'Vehicle', plate_number: 'TEST'}, trip: {shift_id:'11111111-1111-4111-8111-111111111111',ritnummer: 'SYNTHETIC', trip_uuid: 'synthetic', start_time: start, end_time: end, start_address: 'Synthetic departure', end_address: 'Synthetic arrival', distance_km: 0.72, duration_minutes: 3, price: 2}, chiron: {sync_state: 'completed'}, document_number: 'TEST', document_date: start, vat_rate: 6};
        const before = JSON.stringify(fixture);
        const doc = exports.generateVervoerbewijs(fixture);
        assert.ok(doc.output('arraybuffer').byteLength > 0);
        assert.ok(rendered.includes(`${date} ${time}`));
        assert.ok(rendered.join(' ').includes('Dienstreferentie: 11111111-1111-4111-8111-111111111111'));
        assert.equal(rendered[rendered.indexOf('Vertrektijd:') + 1], time);
        assert.equal(rendered[rendered.indexOf('Aankomsttijd:') + 1], arrival);
        assert.equal(JSON.stringify(fixture), before, 'stored timestamps and receipt snapshot stay unchanged');
      }
    }
  } finally {
    if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous;
  }
});
