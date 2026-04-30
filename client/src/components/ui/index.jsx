import { C, confidenceColor, typeBadge, statusBadge } from '../../data/constants.js';

// ── PulseDot ───────────────────────────────────────────────────────────────────
export function PulseDot({ x, y, color, size = 6, label }) {
  return (
    <g>
      <circle cx={x} cy={y} r={size + 6} fill={color} opacity={0.12}>
        <animate attributeName="r" values={`${size+4};${size+16};${size+4}`} dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0;0.25" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={size} fill={color} opacity={0.9} />
      {label && <text x={x+size+3} y={y+4} fill={color} fontSize="8" fontFamily="Share Tech Mono" opacity={0.85}>{label}</text>}
    </g>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export function Section({ title, children, accent }) {
  return (
    <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.panelBorder}` }}>
      <div style={{ fontFamily:'Exo 2', fontSize:9, letterSpacing:2, color:accent||C.muted, marginBottom:10, paddingBottom:5, borderBottom:`1px solid ${C.panelBorder}` }}>{title}</div>
      {children}
    </div>
  );
}

// ── Stat ───────────────────────────────────────────────────────────────────────
export function Stat({ label, val, color }) {
  return (
    <div>
      <div style={{ fontFamily:'Share Tech Mono', fontSize:11, color }}>{val}</div>
      <div style={{ fontFamily:'Exo 2', fontSize:8, color:C.muted }}>{label}</div>
    </div>
  );
}

// ── Label ──────────────────────────────────────────────────────────────────────
export function Label({ text, color }) {
  return <div style={{ fontFamily:'Exo 2', fontSize:8, color:color||C.muted, letterSpacing:2, marginBottom:3 }}>{text}</div>;
}

// ── ConfBar ────────────────────────────────────────────────────────────────────
export function ConfBar({ score }) {
  const color = confidenceColor(score);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontFamily:'Exo 2', fontSize:9, color:C.muted }}>CONFIDENCE</span>
        <span style={{ fontFamily:'Share Tech Mono', fontSize:11, color }}>{score}%</span>
      </div>
      <div style={{ height:3, background:'#0a1a30', borderRadius:2 }}>
        <div className="conf-fill" style={{ height:3, width:`${score}%`, background:color, borderRadius:2 }} />
      </div>
    </div>
  );
}

// ── ReportCard ─────────────────────────────────────────────────────────────────
export function ReportCard({ report }) {
  const sb = statusBadge(report.status), tb = typeBadge(report.type);
  return (
    <div className="fade-in" style={{ marginBottom:9, padding:'9px 11px', background:'#09182e', border:`1px solid ${C.panelBorder}`, borderLeft:`3px solid ${tb}`, borderRadius:4 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontFamily:'Rajdhani', fontWeight:600, fontSize:12, color:C.text }}>{report.location}</span>
        <span style={{ fontFamily:'Exo 2', fontSize:7, letterSpacing:1, background:sb.bg, color:sb.text, padding:'1px 5px', borderRadius:2 }}>{report.status}</span>
      </div>
      <div style={{ fontFamily:'Exo 2', fontSize:9, color:C.muted, marginBottom:5 }}>{report.text.slice(0,75)}{report.text.length>75?'…':''}</div>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.muted }}>{report.time} · {report.lang}</span>
        <span style={{ fontFamily:'Share Tech Mono', fontSize:10, color:confidenceColor(report.confidence) }}>{report.confidence}%</span>
      </div>
    </div>
  );
}

// ── ErrBox ─────────────────────────────────────────────────────────────────────
export function ErrBox({ msg }) {
  return (
    <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}44`, borderRadius:4, padding:10 }}>
      <span style={{ fontFamily:'Share Tech Mono', fontSize:11, color:C.red }}>⚠ {msg}</span>
    </div>
  );
}

// ── ActionBtn ──────────────────────────────────────────────────────────────────
export function ActionBtn({ onClick, loading, label, color }) {
  return (
    <button onClick={onClick} disabled={loading} className="action-btn" style={{
      width:'100%', background:loading ? C.muted : (color||C.cyan),
      border:'none', borderRadius:4, color:'#000',
      fontFamily:'Rajdhani', fontWeight:700, fontSize:12, letterSpacing:2,
      padding:'9px 0', cursor:loading ? 'wait' : 'pointer', marginBottom:12,
      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
    }}>
      {loading && <span className="spinner" />}
      {loading ? 'PROCESSING…' : label}
    </button>
  );
}

