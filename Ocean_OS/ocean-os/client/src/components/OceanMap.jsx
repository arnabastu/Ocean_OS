import { C, COAST_PATH, REPORT_SVG, AIS_SVG, LAYER_DEFS, CYCLONE, NEWS_PINS, EVIDENCE_PINS, typeBadge } from '../data/constants.js';
import { PulseDot } from './ui/index.jsx';

export default function OceanMap({ selectedReport, onSelectReport, layers, reports, vessels }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg, position:'relative', overflow:'hidden' }}>
      {/* Grid overlay */}
      <div className="map-grid" />
      {/* Scan line */}
      <div className="scanline" />

      {/* Map header */}
      <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.panelBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, position:'relative', zIndex:1 }}>
        <span style={{ fontFamily:'Exo 2', fontSize:9, letterSpacing:2, color:C.muted }}>INDIAN OCEAN REGION — LIVE INTELLIGENCE MAP</span>
        <div style={{ display:'flex', gap:12 }}>
          {[{label:'HAZARD',c:C.amber},{label:'ANOMALY',c:C.cyan},{label:'LOGISTICS',c:C.red},{label:'DARK VESSEL',c:C.red},{label:'MAUSAM',c:C.orange},{label:'EVIDENCE',c:C.purple}].map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:l.c }} />
              <span style={{ fontFamily:'Exo 2', fontSize:8, color:C.muted }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG map */}
      <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
        <svg width="450" height="490" viewBox="0 0 450 490" style={{ filter:'drop-shadow(0 0 24px #00e5ff1a)' }}>
          {/* Ocean fill */}
          <rect x={0} y={0} width={450} height={490} fill={`${C.cyan}05`} rx={4} />
          {/* Radar rings */}
          <circle cx={220} cy={265} r={190} fill="none" stroke={`${C.cyan}0d`} strokeWidth={1} />
          <circle cx={220} cy={265} r={130} fill="none" stroke={`${C.cyan}09`} strokeWidth={1} />
          <circle cx={220} cy={265} r={70}  fill="none" stroke={`${C.cyan}06`} strokeWidth={1} />

          {/* Trade lanes */}
          {layers.ROUTE && <>
            <path d="M 65,250 L 120,215 L 160,230 L 200,260 L 245,290 L 285,315 L 340,300" fill="none" stroke={`${C.blue}55`} strokeWidth={1.5} strokeDasharray="6,4" />
            <path d="M 65,250 L 100,270 L 130,290 L 155,310 L 175,335 L 200,355 L 240,380" fill="none" stroke={`${C.blue}44`} strokeWidth={1} strokeDasharray="4,3" />
            <text x={170} y={295} fill={`${C.blue}88`} fontSize="7" fontFamily="Share Tech Mono">SHIPPING LANE</text>
          </>}

          {/* Cyclone path */}
          {layers.WEATHER && CYCLONE.path.map(([x,y],i) =>
            i < CYCLONE.path.length-1
              ? <line key={i} x1={x} y1={y} x2={CYCLONE.path[i+1][0]} y2={CYCLONE.path[i+1][1]} stroke={C.orange} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.6} />
              : null
          )}
          {layers.WEATHER && <>
            <circle cx={CYCLONE.svgX} cy={CYCLONE.svgY} r={18} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={1} opacity={0.8}>
              <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x={CYCLONE.svgX} y={CYCLONE.svgY+1} textAnchor="middle" dominantBaseline="middle" fill={C.orange} fontSize="10">🌀</text>
            <text x={CYCLONE.svgX+22} y={CYCLONE.svgY-8} fill={C.orange} fontSize="7" fontFamily="Share Tech Mono">{CYCLONE.name}</text>
            <text x={CYCLONE.svgX+22} y={CYCLONE.svgY+2} fill={C.orange} fontSize="7" fontFamily="Share Tech Mono">{CYCLONE.category}</text>
          </>}

          {/* Coastline */}
          <path d={COAST_PATH} fill="none" stroke={C.cyanDim} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.65} />
          <path d={`${COAST_PATH} L 370,100 L 60,100 Z`} fill={`${C.panel}aa`} stroke="none" />

          {/* India label */}
          <text x={200} y={175} fill={C.muted} fontSize={10} fontFamily="Rajdhani" textAnchor="middle" letterSpacing={4} opacity={0.45}>INDIA</text>
          <text x={415} y={245} fill={C.muted} fontSize={8} fontFamily="Share Tech Mono" opacity={0.35}>E →</text>
          <text x={220} y={18}  fill={C.muted} fontSize={8} fontFamily="Share Tech Mono" opacity={0.35}>N ↑</text>

          {/* News pins */}
          {layers.NEWS && NEWS_PINS.map(n => (
            <g key={n.id}>
              <polygon points={`${n.svgX},${n.svgY-9} ${n.svgX+7},${n.svgY} ${n.svgX},${n.svgY+9} ${n.svgX-7},${n.svgY}`} fill={`${n.color}33`} stroke={n.color} strokeWidth={1} opacity={0.9} />
              <text x={n.svgX+10} y={n.svgY+3} fill={n.color} fontSize="7" fontFamily="Share Tech Mono">{n.title}</text>
            </g>
          ))}

          {/* Evidence pins */}
          {layers.EVIDENCE && EVIDENCE_PINS.map(e => (
            <g key={e.id}>
              <circle cx={e.svgX} cy={e.svgY} r={7} fill={`${C.purple}33`} stroke={C.purple} strokeWidth={1} opacity={0.9} />
              <text x={e.svgX} y={e.svgY+3} textAnchor="middle" fill={C.purple} fontSize="8">📷</text>
            </g>
          ))}

          {/* Report dots */}
          {REPORT_SVG.map(rp => {
            const report = reports.find(r => r.id === rp.id);
            if (!report) return null;
            const color = typeBadge(report.type);
            return (
              <g key={rp.id} style={{ cursor:'pointer' }} onClick={() => onSelectReport(report)}>
                <PulseDot x={rp.x} y={rp.y} color={color} size={selectedReport?.id===report.id ? 8 : 5} label={`R${report.id}`} />
              </g>
            );
          })}

          {/* AIS anomaly markers */}
          {layers.VESSEL && AIS_SVG.map(ap => {
            const v = vessels.find(v => v.id === ap.id);
            if (!v) return null;
            return (
              <g key={ap.id}>
                <rect x={ap.x-8} y={ap.y-8} width={16} height={16} fill="none" stroke={v.risk>80?C.red:C.amber} strokeWidth={1} opacity={0.8}>
                  <animateTransform attributeName="transform" type="rotate" values={`0 ${ap.x} ${ap.y};45 ${ap.x} ${ap.y};0 ${ap.x} ${ap.y}`} dur="3s" repeatCount="indefinite" />
                </rect>
                <text x={ap.x} y={ap.y+4} textAnchor="middle" fill={v.risk>80?C.red:C.amber} fontSize="7" fontFamily="Share Tech Mono">▲</text>
              </g>
            );
          })}
        </svg>

        {/* Corner coords */}
        <div style={{ position:'absolute', bottom:14, left:14, fontFamily:'Share Tech Mono', fontSize:9, color:C.muted, lineHeight:1.8 }}>
          <div>8.0°N – 23.6°N</div>
          <div>68.0°E – 88.0°E</div>
          <div style={{ color:C.cyan, marginTop:3 }}>● INDIAN OCEAN REGION</div>
        </div>

        {/* Active layer indicators */}
        <div style={{ position:'absolute', bottom:14, right:14, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
          {LAYER_DEFS.filter(l => layers[l.id]).map(l => (
            <div key={l.id} style={{ fontFamily:'Share Tech Mono', fontSize:7, color:l.color, background:`${l.color}15`, border:`1px solid ${l.color}44`, padding:'1px 6px', borderRadius:2 }}>● {l.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
