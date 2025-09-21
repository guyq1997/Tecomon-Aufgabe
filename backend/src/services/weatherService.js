import axios from 'axios';
import { getCache, setCache } from '../cache/memoryCache.js';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function normalizeLocationName(location) {
  return String(location || '').trim().toLowerCase();
}

async function geocodeLocation(location) {
  const url = 'https://geocoding-api.open-meteo.com/v1/search';
  const response = await axios.get(url, {
    params: { name: location, count: 1, language: 'de', format: 'json' },
    timeout: 5000,
  });
  const results = response.data && response.data.results;
  if (!results || results.length === 0) {
    const error = new Error('Ort nicht gefunden');
    error.status = 404;
    throw error;
  }
  const { latitude, longitude, name, country } = results[0];
  return { latitude, longitude, name, country };
}

async function fetchCurrentWeather(latitude, longitude) {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const response = await axios.get(url, {
    params: {
      latitude,
      longitude,
      current_weather: true,
      timezone: 'auto',
    },
    timeout: 5000,
  });
  const cw = response.data && response.data.current_weather;
  if (!cw) {
    const error = new Error('Wetterdaten nicht verfügbar');
    error.status = 502;
    throw error;
  }
  return {
    temperature: cw.temperature,
    windspeed: cw.windspeed,
    weathercode: cw.weathercode,
    time: cw.time,
  };
}

export async function getWeatherForLocation(rawLocation) {
  const location = normalizeLocationName(rawLocation);
  if (!location) {
    const error = new Error('Ort fehlt');
    error.status = 400;
    throw error;
  }

  const cacheKey = `weather:${location}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const geo = await geocodeLocation(location);
  const current = await fetchCurrentWeather(geo.latitude, geo.longitude);
  const payload = { location: geo.name, country: geo.country, ...current };

  setCache(cacheKey, payload, FIVE_MINUTES_MS);
  return payload;
}


