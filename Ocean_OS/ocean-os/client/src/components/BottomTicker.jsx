import { useEffect, useState } from 'react';
import { TICKER_ALERTS, C } from '../data/constants.js';

export default function BottomTicker() {
  const [offset, setOffset] = useState(0);
  const text = TICKER_ALERTS.join('  ·  ⬥  ·  ');
  const full = text + '  ·  ⬥  ·  ' + text;

  useEffect(() => {
    const id = setInterval(() => setOffset(o => o - 1), 18);
    return () => clearInterval(id);
  }, []);

  // Reset when drifted past one copy's width (approximate char width ~7.8px)
  const charWidth = 7.8;
  const resetAt   = -(text.length * charWidth);
  const safeOffset = offset < resetAt ? 0 : offset;

  return (
    <div style={{ height:30, background:'#030a15', borderTop:`1px solid ${C.red}44`, display:'flex', alignItems:'center', overflow:'hidden', flexShrink:0 }}>
      {/* LIVE badge */}
      <div style={{ background:C.red, color:'#000', fontFamily:'Rajdhani', fontWeight:700, fontSize:9, letterSpacing:2, padding:'0 12px', height:'100%', display:'flex', alignItems:'center', flexShrink:0 }}>
        <span className="blink" style={{ marginRight:4 }}>●</span> LIVE
      </div>

      {/* Scrolling text */}
      <div className="ticker-wrap">
        <div className="ticker-inner" style={{ transform:`translateX(${safeOffset}px)`, fontFamily:'Share Tech Mono', fontSize:9, color:C.amber, letterSpacing:1, padding:'0 20px' }}>
          {full}
        </div>
      </div>

      {/* Right stamp */}
      <div style={{ fontFamily:'Share Tech Mono', fontSize:8, color:C.muted, padding:'0 12px', flexShrink:0 }}>
        OCEAN OS v1.0
      </div>
    </div>
  );
}
