// ── Colour palette ─────────────────────────────────────────────────────────────
export const C = {
  bg:          '#040c18',
  panel:       '#07122a',
  panelBorder: '#0d2444',
  cyan:        '#00e5ff',
  cyanDim:     '#00aacc',
  teal:        '#00ffa3',
  amber:       '#ffb300',
  red:         '#ff3c5f',
  redDim:      '#cc2244',
  green:       '#00e676',
  blue:        '#2979ff',
  purple:      '#b24aff',
  orange:      '#ff6d00',
  text:        '#c8dff0',
  muted:       '#3a5a7a',
  white:       '#ffffff',
};

// ── Layer definitions ──────────────────────────────────────────────────────────
export const LAYER_DEFS = [
  { id:'ENV',      label:'OCEAN ENV',   color:C.cyan,   icon:'🌊' },
  { id:'VESSEL',   label:'AIS TRACK',   color:C.amber,  icon:'🚢' },
  { id:'THREAT',   label:'THREATS',     color:C.red,    icon:'⚠'  },
  { id:'ROUTE',    label:'TRADE LANES', color:C.blue,   icon:'🗺'  },
  { id:'NEWS',     label:'INTEL PINS',  color:C.teal,   icon:'📡' },
  { id:'EVIDENCE', label:'EVIDENCE',    color:C.purple, icon:'📷' },
  { id:'WEATHER',  label:'MAUSAM',      color:C.orange, icon:'🌀' },
];

// ── SVG map data ───────────────────────────────────────────────────────────────
export const COAST_PATH = `M 60,320 L 55,300 L 65,270 L 70,245 L 80,220
  L 95,210 L 110,205 L 120,200 L 130,195 L 145,200
  L 155,215 L 165,230 L 170,250 L 165,270 L 160,290
  L 155,310 L 148,330 L 145,350 L 150,370 L 160,385
  L 175,395 L 195,400 L 215,398 L 230,390 L 245,378
  L 260,365 L 270,350 L 275,335 L 285,320 L 295,305
  L 310,295 L 325,290 L 340,295 L 355,305 L 365,320
  L 370,340 L 368,360 L 362,375`;

export const REPORT_SVG = [
  { id:1, x:340, y:265 },{ id:2, x:280, y:345 },{ id:3, x:255, y:380 },
  { id:4, x:65,  y:250 },{ id:5, x:355, y:230 },
];
export const AIS_SVG = [
  { id:'VSL-4421', x:348, y:280 },{ id:'VSL-0092', x:270, y:355 },
  { id:'VSL-7731', x:80,  y:240 },{ id:'VSL-2209', x:245, y:400 },
];

export const CYCLONE = {
  name:'BOB-03', category:'CS', maxWind:'85 km/h',
  svgX:380, svgY:300,
  path:[[380,300],[350,270],[310,240],[275,215]],
};

export const NEWS_PINS = [
  { id:'N1', svgX:345, svgY:270, title:'OIL SPILL',      detail:'Minor spill near Visakhapatnam outer anchorage',          color:C.orange },
  { id:'N2', svgX:280, svgY:345, title:'PIRACY ATTEMPT', detail:'Dinghy boarded trawler 12nm off Chennai coast',            color:C.red    },
  { id:'N3', svgX:67,  svgY:255, title:'FISHING BAN',    detail:'Gujarat coast seasonal ban in effect - violators spotted', color:C.amber  },
  { id:'N4', svgX:240, svgY:395, title:'CORAL BLEACHING',detail:'Mass bleaching event reported near Lakshadweep',           color:C.teal   },
];

export const EVIDENCE_PINS = [
  { id:'E1', svgX:350, svgY:255, type:'Suspicious Vessel', conf:87, time:'07:44 IST', color:C.purple },
  { id:'E2', svgX:270, svgY:360, type:'Oil Slick',         conf:92, time:'06:50 IST', color:C.purple },
];

export const PORTS = [
  'Mumbai','Chennai','Kochi','Visakhapatnam','Kolkata',
  'Kandla','Paradip','Ennore','Mangalore','Haldia','Tuticorin',
];

export const TICKER_ALERTS = [
  'VSL-4421 · AIS DARK 6HR · HIGH RISK · VISAKHAPATNAM COAST',
  'MAUSAM IMD · HEAVY RAIN ALERT · THIRUVANANTHAPURAM COASTAL ZONE',
  'CYCLONE BOB-03 · CATEGORY CS · MAX WIND 85 KM/H · TRACKING NW',
  'DRI INTELLIGENCE · COVERT LANDING PATTERN · GUJARAT WATCH',
  'INCOIS ALERT · WAVE HEIGHT >3.5m · BAY OF BENGAL',
  'VERL EVIDENCE NODE E2 · OIL SLICK CONFIRMED · CHENNAI OUTER ROADS',
  'NATGRID · FLAGGED ENTITY NETWORK · COASTAL ZONE 7',
  'COAST GUARD PATROL UNIT 4 · DEPLOYED TO PALK STRAIT',
  'AIS GHOST VSL-2209 · 200NM TELEPORT · POSSIBLE SIGNAL SPOOFING',
  'OCEAN OS · LAYER SYSTEM ACTIVE · 7 INTELLIGENCE FEEDS ONLINE',
];

// ── Utils ──────────────────────────────────────────────────────────────────────
export const confidenceColor = s => s >= 85 ? C.green : s >= 65 ? C.amber : C.red;
export const typeBadge       = t => ({ HAZARD:C.amber, ANOMALY:C.cyan, LOGISTICS:C.red })[t] || C.muted;
export const statusBadge     = s => ({
  CONFIRMED:  { bg:C.green, text:'#000' },
  VERIFIED:   { bg:C.teal,  text:'#000' },
  FLAGGED:    { bg:C.amber, text:'#000' },
  UNVERIFIED: { bg:C.muted, text:C.text },
})[s] || { bg:C.muted, text:C.text };
