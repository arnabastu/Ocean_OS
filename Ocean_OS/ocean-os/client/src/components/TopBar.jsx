import { C, LAYER_DEFS } from '../data/constants.js';

export default function TopBar({ activeLayers, backendStatus }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour12:false });
  const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

  return (
    <div style={{ background:C.panel, borderBottom:`1px solid ${C.panelBorder}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:54, flexShrink:0 }}>

      {/* Brand */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.cyan, boxShadow:`0 0 10px ${C.cyan}`, animation:'glow-cyan 2s ease-in-out infinite' }} />
          <span style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:19, color:C.cyan, letterSpacing:3 }}>OCEAN OS</span>
          <span style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.red, border:`1px solid ${C.red}55`, padding:'1px 6px', borderRadius:2, letterSpacing:1 }}>CIFN · EVOLVED</span>
          {backendStatus && (
            <span style={{ fontFamily:'Share Tech Mono', fontSize:7, color:backendStatus==='ONLINE'?C.green:C.red, border:`1px solid ${backendStatus==='ONLINE'?C.green:C.red}55`, padding:'1px 6px', borderRadius:2 }}>
              <span className={backendStatus==='ONLINE'?'blink':''}>●</span> SERVER {backendStatus}
            </span>
          )}
        </div>
        <span style={{ fontFamily:'Exo 2', fontWeight:200, fontSize:8, color:C.muted, letterSpacing:4, marginLeft:17 }}>OCEAN INTELLIGENCE &amp; MARITIME OPERATING SYSTEM</span>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:24, alignItems:'center' }}>
        {[
          { label:'ACTIVE LAYERS', val:activeLayers,  color:C.teal  },
          { label:'THREAT LEVEL',  val:'ELEVATED',     color:C.amber },
          { label:'AIS WATCHES',   val:'04',           color:C.red   },
          { label:'INTEL FEEDS',   val:'07 ONLINE',    color:C.cyan  },
        ].map(item => (
          <div key={item.label} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:14, color:item.color, fontWeight:'bold' }}>{item.val}</div>
            <div style={{ fontFamily:'Exo 2', fontSize:7, color:C.muted, letterSpacing:1 }}>{item.label}</div>
          </div>
        ))}

        {/* Clock */}
        <div style={{ borderLeft:`1px solid ${C.panelBorder}`, paddingLeft:20 }}>
          <div style={{ fontFamily:'Share Tech Mono', fontSize:16, color:C.text }}>{timeStr}</div>
          <div style={{ fontFamily:'Exo 2', fontSize:7, color:C.muted, letterSpacing:1 }}>{dateStr} · IST</div>
        </div>
      </div>
    </div>
  );
}
