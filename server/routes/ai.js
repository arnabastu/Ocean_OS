const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

async function claudeJSON(system, userMsg, maxTokens = 1000) {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userMsg }],
  });
  const raw = msg.content.find(b => b.type === 'text')?.text || '{}';
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

// POST /api/ai/analyze — Citizen report threat analysis
router.post('/analyze', async (req, res) => {
  const { reportText, conditions } = req.body;
  if (!reportText?.trim()) return res.status(400).json({ error: 'No report text provided' });
  try {
    const condStr = `Wave height: ${conditions.waves}m. AIS disabled: ${conditions.ais}. Night op: ${conditions.night}. Off-season: ${conditions.season}.`;
    const result = await claudeJSON(
      `You are OCEAN OS / CIFN-AI, the maritime intelligence core for India's coastal security. Analyze citizen reports for credibility and threat classification. Respond ONLY with a valid JSON object (no markdown, no extra text): {"credibilityScore":0-100,"threatClass":"HAZARD"|"ANOMALY"|"LOGISTICS"|"SAFE","confidence":"HIGH"|"MEDIUM"|"LOW","summary":"2 sentence analysis","recommendedAction":"1 sentence","crossReferenceFlags":["flag1"],"logisticsRisk":0-100}`,
      `Citizen Report: "${reportText}"\n\nConditions: ${condStr}\n\nAnalyze for OCEAN OS maritime intelligence.`
    );
    res.json(result);
  } catch (e) {
    console.error('[ANALYZE]', e.message);
    res.status(500).json({ error: 'Analysis failed: ' + e.message });
  }
});

// POST /api/ai/predict — Shadow logistics predictor
router.post('/predict', async (req, res) => {
  const { conditions } = req.body;
  try {
    const condStr = `Wave height: ${conditions.waves}m. AIS disabled: ${conditions.ais}. Night: ${conditions.night}. Off-season: ${conditions.season}.`;
    const result = await claudeJSON(
      `You are OCEAN OS Shadow Logistics Predictor. Predict covert coastal operation probability. ONLY valid JSON, no markdown: {"covertLandingProbability":0-100,"predictedOperation":"string","highRiskZones":["zone1","zone2"],"timeWindow":"hh:mm-hh:mm IST","recommendedPatrol":"string","intelligenceGrade":"A"|"B"|"C","reasoning":"2-3 sentences"}`,
      `Conditions: ${condStr}\n\nPredict covert coastal operation probability for next 6 hours.`
    );
    res.json(result);
  } catch (e) {
    console.error('[PREDICT]', e.message);
    res.status(500).json({ error: 'Prediction failed: ' + e.message });
  }
});

// POST /api/ai/evidence — VERL evidence verification
router.post('/evidence', async (req, res) => {
  const { evidenceType, evidenceDesc, evidenceSeverity, evidenceLocation, metadata } = req.body;
  if (!evidenceDesc?.trim()) return res.status(400).json({ error: 'No description provided' });
  try {
    const result = await claudeJSON(
      `You are the OCEAN OS Visual Evidence AI Verification Engine (VERL). Analyze submitted incident reports and auto-captured metadata. ONLY valid JSON, no markdown: {"visualConfidenceScore":0-100,"imageAuthenticity":0-25,"geoMatch":0-20,"aiClassification":0-20,"crossVerification":0-20,"userTrustFactor":0-15,"incidentCategory":"string","aiDetectedElements":["element1","element2"],"crossRefStatus":"MATCH"|"PARTIAL"|"NO_MATCH","escalationLevel":"LOW"|"MEDIUM"|"HIGH"|"CRITICAL","briefing":"2 sentence intelligence briefing","mapPin":{"color":"RED"|"AMBER"|"TEAL","icon":"string"}}`,
      `Incident Type: ${evidenceType}\nLocation: ${evidenceLocation || 'Auto-GPS'}\nSeverity: ${evidenceSeverity}/5\nDescription: "${evidenceDesc}"\nAuto-Metadata: ${JSON.stringify(metadata)}\n\nRun VERL verification pipeline.`,
      900
    );
    res.json(result);
  } catch (e) {
    console.error('[EVIDENCE]', e.message);
    res.status(500).json({ error: 'Verification failed: ' + e.message });
  }
});

// POST /api/ai/route — Maritime route planner
router.post('/route', async (req, res) => {
  const { portA, portB, conditions } = req.body;
  if (!portA || !portB || portA === portB)
    return res.status(400).json({ error: 'Provide two distinct ports' });
  try {
    const month = new Date().toLocaleString('en', { month: 'long' });
    const result = await claudeJSON(
      `You are the OCEAN OS Maritime Route Intelligence Engine. Compute optimal Indian Ocean routes with full risk analysis. ONLY valid JSON, no markdown: {"distanceNm":number,"estimatedDays":number,"fuelEstimateMT":number,"routeRating":"OPTIMAL"|"ADVISORY"|"HIGH_RISK","chokepoints":["name"],"piracyRisk":0-100,"weatherRisk":0-100,"delayProbability":0-100,"insuranceRiskClass":"A"|"B"|"C"|"D","alternateRoute":"string","weatherWindow":"string","keyWaypoints":["wp1","wp2","wp3"],"briefing":"3 sentence route intelligence brief"}`,
      `Plan maritime route: ${portA} to ${portB} (Indian coast). Wave height: ${conditions.waves}m. Season: ${month}. Include full OCEAN OS risk analysis.`
    );
    res.json(result);
  } catch (e) {
    console.error('[ROUTE]', e.message);
    res.status(500).json({ error: 'Route planning failed: ' + e.message });
  }
});

module.exports = router;
