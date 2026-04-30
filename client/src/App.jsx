import { useState, useEffect } from 'react';
import TopBar      from './components/TopBar.jsx';
import LeftPanel   from './components/LeftPanel.jsx';
import OceanMap    from './components/OceanMap.jsx';
import RightPanel  from './components/RightPanel.jsx';
import BottomTicker from './components/BottomTicker.jsx';
import { LAYER_DEFS } from './data/constants.js';
import * as api from './api/index.js';

export default function App() {
  // Layer toggles
  const [layers, setLayers] = useState(
    Object.fromEntries(LAYER_DEFS.map(l => [l.id, ['ENV','VESSEL','THREAT','WEATHER'].includes(l.id)]))
  );

  // Selected map report
  const [selectedReport, setSelectedReport] = useState(null);

  // Data from backend
  const [reports,         setReports]         = useState([]);
  const [vessels,         setVessels]         = useState([]);
  const [agencies,        setAgencies]        = useState([]);
  const [oceanConditions, setOceanConditions] = useState([]);
  const [mausam,          setMausam]          = useState({ source:'SIMULATED', stations:[] });
  const [backendStatus,   setBackendStatus]   = useState('CHECKING');
  const [mausamLoading,   setMausamLoading]   = useState(false);

  const [loading, setLoading] = useState({
    reports:true, vessels:true, agencies:true, ocean:true,
  });

  // Boot: fetch all data
  useEffect(() => {
    // Health check
    api.fetchHealth()
      .then(() => setBackendStatus('ONLINE'))
      .catch(() => setBackendStatus('OFFLINE'));

    api.fetchReports()
      .then(data => { setReports(data); setLoading(l => ({...l, reports:false})); })
      .catch(() => setLoading(l => ({...l, reports:false})));

    api.fetchVessels()
      .then(data => { setVessels(data); setLoading(l => ({...l, vessels:false})); })
      .catch(() => setLoading(l => ({...l, vessels:false})));

    api.fetchAgencies()
      .then(data => { setAgencies(data); setLoading(l => ({...l, agencies:false})); })
      .catch(() => setLoading(l => ({...l, agencies:false})));

    api.fetchOceanConditions()
      .then(data => { setOceanConditions(data); setLoading(l => ({...l, ocean:false})); })
      .catch(() => setLoading(l => ({...l, ocean:false})));

    // Initial mausam fetch
    fetchMausam();
  }, []);

  async function fetchMausam() {
    setMausamLoading(true);
    try {
      const data = await api.fetchMausam();
      setMausam(data);
    } catch {
      /* keep previous */
    }
    setMausamLoading(false);
  }

  const activeLayers = Object.values(layers).filter(Boolean).length;

  return (
    <div style={{ width:'100%', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <TopBar activeLayers={activeLayers} backendStatus={backendStatus} />

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <LeftPanel
          layers={layers}
          setLayers={setLayers}
          reports={reports}
          vessels={vessels}
          agencies={agencies}
          oceanConditions={oceanConditions}
          loading={loading}
        />
        <OceanMap
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          layers={layers}
          reports={reports}
          vessels={vessels}
        />
        <RightPanel
          selectedReport={selectedReport}
          reports={reports}
          mausam={mausam}
          mausamLoading={mausamLoading}
          onFetchMausam={fetchMausam}
        />
      </div>

      <BottomTicker />
    </div>
  );
}