// ── ConditionToggles ───────────────────────────────────────────────────────────
export function ConditionToggles({ conditions, setConditions }) {
  const toggles = [
    { key:'ais',    label:'AIS Disabled Vessel Nearby' },
    { key:'night',  label:'Night Operation (00:00–04:00)' },
    { key:'season', label:'Off-Fishing Season' },
  ];
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ marginBottom:8 }}>
        <Label text="WAVE HEIGHT (m)" />
        <input type="number" min={0} max={12} step={0.1} value={conditions.waves}
          onChange={e => setConditions(c => ({...c, waves:e.target.value}))}
          style={{ width:'100%', background:'#0a1a30', border:`1px solid ${C.panelBorder}`, borderRadius:4, color:C.cyan, fontFamily:'Share Tech Mono', fontSize:13, padding:'5px 8px', boxSizing:'border-box', outline:'none' }} />
      </div>
      {toggles.map(t => (
        <label key={t.key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7, cursor:'pointer' }}>
          <div className="toggle-track"
            onClick={() => setConditions(c => ({...c, [t.key]:!c[t.key]}))}
            style={{ width:30, height:15, borderRadius:8, background:conditions[t.key] ? C.red : C.panelBorder, position:'relative', flexShrink:0 }}>
            <div className="toggle-thumb" style={{ position:'absolute', top:1.5, left:conditions[t.key] ? 16 : 2, width:11, height:11, borderRadius:'50%', background:C.white }} />
          </div>
          <span style={{ fontFamily:'Exo 2', fontSize:9, color:C.text }}>{t.label}</span>
        </label>
      ))}
    </div>
  );
}

// ── AI Result Cards ────────────────────────────────────────────────────────────
export function AIResultCard({ result }) {
  const color = confidenceColor(result.credibilityScore || 50);
  return (
    <div className="fade-in" style={{ background:'#09182e', border:`1px solid ${C.panelBorder}`, borderRadius:6, padding:13 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
        <div><Label text="THREAT CLASS" /><div style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:15, color:typeBadge(result.threatClass) }}>{result.threatClass}</div></div>
        <div style={{ textAlign:'right' }}><Label text="CREDIBILITY" /><div style={{ fontFamily:'Share Tech Mono', fontSize:22, color }}>{result.credibilityScore}%</div></div>
      </div>
      <ConfBar score={result.credibilityScore} />
      <div style={{ marginTop:9 }}><Label text="ANALYSIS" /><div style={{ fontFamily:'Exo 2', fontSize:10, color:C.text, lineHeight:1.6 }}>{result.summary}</div></div>
      <div style={{ marginTop:9 }}><Label text="ACTION" /><div style={{ fontFamily:'Exo 2', fontSize:10, color:C.teal, lineHeight:1.6 }}>{result.recommendedAction}</div></div>
      {result.crossReferenceFlags?.length > 0 && (
        <div style={{ marginTop:9 }}><Label text="CROSS-REF FLAGS" />
          {result.crossReferenceFlags.map((f,i) => <div key={i} style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.amber, marginBottom:2 }}>⚑ {f}</div>)}
        </div>
      )}
    </div>
  );
}

export function LogisticsResultCard({ result }) {
  return (
    <div className="fade-in" style={{ background:'#09182e', border:`1px solid ${C.red}44`, borderRadius:6, padding:13 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
        <div><Label text="COVERT LANDING PROB." /><div style={{ fontFamily:'Share Tech Mono', fontSize:26, color:confidenceColor(100-result.covertLandingProbability) }}>{result.covertLandingProbability}%</div></div>
        <div style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:18, color:C.white, background:result.intelligenceGrade==='A'?C.red:result.intelligenceGrade==='B'?C.amber:C.muted, width:38, height:38, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>{result.intelligenceGrade}</div>
      </div>
      <ConfBar score={result.covertLandingProbability} />
      {[
        { label:'PREDICTED OPERATION', val:result.predictedOperation },
        { label:'PATROL WINDOW',       val:result.timeWindow         },
        { label:'RECOMMENDED ACTION',  val:result.recommendedPatrol, color:C.teal },
        { label:'REASONING',           val:result.reasoning          },
      ].map(item => (
        <div key={item.label} style={{ marginTop:9 }}><Label text={item.label} /><div style={{ fontFamily:'Exo 2', fontSize:10, color:item.color||C.text, lineHeight:1.6 }}>{item.val}</div></div>
      ))}
      {result.highRiskZones?.length > 0 && (
        <div style={{ marginTop:9 }}><Label text="HIGH RISK ZONES" />
          {result.highRiskZones.map((z,i) => <div key={i} style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.red, marginBottom:2 }}>◈ {z}</div>)}
        </div>
      )}
    </div>
  );
}
