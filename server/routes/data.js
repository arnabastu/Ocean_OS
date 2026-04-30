const express = require('express');
const router = express.Router();

// node-fetch v2 (CommonJS compatible)
const fetch = (...args) =>
  import('node-fetch').then(({ default: f }) => f(...args));

// ── Static Intelligence Data ───────────────────────────────────────────────────
const REPORTS = [
  { id:1, time:'06:14 IST', location:'Visakhapatnam Port',    lat:17.7,  lng:83.3,  text:'Very rough seas, waves hitting 4m near outer harbor. Fishing boats returning early.', lang:'EN', confidence:94, status:'CONFIRMED',  sources:['INCOIS API ✓','3 independent reports','Tidal gauge +2.1m'],          type:'HAZARD'   },
  { id:2, time:'06:31 IST', location:'Chennai Marina',        lat:13.05, lng:80.28, text:'Unusual boat movement near breakwater at night. No lights, AIS off.',                  lang:'EN', confidence:78, status:'FLAGGED',    sources:['Citizen report','AIS dark vessel alert'],                          type:'ANOMALY'  },
  { id:3, time:'06:44 IST', location:'Mandapam, Tamil Nadu',  lat:9.27,  lng:79.1,  text:'ரொம்ப பெரிய அலைகள், மீனவர்கள் கடலில் போகவில்லை',                               lang:'TA', confidence:88, status:'VERIFIED',   sources:['IndicTrans2 translated','INCOIS OSF match','2 fisherfolk reports'], type:'HAZARD'   },
  { id:4, time:'07:02 IST', location:'Porbandar, Gujarat',    lat:21.64, lng:69.6,  text:'5-6 unlit speedboats seen heading toward coast around 0300hrs.',                     lang:'EN', confidence:82, status:'FLAGGED',    sources:['Coast Watch report','No AIS match found'],                         type:'LOGISTICS'},
  { id:5, time:'07:18 IST', location:'Paradip, Odisha',       lat:20.26, lng:86.66, text:'ବଡ ଢେଉ, ବନ୍ଦର ବାଲୁକା ଭୂମି ବ୍ୟାଧି',                                              lang:'OR', confidence:71, status:'UNVERIFIED', sources:['IndicTrans2 translated','Awaiting INCOIS confirm'],                 type:'HAZARD'   },
];

const AIS_ANOMALIES = [
  { id:'VSL-4421', lat:17.2, lng:84.1, type:'DARK',      detail:'AIS disabled 6h, last known heading NW',            risk:91 },
  { id:'VSL-0092', lat:12.3, lng:79.8, type:'DEVIATION',  detail:'Unexpected route change, avoiding patrol zones',     risk:74 },
  { id:'VSL-7731', lat:22.1, lng:70.2, type:'LOITERING',  detail:'Stationary 14hrs, no fishing pattern',              risk:67 },
  { id:'VSL-2209', lat:8.5,  lng:77.4, type:'GHOST',      detail:'Signal reappeared 200nm off last position overnight',risk:88 },
];

const AGENCIES = [
  { name:'Indian Coast Guard', short:'ICG',    status:'ONLINE',     color:'#00e676' },
  { name:'INCOIS ERDDAP',      short:'INCOIS',  status:'ONLINE',     color:'#00e676' },
  { name:'IMD / Mausam',       short:'MAUSAM',  status:'ONLINE',     color:'#00e5ff' },
  { name:'NATGRID',            short:'NATGRID', status:'STANDBY',    color:'#ffb300' },
  { name:'DRI Intelligence',   short:'DRI',     status:'ONLINE',     color:'#00e676' },
  { name:'INS Monitoring',     short:'NAVY',    status:'RESTRICTED', color:'#ff3c5f' },
];

const OCEAN_CONDITIONS = [
  { label:'Bay of Bengal', waveH:'3.8m', sst:'29.2°C', state:'ROUGH',    color:'#ffb300' },
  { label:'Arabian Sea',   waveH:'1.2m', sst:'28.7°C', state:'MODERATE', color:'#00e5ff' },
  { label:'Palk Strait',   waveH:'2.6m', sst:'30.1°C', state:'HIGH',     color:'#ff3c5f' },
];

const MAUSAM_STATIONS = [
  { city:'Chennai',           code:'43279', temp:'34°C', humidity:'78%', wind:'18 km/h NE', rainProb:'60%', warning:'COASTAL WATCH',   warnColor:'#ffb300', lat:13.08, lng:80.27, svgX:282, svgY:345 },
  { city:'Visakhapatnam',     code:'43150', temp:'31°C', humidity:'82%', wind:'24 km/h E',  rainProb:'72%', warning:'STRONG WIND',     warnColor:'#ff3c5f', lat:17.70, lng:83.30, svgX:342, svgY:268 },
  { city:'Mumbai',            code:'43003', temp:'32°C', humidity:'71%', wind:'15 km/h W',  rainProb:'30%', warning:'CLEAR',           warnColor:'#00e676', lat:19.07, lng:72.87, svgX:120, svgY:235 },
  { city:'Thiruvananthapuram',code:'43371', temp:'29°C', humidity:'88%', wind:'20 km/h SW', rainProb:'85%', warning:'HEAVY RAIN ALERT',warnColor:'#ff3c5f', lat:8.52,  lng:76.94, svgX:240, svgY:395 },
  { city:'Porbandar',         code:'42840', temp:'30°C', humidity:'65%', wind:'28 km/h NW', rainProb:'10%', warning:'CLEAR',           warnColor:'#00e676', lat:21.64, lng:69.60, svgX:67,  svgY:252 },
  { city:'Kolkata',           code:'42809', temp:'36°C', humidity:'85%', wind:'10 km/h S',  rainProb:'40%', warning:'HEAT WAVE',       warnColor:'#ff6d00', lat:22.57, lng:88.36, svgX:370, svgY:200 },
];

