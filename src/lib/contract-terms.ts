export class ContractValidationError extends Error {}

export function todayInBrussels(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(part=>[part.type,part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function contractPeriod(start: unknown, duration: unknown = 12) {
  if (typeof start !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(start)) throw new ContractValidationError('تاريخ بداية العقد غير صالح');
  const date = new Date(start + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== start) throw new ContractValidationError('تاريخ بداية العقد غير صالح');
  if ((typeof duration !== 'number' && typeof duration !== 'string') || (typeof duration === 'string' && !duration.trim())) throw new ContractValidationError('مدة العقد غير صالحة');
  const months = Number(duration);
  if (!Number.isInteger(months) || months < 1 || months > 120) throw new ContractValidationError('مدة العقد يجب أن تكون بين شهر و120 شهراً');
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return {startDate: start, endDate: date.toISOString().slice(0, 10), durationMonths: months};
}

export function contractFee(value: unknown) {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) throw new ContractValidationError('رسم الاشتراك غير صالح');
  const amount = Number(value);
  const cents = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(cents * 12) || Math.abs(amount * 100 - cents) > 0.000001) throw new ContractValidationError('رسم الاشتراك يجب أن يكون مبلغاً موجباً أو صفراً بدقة سنتين عشريتين');
  return {monthlyFee: cents / 100, annualFee: cents * 12 / 100};
}

export function contractIsImmutable(contract: {signed_at?: unknown; contract_status?: unknown}) {
  return !!contract.signed_at || !['draft', 'pending_signature'].includes(String(contract.contract_status));
}
