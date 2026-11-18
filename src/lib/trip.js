// Trip planning for Kemet Explorer: turns a set of chosen sites into an ordered
// route with distances, a suggested day-by-day pacing and a Google Maps link.
//
// Everything here is pure (no React Native imports), so it is unit-tested with
// Node's built-in test runner (see tests/trip.test.mjs).

const EARTH_RADIUS_KM = 6371;

// Straight-line (great-circle) distance between two points, in kilometres.
export function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function routeLengthKm(route) {
  let total = 0;
  for (let i = 1; i < route.length; i += 1) total += haversineKm(route[i - 1], route[i]);
  return total;
}

// Orders the stops into a short open route that starts at the northernmost stop,
// which suits a trip that follows the Nile upstream from Cairo towards Aswan.
// Two first drafts (nearest neighbour, and plain north-to-south order) are each
// improved with 2-opt, and the shorter result wins. 2-opt is a local search, so
// starting from two different drafts avoids getting stuck in a poor route.
export function planRoute(stops) {
  const byLatitude = [...stops].sort((a, b) => b.lat - a.lat);
  if (stops.length <= 2) return byLatitude;
  const candidates = [twoOpt(nearestNeighbour(byLatitude)), twoOpt(byLatitude)];
  return candidates.reduce((best, r) => (routeLengthKm(r) < routeLengthKm(best) ? r : best));
}

// Greedy draft: from the first stop, always go to the closest stop not yet visited.
function nearestNeighbour(ordered) {
  const remaining = [...ordered];
  const route = [remaining.shift()];
  while (remaining.length) {
    const last = route[route.length - 1];
    let best = 0;
    for (let i = 1; i < remaining.length; i += 1) {
      if (haversineKm(last, remaining[i]) < haversineKm(last, remaining[best])) best = i;
    }
    route.push(remaining.splice(best, 1)[0]);
  }
  return route;
}

// 2-opt for an open path: reverse any segment whose reversal shortens the route,
// until no reversal helps. The first stop stays fixed.
function twoOpt(draft) {
  const route = [...draft];
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 1; i += 1) {
      for (let k = i + 1; k < route.length; k += 1) {
        const before = haversineKm(route[i - 1], route[i]) + (k + 1 < route.length ? haversineKm(route[k], route[k + 1]) : 0);
        const after = haversineKm(route[i - 1], route[k]) + (k + 1 < route.length ? haversineKm(route[i], route[k + 1]) : 0);
        if (after + 1e-9 < before) {
          route.splice(i, k - i + 1, ...route.slice(i, k + 1).reverse());
          improved = true;
        }
      }
    }
  }
  return route;
}

// A rough travel time for a leg. Roads follow the river and are longer than the
// straight line, so the distance is stretched by a third and driven at 70 km/h.
export function legInfo(km) {
  if (km < 1.5) return { km, label: 'A short walk', long: false };
  if (km < 5) return { km, label: 'A few minutes by car', long: false };
  const hours = (km * 1.33) / 70;
  if (hours < 0.75) return { km, label: `About ${Math.max(10, Math.round((hours * 60) / 5) * 5)} min by road`, long: false };
  const rounded = Math.round(hours * 2) / 2;
  if (km >= 150) {
    return { km, label: `About ${rounded} h by road; the train, a Nile cruise or a flight also work`, long: true };
  }
  return { km, label: `About ${rounded} h by road`, long: false };
}

// Splits a route into suggested days: up to three stops a day, and a new day
// after any long transfer, so nobody plans Giza and Abu Simbel for one morning.
export function planDays(route, { maxStopsPerDay = 3, newDayAfterKm = 150 } = {}) {
  const days = [];
  route.forEach((stop, index) => {
    const fromPrevious = index ? haversineKm(route[index - 1], stop) : 0;
    const current = days[days.length - 1];
    if (!current || current.stops.length >= maxStopsPerDay || fromPrevious >= newDayAfterKm) {
      days.push({ day: days.length + 1, stops: [stop], travelKmBefore: Math.round(fromPrevious) });
    } else {
      current.stops.push(stop);
    }
  });
  return days.map((d) => ({ ...d, regions: [...new Set(d.stops.map((s) => s.region))] }));
}

// Everything the trip screen shows, from the chosen stops.
export function summariseTrip(stops) {
  const route = planRoute(stops);
  const legs = route.slice(1).map((stop, i) => ({ from: route[i], to: stop, ...legInfo(haversineKm(route[i], stop)) }));
  return {
    route,
    legs,
    days: planDays(route),
    totalKm: Math.round(routeLengthKm(route)),
  };
}

// Directions through every stop, in order, in Google Maps (web or app).
export function googleMapsRouteUrl(route) {
  return `https://www.google.com/maps/dir/${route.map((s) => `${s.lat},${s.lon}`).join('/')}`;
}

export function googleMapsPlaceUrl(site) {
  return `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lon}`;
}
