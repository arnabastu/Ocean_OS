const BASE = '/api';

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Data endpoints ─────────────────────────────────────────────────────────────
export const fetchReports        = ()  => get('/data/reports');
export const fetchVessels        = ()  => get('/data/vessels');
export const fetchAgencies       = ()  => get('/data/agencies');
export const fetchOceanConditions= ()  => get('/data/ocean-conditions');
export const fetchMausam         = ()  => get('/data/mausam');
export const fetchHealth         = ()  => get('/health');

// ── AI endpoints ───────────────────────────────────────────────────────────────
export const analyzeReport = (reportText, conditions) =>
  post('/ai/analyze', { reportText, conditions });

export const runLogisticsPredictor = (conditions) =>
  post('/ai/predict', { conditions });

export const submitEvidence = (payload) =>
  post('/ai/evidence', payload);

export const planRoute = (portA, portB, conditions) =>
  post('/ai/route', { portA, portB, conditions });
