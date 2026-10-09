export function completedTripTimes(body: Record<string, unknown>, now = Date.now()) {
  const duration = typeof body.duration_minutes === 'number' ? body.duration_minutes : 0;
  if (!Number.isInteger(duration) || duration < 0 || duration > 2880) throw new Error('Invalid trip duration');
  const hasTimes = body.start_time !== undefined || body.end_time !== undefined;
  if (!hasTimes) return { startTime: new Date(now - duration * 60_000), endTime: new Date(now) };
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
  if (typeof body.start_time !== 'string' || typeof body.end_time !== 'string' || !iso.test(body.start_time) || !iso.test(body.end_time)) throw new Error('Both UTC trip timestamps are required');
  const start = Date.parse(body.start_time), end = Date.parse(body.end_time);
  if (!Number.isFinite(start) || !Number.isFinite(end) || new Date(start).toISOString().slice(0, 19) !== body.start_time.slice(0, 19) || new Date(end).toISOString().slice(0, 19) !== body.end_time.slice(0, 19) || end < start || end > now + 300_000 || end - start > 48 * 3_600_000 || Math.abs(Math.floor((end - start) / 60_000) - duration) > 1) throw new Error('Invalid trip timestamps or duration');
  return { startTime: new Date(start), endTime: new Date(end) };
}
