const SLOW_MS = 500;

const HEAVY_ROWS = 50000;

const isSlow = (metric) => metric.ExecMs > SLOW_MS;

const needsIndex = (metric) => !metric.IndexUsed && metric.Rows > HEAVY_ROWS;

const adviceOf = (metric) => {
  const advice = needsIndex(metric) ? "Составной индекс по дате и складу" : metric.IndexUsed ? "План оптимален" : "Проверить статистику";
  return advice;
};

const decorate = (metric) => Object.assign({}, metric, { slow: isSlow(metric), needsIndex: needsIndex(metric), advice: adviceOf(metric) });

const byTime = (left, right) => right.ExecMs - left.ExecMs;

export const buildMetrics = (metrics) => ({
  rows: metrics.map(decorate).sort(byTime),
  total: metrics.length,
  slow: metrics.filter(isSlow).length,
  indexCandidates: metrics.filter(needsIndex).length,
  totalMs: metrics.reduce((sum, metric) => sum + metric.ExecMs, 0),
});
