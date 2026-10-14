import {canonicalChironEnvironment} from './chiron-protocol';
export function hasNativeTripExpectation(body: Record<string, unknown>) {
  return ['expected_company_id', 'expected_vehicle_id', 'expected_chiron_environment'].some(key => Object.hasOwn(body, key));
}
export function assertNativeTripExpectation(body: Record<string, unknown>, companyId: number, vehicleId: number, environment: unknown) {
  if (!hasNativeTripExpectation(body)) return;
  if (!Number.isSafeInteger(body.expected_company_id) || !Number.isSafeInteger(body.expected_vehicle_id)
    || body.expected_company_id !== companyId || body.expected_vehicle_id !== vehicleId
    || canonicalChironEnvironment(body.expected_chiron_environment) !== canonicalChironEnvironment(environment)) {
    throw Error('Trip assignment changed');
  }
}
