import type {RevenueSummary} from './api';

const driverSharePercent = 45;

export function estimateDriverBalance(summary:Pick<RevenueSummary,'total_revenue'|'payment_stats'>) {
  const grossCents = Math.round(summary.total_revenue * 100);
  const shareCents = Math.round(grossCents * driverSharePercent / 100);
  const cashCents = ['cash','contant'].reduce((sum, method) =>
    sum + Math.round((summary.payment_stats[method]?.revenue ?? 0) * 100), 0);

  return {share:shareCents/100, cash:cashCents/100, balance:(shareCents-cashCents)/100};
}
