export interface CompanyPricing {
  base_rate_per_km: number;
  base_rate_per_minute: number;
  minimum_fare: number;
  airport_surcharge: number;
  night_surcharge_percentage: number;
  peak_hour_surcharge_percentage: number;
  night_start_hour: number;
  night_end_hour: number;
  peak_hours: Array<{start: string; end: string}>;
}

const defaults: CompanyPricing = {
  base_rate_per_km: 2, base_rate_per_minute: 0.5, minimum_fare: 10,
  airport_surcharge: 5, night_surcharge_percentage: 20, peak_hour_surcharge_percentage: 15,
  night_start_hour: 22, night_end_hour: 6,
  peak_hours: [{start: '07:00', end: '09:00'}, {start: '17:00', end: '19:00'}],
};

export class PricingValidationError extends Error {}

function numericField(key: string, value: unknown): number {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
    throw new PricingValidationError(`قيمة التسعير غير صالحة: ${key}`);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > Number.MAX_SAFE_INTEGER) throw new PricingValidationError(`قيمة التسعير غير صالحة: ${key}`);
  if ((key === 'night_start_hour' || key === 'night_end_hour') && (!Number.isInteger(number) || number > 23)) {
    throw new PricingValidationError('ساعات الفترة الليلية يجب أن تكون أعداداً صحيحة بين 0 و23');
  }
  return number;
}

function peakPeriods(value: unknown): CompanyPricing['peak_hours'] {
  if (!Array.isArray(value) || value.length > 24) throw new PricingValidationError('قائمة ساعات الذروة غير صالحة');
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  return value.map(period => {
    if (!period || typeof period !== 'object' || typeof period.start !== 'string' || typeof period.end !== 'string' ||
        !time.test(period.start) || !time.test(period.end) || period.start === period.end) throw new PricingValidationError('حدد بداية ونهاية مختلفتين وصحيحتين لفترة الذروة');
    return {start: period.start, end: period.end};
  });
}

/** Validate only supplied fields; null is never an instruction to silently restore a default. */
export function companyPricingPatch(input: Record<string, unknown>): Partial<CompanyPricing> {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(defaults)) {
    if (Object.hasOwn(input, key)) patch[key] = key === 'peak_hours' ? peakPeriods(input[key]) : numericField(key, input[key]);
  }
  return patch as Partial<CompanyPricing>;
}

/** Existing unset fields keep the legacy defaults; configured zeroes remain zero. */
export function normalizeCompanyPricing(input: Record<string, unknown>): CompanyPricing {
  const values: Record<string, unknown> = {};
  for (const [key, fallback] of Object.entries(defaults)) values[key] = input[key] ?? fallback;
  return companyPricingPatch(values) as CompanyPricing;
}

export function driverPricing(company: Record<string, unknown>) {
  const pricing = normalizeCompanyPricing(company);
  return {
    base_fee: pricing.minimum_fare, km_rate: pricing.base_rate_per_km,
    minute_rate: pricing.base_rate_per_minute, minimum_fare: pricing.minimum_fare,
    airport_fee: pricing.airport_surcharge,
    night_fee: pricing.minimum_fare * pricing.night_surcharge_percentage / 100,
    night_surcharge_percentage: pricing.night_surcharge_percentage,
    peak_hour_surcharge_percentage: pricing.peak_hour_surcharge_percentage,
    night_start_hour: pricing.night_start_hour, night_end_hour: pricing.night_end_hour,
    peak_hours: pricing.peak_hours,
  };
}