// GET /api/data/reports
router.get('/reports', (req, res) => res.json(REPORTS));

// GET /api/data/vessels
router.get('/vessels', (req, res) => res.json(AIS_ANOMALIES));

// GET /api/data/agencies
router.get('/agencies', (req, res) => res.json(AGENCIES));

// GET /api/data/ocean-conditions
router.get('/ocean-conditions', (req, res) => res.json(OCEAN_CONDITIONS));

// GET /api/data/mausam — tries live IMD, falls back to simulated
router.get('/mausam', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      'https://mausam.imd.gov.in/imd_latest/contents/city_weather_api.php',
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      return res.json({ source: 'IMD_LIVE', stations: data });
    }
    throw new Error('Non-OK');
  } catch {
    res.json({ source: 'SIMULATED', stations: MAUSAM_STATIONS });
  }
});

// GET /api/data/port-weather — test new IMD port weather API
router.get('/port-weather', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    // Try with headers that might help
    const response = await fetch(
      'https://mausam.imd.gov.in/api/port_wx_api.php',
      { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://mausam.imd.gov.in/'
        }
      }
    );
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      return res.json({ 
        source: 'IMD_PORT_WEATHER_API', 
        data: data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) && data.length > 0 ? data[0] : data
      });
    } else {
      return res.json({ 
        source: 'IMD_PORT_WEATHER_API', 
        error: `HTTP ${response.status}: ${response.statusText}`,
        headers: Object.fromEntries(response.headers.entries()),
        note: 'API requires authentication. Consider these alternatives:',
        alternatives: [
          '1. Apply for IMD API access at https://mausam.imd.gov.in/',
          '2. Use OpenWeatherMap API (free tier available)',
          '3. Use WeatherAPI.com (free tier available)', 
          '4. Use INCOIS ERDDAP API (marine-specific data)',
          '5. Use NOAA/NWS APIs for global weather data'
        ]
      });
    }
  } catch (error) {
    res.json({ 
      source: 'IMD_PORT_WEATHER_API', 
      error: error.message,
      note: 'This API requires IP whitelisting or authentication',
      alternatives: [
        'Apply for official IMD API access',
        'Use OpenWeatherMap for general weather',
        'Use WeatherAPI.com for detailed forecasts',
        'Consider INCOIS marine weather APIs',
        'Use NOAA/NWS for global marine data'
      ]
    });
  }
});

// GET /api/data/openweather — Example integration with OpenWeatherMap API
router.get('/openweather', async (req, res) => {
  const API_KEY = process.env.OPENWEATHER_API_KEY; // Set this in your .env file
  
  if (!API_KEY) {
    return res.json({
      source: 'OPENWEATHER_API',
      error: 'API key not configured',
      note: 'Get free API key at https://openweathermap.org/api',
      setup: 'Add OPENWEATHER_API_KEY=your_key_here to .env file'
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    // Example: Get weather for major Indian ports
    const ports = [
      { name: 'Chennai', lat: 13.08, lon: 80.27 },
      { name: 'Mumbai', lat: 19.07, lon: 72.87 },
      { name: 'Visakhapatnam', lat: 17.7, lon: 83.3 }
    ];
    
    const weatherData = [];
    
    for (const port of ports) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${port.lat}&lon=${port.lon}&appid=${API_KEY}&units=metric`,
          { signal: controller.signal }
        );
        
        if (response.ok) {
          const data = await response.json();
          weatherData.push({
            port: port.name,
            temp: `${Math.round(data.main.temp)}°C`,
            humidity: `${data.main.humidity}%`,
            windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`, // Convert m/s to km/h
            windDir: data.wind.deg,
            description: data.weather[0].description,
            visibility: `${(data.visibility / 1000).toFixed(1)} km`,
            pressure: `${data.main.pressure} hPa`
          });
        }
      } catch (portError) {
        console.log(`Failed to fetch weather for ${port.name}:`, portError.message);
      }
    }
    
    clearTimeout(timeout);
    
    res.json({
      source: 'OPENWEATHER_API',
      timestamp: new Date().toISOString(),
      ports: weatherData
    });
    
  } catch (error) {
    res.json({ 
      source: 'OPENWEATHER_API', 
      error: error.message,
      note: 'Check your API key and internet connection'
    });
  }
});

module.exports = router;
