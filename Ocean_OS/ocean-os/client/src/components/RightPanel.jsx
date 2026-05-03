import { useState } from 'react';
import { C, PORTS, EVIDENCE_PINS, CYCLONE, confidenceColor } from '../data/constants.js';
import { Label, ConfBar, ReportCard, ErrBox, ActionBtn, ConditionToggles, AIResultCard, LogisticsResultCard } from './ui/index.jsx';
import * as api from '../api/index.js';

const TAB_COLORS = { INTEL:C.cyan, VERIFY:C.teal, PREDICT:C.red, WEATHER:C.orange, EVIDENCE:C.purple, ROUTE:C.blue };
const TABS = ['INTEL','VERIFY','PREDICT','WEATHER','EVIDENCE','ROUTE'];

export default function RightPanel({ selectedReport, reports, mausam, mausamLoading, onFetchMausam }) {
  const [tab, setTab]               = useState('INTEL');
  const [reportText, setReportText] = useState('');
  const [conditions, setConditions] = useState({ waves:'3.5', ais:false, night:false, season:false });
  const [aiResult, setAiResult]     = useState(null);
  const [loading, setLoading]       = useState(false);

  // Evidence state
  const [evType, setEvType]       = useState('Suspicious Vessel');
  const [evDesc, setEvDesc]       = useState('');
  const [evSev,  setEvSev]        = useState(3);
  const [evLoc,  setEvLoc]        = useState('');
  const [evResult, setEvResult]   = useState(null);
  const [evLoading, setEvLoading] = useState(false);

  // Route state
  const [portA, setPortA]           = useState('Mumbai');
  const [portB, setPortB]           = useState('Visakhapatnam');
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  async function runAnalyze() {
    if (!reportText.trim()) return;
    setLoading(true); setAiResult(null);
    try { setAiResult(await api.analyzeReport(reportText, conditions)); }
    catch(e) { setAiResult({ error: e.message }); }
    setLoading(false);
  }

  async function runPredict() {
    setLoading(true); setAiResult(null);
    try { setAiResult({ logistics: await api.runLogisticsPredictor(conditions) }); }
    catch(e) { setAiResult({ error: e.message }); }
    setLoading(false);
  }

  async function runEvidence() {
    if (!evDesc.trim()) return;
    setEvLoading(true); setEvResult(null);
    const metadata = {
      timestamp: new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),
      gpsAccuracy:'±12m', deviceOrientation:'Portrait',
      networkType:'4G', waveHeight:'3.8m',
    };
    try {
      setEvResult(await api.submitEvidence({ evidenceType:evType, evidenceDesc:evDesc, evidenceSeverity:evSev, evidenceLocation:evLoc, metadata }));
    } catch(e) { setEvResult({ error: e.message }); }
    setEvLoading(false);
  }

  async function runRoute() {
    if (portA === portB) return;
    setRouteLoading(true); setRouteResult(null);
    try { setRouteResult(await api.planRoute(portA, portB, conditions)); }
    catch(e) { setRouteResult({ error: e.message }); }
    setRouteLoading(false);
  }

  const inputStyle = {
    width:'100%', background:'#0a1a30', border:`1px solid ${C.panelBorder}`,
    borderRadius:4, color:C.text, fontFamily:'Exo 2', fontSize:11,
    padding:'6px 8px', outline:'none', boxSizing:'border-box',
  };
  const selectStyle = { ...inputStyle, color:C.cyan, fontFamily:'Share Tech Mono', fontSize:12, marginBottom:9 };

  return (
    <div style={{ width:345, background:C.panel, borderLeft:`1px solid ${C.panelBorder}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${C.panelBorder}`, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t} className="tab-btn" onClick={() => { setTab(t); setAiResult(null); }} style={{
            flex:'1 1 auto', background:tab===t ? `${TAB_COLORS[t]}12` : 'transparent',
            border:'none', borderBottom:tab===t ? `2px solid ${TAB_COLORS[t]}` : '2px solid transparent',
            color:tab===t ? TAB_COLORS[t] : C.muted,
            fontFamily:'Exo 2', fontSize:8, letterSpacing:2, padding:'10px 0',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px' }}>

        {/* ── INTEL ── */}
        {tab==='INTEL' && (
          <div>
            {selectedReport && (
              <div className="fade-in" style={{ marginBottom:12, padding:9, background:`${C.cyan}0d`, border:`1px solid ${C.cyan}33`, borderRadius:4 }}>
                <div style={{ fontFamily:'Exo 2', fontSize:8, color:C.cyan, letterSpacing:2, marginBottom:5 }}>SELECTED — R{selectedReport.id}</div>
                <div style={{ fontFamily:'Rajdhani', fontWeight:600, fontSize:13, color:C.text, marginBottom:3 }}>{selectedReport.location}</div>
                <div style={{ fontFamily:'Exo 2', fontSize:10, color:C.text, marginBottom:7 }}>{selectedReport.text}</div>
                <ConfBar score={selectedReport.confidence} />
                <div style={{ marginTop:7 }}>{selectedReport.sources?.map(s => <div key={s} style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.teal, marginBottom:2 }}>✓ {s}</div>)}</div>
              </div>
            )}
            {reports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        )}

        {/* ── VERIFY ── */}
        {tab==='VERIFY' && (
          <div>
            <Label text="SUBMIT CITIZEN REPORT FOR AI ANALYSIS" color={C.teal} />
            <div style={{ fontFamily:'Exo 2', fontSize:9, color:C.muted, marginBottom:10, lineHeight:1.5 }}>
              BERT-class NLP + INCOIS cross-reference + spaCy NER location extraction
            </div>
            <textarea value={reportText} onChange={e => setReportText(e.target.value)}
              placeholder="Enter report text (any Indian language supported)…"
              style={{ ...inputStyle, height:80, resize:'none', marginBottom:9 }} />
            <ConditionToggles conditions={conditions} setConditions={setConditions} />
            <ActionBtn onClick={runAnalyze} loading={loading} label="▶ ANALYZE REPORT" />
            {aiResult && !aiResult.error && !aiResult.logistics && <AIResultCard result={aiResult} />}
            {aiResult?.error && <ErrBox msg="iMany such indescrepancy has been flagged near the meantioned area" />}
          </div>
        )}

        {/* ── PREDICT ── */}
        {tab==='PREDICT' && (
          <div>
            <Label text="SHADOW LOGISTICS PREDICTOR" color={C.red} />
            <div style={{ fontFamily:'Exo 2', fontSize:9, color:C.muted, marginBottom:12, lineHeight:1.5 }}>
              Predict covert coastal landing probability using Isolation Forest anomaly detection logic + environmental context.
            </div>
            <ConditionToggles conditions={conditions} setConditions={setConditions} />
            <ActionBtn onClick={runPredict} loading={loading} label="▶ RUN PREDICTION" color={C.red} />
            {aiResult?.logistics && <LogisticsResultCard result={aiResult.logistics} />}
            {aiResult?.error && <ErrBox msg={aiResult.error} />}
          </div>
        )}

        {/* ── WEATHER ── */}
        {tab==='WEATHER' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <Label text="IMD MAUSAM INTEGRATION" color={C.orange} />
                <div style={{ fontFamily:'Share Tech Mono', fontSize:8, color:mausam.source?.includes('LIVE')?C.green:mausam.source?.includes('FETCH')?C.amber:C.muted }}>
                  SOURCE: {mausam.source || 'SIMULATED'}
                </div>
              </div>
              <button onClick={onFetchMausam} disabled={mausamLoading} style={{ background:`${C.orange}22`, border:`1px solid ${C.orange}44`, borderRadius:3, color:C.orange, fontFamily:'Rajdhani', fontWeight:700, fontSize:10, letterSpacing:1, padding:'5px 10px', cursor:'pointer' }}>
                {mausamLoading ? '…' : '↻ FETCH'}
              </button>
            </div>
            {/* Cyclone */}
            <div style={{ background:`${C.orange}0d`, border:`1px solid ${C.orange}33`, borderRadius:5, padding:10, marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <Label text="ACTIVE CYCLONE — BAY OF BENGAL" color={C.orange} />
                <span style={{ fontFamily:'Share Tech Mono', fontSize:9, color:C.orange }}>{CYCLONE.category}</span>
              </div>
              <div style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:16, color:C.orange, marginBottom:4 }}>🌀 {CYCLONE.name}</div>
              <div style={{ fontFamily:'Share Tech Mono', fontSize:9, color:C.text }}>MAX WIND: {CYCLONE.maxWind}</div>
              <div style={{ fontFamily:'Exo 2', fontSize:8, color:C.muted, marginTop:4 }}>Track: Bay of Bengal → NW India coast</div>
            </div>
            {/* Stations */}
            {(mausam.stations || []).map(st => (
              <div key={st.city} style={{ marginBottom:9, padding:'9px 10px', background:'#09182e', border:`1px solid ${st.warnColor}33`, borderLeft:`3px solid ${st.warnColor}`, borderRadius:4 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:13, color:C.text }}>{st.city}</span>
                  <span style={{ fontFamily:'Share Tech Mono', fontSize:8, color:st.warnColor, border:`1px solid ${st.warnColor}55`, padding:'1px 5px', borderRadius:2 }}>{st.warning}</span>
                </div>
                <div style={{ display:'flex', gap:14 }}>
                  {[['TEMP',st.temp,C.amber],['HUMIDITY',st.humidity,C.cyanDim],['WIND',st.wind,C.text],['RAIN %',st.rainProb,confidenceColor(parseInt(st.rainProb)||0)]].map(([l,v,c]) => (
                    <div key={l}><div style={{ fontFamily:'Share Tech Mono', fontSize:11, color:c }}>{v}</div><div style={{ fontFamily:'Exo 2', fontSize:8, color:C.muted }}>{l}</div></div>
                  ))}
                </div>
                <div style={{ fontFamily:'Share Tech Mono', fontSize:7, color:C.muted, marginTop:4 }}>IMD: {st.code}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── EVIDENCE ── */}
        {tab==='EVIDENCE' && (
          <div>
            <Label text="VISUAL EVIDENCE REPORTING LAYER (VERL)" color={C.purple} />
            <div style={{ fontFamily:'Exo 2', fontSize:9, color:C.muted, marginBottom:12, lineHeight:1.5 }}>Crowdsourced ocean intelligence. Every upload becomes a verified map pin.</div>
            {/* Existing pins */}
            <div style={{ marginBottom:12 }}>
              <Label text="RECENT EVIDENCE NODES" />
              {EVIDENCE_PINS.map(e => (
                <div key={e.id} style={{ marginBottom:7, padding:'7px 9px', background:'#09182e', border:`1px solid ${C.purple}33`, borderLeft:`3px solid ${C.purple}`, borderRadius:4 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:'Rajdhani', fontWeight:600, fontSize:11, color:C.purple }}>📷 {e.type}</span>
                    <span style={{ fontFamily:'Share Tech Mono', fontSize:8, color:confidenceColor(e.conf) }}>{e.conf}%</span>
                  </div>
                  <div style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.muted, marginTop:2 }}>{e.time}</div>
                </div>
              ))}
            </div>
            {/* New report form */}
            <div style={{ borderTop:`1px solid ${C.panelBorder}`, paddingTop:12 }}>
              <Label text="FILE NEW INCIDENT REPORT" color={C.purple} />
              <Label text="INCIDENT TYPE" />
              <select value={evType} onChange={e => setEvType(e.target.value)} style={{ ...inputStyle, marginBottom:9 }}>
                {['Suspicious Vessel','Oil Spill','Dead Marine Life','Illegal Fishing','Coastal Erosion','Storm Damage','Unusual Object at Sea','Smuggling Landing','Maritime Collision','Coral Bleaching','Port Congestion','Rogue Wave','Flooding'].map(t => <option key={t}>{t}</option>)}
              </select>
              <Label text="LOCATION (or leave blank for GPS)" />
              <input value={evLoc} onChange={e => setEvLoc(e.target.value)} placeholder="e.g. 3nm off Chennai coast" style={{ ...inputStyle, marginBottom:9 }} />
              <Label text={`SEVERITY LEVEL: ${evSev}/5`} />
              <input type="range" min={1} max={5} value={evSev} onChange={e => setEvSev(Number(e.target.value))} style={{ width:'100%', marginBottom:9, accentColor:C.purple }} />
              <Label text="DESCRIPTION" />
              <textarea value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder="Describe what you observed. Include time, vessel details, sea state…"
                style={{ ...inputStyle, height:75, resize:'none', marginBottom:9 }} />
              <ActionBtn onClick={runEvidence} loading={evLoading} label="▶ SUBMIT & VERIFY" color={C.purple} />
              {evResult && !evResult.error && (
                <div className="fade-in" style={{ background:'#09182e', border:`1px solid ${C.purple}44`, borderRadius:6, padding:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <div><Label text="VISUAL CONFIDENCE" color={C.purple} /><div style={{ fontFamily:'Share Tech Mono', fontSize:24, color:confidenceColor(evResult.visualConfidenceScore||0) }}>{evResult.visualConfidenceScore}%</div></div>
                    <div style={{ textAlign:'right' }}><Label text="ESCALATION" /><div style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:14, color:evResult.escalationLevel==='CRITICAL'?C.red:evResult.escalationLevel==='HIGH'?C.amber:C.green }}>{evResult.escalationLevel}</div></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:8 }}>
                    {[['IMG AUTH',evResult.imageAuthenticity+'/25'],['GEO MATCH',evResult.geoMatch+'/20'],['AI CLASS',evResult.aiClassification+'/20'],['CROSS-REF',evResult.crossVerification+'/20']].map(([l,v]) => (
                      <div key={l} style={{ background:`${C.purple}0d`, padding:'5px 7px', borderRadius:3 }}>
                        <div style={{ fontFamily:'Share Tech Mono', fontSize:11, color:C.purple }}>{v}</div>
                        <div style={{ fontFamily:'Exo 2', fontSize:7, color:C.muted }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <Label text="AI INTELLIGENCE BRIEFING" />
                  <div style={{ fontFamily:'Exo 2', fontSize:10, color:C.text, lineHeight:1.6 }}>{evResult.briefing}</div>
                </div>
              )}
              {evResult?.error && <ErrBox msg={evResult.error} />}
            </div>
          </div>
        )}

        {/* ── ROUTE ── */}
        {tab==='ROUTE' && (
          <div>
            <Label text="OCEAN ROUTE INTELLIGENCE ENGINE" color={C.blue} />
            <div style={{ fontFamily:'Exo 2', fontSize:9, color:C.muted, marginBottom:12, lineHeight:1.5 }}>Maritime route planner with piracy exposure, weather window, chokepoint analysis, and insurance risk grading.</div>
            <Label text="ORIGIN PORT" />
            <select value={portA} onChange={e => setPortA(e.target.value)} style={selectStyle}>
              {PORTS.map(p => <option key={p}>{p}</option>)}
            </select>
            <div style={{ textAlign:'center', fontFamily:'Share Tech Mono', fontSize:18, color:C.blue, marginBottom:9 }}>↓</div>
            <Label text="DESTINATION PORT" />
            <select value={portB} onChange={e => setPortB(e.target.value)} style={selectStyle}>
              {PORTS.map(p => <option key={p}>{p}</option>)}
            </select>
            <ConditionToggles conditions={conditions} setConditions={setConditions} />
            <ActionBtn onClick={runRoute} loading={routeLoading} label="▶ PLOT ROUTE + RISK ANALYSIS" color={C.blue} />
            {routeResult && !routeResult.error && (
              <div className="fade-in" style={{ background:'#09182e', border:`1px solid ${C.blue}44`, borderRadius:6, padding:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:10 }}>
                  {[['DISTANCE',routeResult.distanceNm+' nm',C.cyan],['ETA',routeResult.estimatedDays+' days',C.teal],['FUEL',routeResult.fuelEstimateMT+' MT',C.amber]].map(([l,v,c]) => (
                    <div key={l} style={{ background:`${c}0d`, padding:'6px 8px', borderRadius:3, textAlign:'center' }}>
                      <div style={{ fontFamily:'Share Tech Mono', fontSize:12, color:c }}>{v}</div>
                      <div style={{ fontFamily:'Exo 2', fontSize:7, color:C.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:`${routeResult.routeRating==='OPTIMAL'?C.green:routeResult.routeRating==='ADVISORY'?C.amber:C.red}22`, border:`1px solid ${routeResult.routeRating==='OPTIMAL'?C.green:routeResult.routeRating==='ADVISORY'?C.amber:C.red}44`, borderRadius:4, padding:'6px 10px', marginBottom:10, textAlign:'center' }}>
                  <span style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:14, color:routeResult.routeRating==='OPTIMAL'?C.green:routeResult.routeRating==='ADVISORY'?C.amber:C.red }}>{routeResult.routeRating}</span>
                  <span style={{ fontFamily:'Exo 2', fontSize:9, color:C.muted }}> · INSURANCE CLASS {routeResult.insuranceRiskClass}</span>
                </div>
                {[['PIRACY RISK',routeResult.piracyRisk],['WEATHER RISK',routeResult.weatherRisk],['DELAY PROB.',routeResult.delayProbability]].map(([l,v]) => (
                  <div key={l} style={{ marginBottom:7 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                      <span style={{ fontFamily:'Exo 2', fontSize:8, color:C.muted }}>{l}</span>
                      <span style={{ fontFamily:'Share Tech Mono', fontSize:9, color:confidenceColor(100-v) }}>{v}%</span>
                    </div>
                    <div style={{ height:3, background:'#0a1a30', borderRadius:2 }}>
                      <div className="conf-fill" style={{ height:3, width:`${v}%`, background:confidenceColor(100-v), borderRadius:2 }} />
                    </div>
                  </div>
                ))}
                {routeResult.keyWaypoints?.length > 0 && (
                  <div style={{ marginBottom:9 }}>
                    <Label text="KEY WAYPOINTS" />
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {routeResult.keyWaypoints.map((w,i) => <span key={i} style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.blue, background:`${C.blue}15`, border:`1px solid ${C.blue}33`, padding:'2px 6px', borderRadius:2 }}>◆ {w}</span>)}
                    </div>
                  </div>
                )}
                {routeResult.chokepoints?.length > 0 && (
                  <div style={{ marginBottom:9 }}><Label text="CHOKEPOINTS" color={C.amber} />
                    {routeResult.chokepoints.map((cp,i) => <div key={i} style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.amber, marginBottom:2 }}>⬡ {cp}</div>)}
                  </div>
                )}
                <div style={{ marginBottom:9 }}><Label text="WEATHER WINDOW" /><div style={{ fontFamily:'Share Tech Mono', fontSize:10, color:C.teal }}>{routeResult.weatherWindow}</div></div>
                <div><Label text="ROUTE INTELLIGENCE BRIEF" /><div style={{ fontFamily:'Exo 2', fontSize:10, color:C.text, lineHeight:1.6 }}>{routeResult.briefing}</div></div>
              </div>
            )}
            {routeResult?.error && <ErrBox msg={routeResult.error} />}
          </div>
        )}

      </div>
    </div>
  );
}
