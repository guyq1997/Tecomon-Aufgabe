import { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

async function api(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

function WeatherCard({ widget, onDelete }) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError(null);
      try {
        const data = await api(`/widgets/${widget._id}/weather`);
        if (mounted) setWeather(data.data);
      } catch (e) {
        if (mounted) setError('Wetter konnte nicht geladen werden');
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [widget._id]);

  return (
    <div style={{
      border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>{widget.location}</div>
        {weather ? (
          <div style={{ color: '#333' }}>
            <div>Temperatur: {weather.temperature}°C</div>
            <div>Windgeschwindigkeit: {weather.windspeed} km/h</div>
            <div style={{ fontSize: 12, color: '#666' }}>Zeit: {new Date(weather.time).toLocaleString()}</div>
          </div>
        ) : error ? (
          <div style={{ color: 'crimson' }}>{error}</div>
        ) : (
          <div style={{ color: '#666' }}>Laden ...</div>
        )}
      </div>
      <button onClick={() => onDelete(widget._id)} style={{ padding: '6px 10px' }}>Löschen</button>
    </div>
  );
}

export default function Home() {
  const [widgets, setWidgets] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [error, setError] = useState(null);

  const sortedWidgets = useMemo(
    () => [...widgets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [widgets]
  );

  useEffect(() => {
    api('/widgets').then(setWidgets).catch(() => setError('Laden fehlgeschlagen'));
  }, []);

  async function addWidget(e) {
    e.preventDefault();
    setError(null);
    const loc = newLocation.trim();
    if (!loc) return;
    try {
      const created = await api('/widgets', { method: 'POST', body: JSON.stringify({ location: loc }) });
      setWidgets((w) => [created, ...w]);
      setNewLocation('');
    } catch (e) {
      setError('Erstellen fehlgeschlagen');
    }
  }

  async function deleteWidget(id) {
    try {
      await api(`/widgets/${id}`, { method: 'DELETE' });
      setWidgets((w) => w.filter((x) => x._id !== id));
    } catch (e) {
      setError('Löschen fehlgeschlagen');
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 20 }}>
      <h1>Wetter-Dashboard</h1>
      <form onSubmit={addWidget} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder="Stadtname, z. B. Berlin"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>Hinzufügen</button>
      </form>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      {sortedWidgets.map((w) => (
        <WeatherCard key={w._id} widget={w} onDelete={deleteWidget} />
      ))}
      {sortedWidgets.length === 0 && (
        <div style={{ color: '#666' }}>Noch keine Widgets. Fügen Sie eine Stadt hinzu.</div>
      )}
      <div style={{ marginTop: 24, fontSize: 12, color: '#666' }}>
        API: {API_BASE}
      </div>
    </div>
  );
}


