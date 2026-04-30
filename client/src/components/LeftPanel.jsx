import { C, LAYER_DEFS } from '../data/constants.js';
import { Section, Stat } from './ui/index.jsx';

export default function LeftPanel({ layers, setLayers, reports, vessels, agencies, oceanConditions, loading }) {
  return (
    <div style={{ width:220, background:C.panel, borderRight:`1px solid ${C.panelBorder}`, display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0 }}>

      {/* Layer Toggles */}
      <Section title="MAP LAYERS" accent={C.cyan}>
        {LAYER_DEFS.map(l => (
          <div key={l.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, cursor:'pointer' }}
            onClick={() => setLayers(prev => ({...prev, [l.id]:!prev[l.id]}))}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11 }}>{l.icon}</span>
              <span style={{ fontFamily:'Exo 2', fontSize:9, color:layers[l.id] ? l.color : C.muted }}>{l.label}</span>
            </div>
            <div className="toggle-track" style={{ width:26, height:13, borderRadius:7, background:layers[l.id] ? l.color : C.panelBorder, position:'relative', flexShrink:0 }}>
              <div className="toggle-thumb" style={{ position:'absolute', top:1.5, left:layers[l.id] ? 14 : 1.5, width:10, height:10, borderRadius:'50%', background:C.white }} />
            </div>
          </div>
        ))}
      </Section>

      {/* Agency Status */}
      <Section title="AGENCY STATUS">
        {loading.agencies
          ? <div style={{ fontFamily:'Share Tech Mono', fontSize:9, color:C.muted }}>LOADING…</div>
          : agencies.map(a => (
            <div key={a.short} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <div>
                <div style={{ fontFamily:'Rajdhani', fontWeight:600, fontSize:11, color:C.text }}>{a.short}</div>
                <div style={{ fontFamily:'Exo 2', fontSize:8, color:C.muted }}>{a.name}</div>
              </div>
              <div style={{ fontFamily:'Share Tech Mono', fontSize:8, color:a.color, border:`1px solid ${a.color}`, borderRadius:2, padding:'1px 4px', letterSpacing:1 }}>{a.status}</div>
            </div>
          ))
        }
      </Section>

      {/* Ocean Conditions */}
      <Section title="OCEAN CONDITIONS">
        {loading.ocean
          ? <div style={{ fontFamily:'Share Tech Mono', fontSize:9, color:C.muted }}>LOADING…</div>
          : oceanConditions.map(oc => (
            <div key={oc.label} style={{ marginBottom:9, paddingBottom:9, borderBottom:`1px solid ${C.panelBorder}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontFamily:'Rajdhani', fontWeight:600, fontSize:10, color:C.text }}>{oc.label}</span>
                <span style={{ fontFamily:'Share Tech Mono', fontSize:8, color:oc.color }}>{oc.state}</span>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <Stat label="WAVE" val={oc.waveH} color={oc.color} />
                <Stat label="SST"  val={oc.sst}   color={C.cyanDim} />
              </div>
            </div>
          ))
        }
      </Section>

      {/* AIS Anomalies */}
      <Section title="AIS ANOMALIES">
        {loading.vessels
          ? <div style={{ fontFamily:'Share Tech Mono', fontSize:9, color:C.muted }}>LOADING…</div>
          : vessels.map(v => (
            <div key={v.id} style={{ marginBottom:7, padding:'5px 7px', background:'#09182e', border:`1px solid ${v.risk>80?C.red:C.amber}33`, borderRadius:4 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontFamily:'Share Tech Mono', fontSize:10, color:v.risk>80?C.red:C.amber }}>{v.id}</span>
                <span style={{ fontFamily:'Share Tech Mono', fontSize:9, color:C.text }}>R:{v.risk}</span>
              </div>
              <div style={{ fontFamily:'Exo 2', fontSize:8, color:C.muted, marginTop:1 }}>{v.type}</div>
              <div style={{ fontFamily:'Exo 2', fontSize:8, color:C.text, marginTop:1 }}>{v.detail}</div>
            </div>
          ))
        }
      </Section>
    </div>
  );
}
