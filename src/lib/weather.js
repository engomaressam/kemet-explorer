// Weather helpers used with the Open-Meteo data (src/lib/api.js). They are pure
// functions with no React Native imports, so tests/weather.test.mjs runs them in Node.

// WMO weather codes used by Open-Meteo, mapped to a label and an Ionicons icon.
export function describeWeather(code, isDay = 1) {
  if (code === 0) return { label: 'Clear sky', icon: isDay ? 'sunny' : 'moon' };
  if (code === 1) return { label: 'Mainly clear', icon: isDay ? 'sunny' : 'moon' };
  if (code === 2) return { label: 'Partly cloudy', icon: isDay ? 'partly-sunny' : 'cloudy-night' };
  if (code === 3) return { label: 'Overcast', icon: 'cloudy' };
  if (code === 45 || code === 48) return { label: 'Fog', icon: 'cloud' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'rainy' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: 'rainy' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Rain showers', icon: 'rainy' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'thunderstorm' };
  return { label: 'Unknown', icon: 'help-circle' };
}

// A practical visiting tip derived from the live conditions.
export function visitTip({ temperature, windSpeed }) {
  if (windSpeed >= 35) return 'Windy: expect blowing sand, protect cameras and eyes.';
  if (temperature >= 38) return 'Very hot: go at opening time and carry plenty of water.';
  if (temperature >= 32) return 'Hot: plan outdoor time before 10:00 or after 16:00.';
  if (temperature >= 18) return 'Pleasant conditions for exploring today.';
  return 'Cool: bring a light jacket for the early morning.';
}

export function formatTemperature(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return '--';
  const value = unit === 'F' ? celsius * 1.8 + 32 : celsius;
  return `${Math.round(value)}°${unit}`;
}
