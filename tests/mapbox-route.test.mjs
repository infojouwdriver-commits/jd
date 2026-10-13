import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDrivingRoute, parseDrivingRoute } from '../src/lib/mapbox-route.ts';

const sample = {
  routes: [{
    distance: 4820.3,
    duration: 734.4,
    geometry: { type: 'LineString', coordinates: [[4.35, 50.85], [4.36, 50.86], [4.37, 50.87]] },
  }],
};

test('parses a valid Mapbox driving route and preserves its road geometry', () => {
  assert.deepEqual(parseDrivingRoute(sample), {
    distanceMeters: 4820.3,
    durationSeconds: 734.4,
    coordinates: [[4.35, 50.85], [4.36, 50.86], [4.37, 50.87]],
  });
});

test('rejects missing, malformed, non-finite and out-of-range route data', () => {
  assert.equal(parseDrivingRoute(null), null);
  assert.equal(parseDrivingRoute({ routes: [] }), null);
  assert.equal(parseDrivingRoute({ routes: [{ ...sample.routes[0], distance: Infinity }] }), null);
  assert.equal(parseDrivingRoute({ routes: [{ ...sample.routes[0], geometry: { type: 'Point', coordinates: [] } }] }), null);
  assert.equal(parseDrivingRoute({ routes: [{ ...sample.routes[0], geometry: { type: 'LineString', coordinates: [[181, 50], [0, 0]] } }] }), null);
});

test('does not issue an API request unless a Mapbox token is configured', async () => {
  let calls = 0;
  await assert.rejects(fetchDrivingRoute({ lat: 50, lon: 4 }, { lat: 51, lon: 5 }, '', async () => { calls++; throw new Error('unexpected request'); }), /mapbox_token_required/);
  assert.equal(calls, 0);
});

test('requests one non-alternative driving route and returns its distance and ETA', async () => {
  let requestedUrl;
  const route = await fetchDrivingRoute({ lat: 50.85, lon: 4.35 }, { lat: 50.87, lon: 4.37 }, 'pk_test', async (url, options) => {
    requestedUrl = new URL(url);
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.referrerPolicy, 'origin');
    return new Response(JSON.stringify(sample), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  assert.equal(requestedUrl.hostname, 'api.mapbox.com');
  assert.equal(requestedUrl.pathname, '/directions/v5/mapbox/driving/4.35,50.85;4.37,50.87');
  assert.equal(requestedUrl.searchParams.get('alternatives'), 'false');
  assert.equal(requestedUrl.searchParams.get('overview'), 'full');
  assert.equal(requestedUrl.searchParams.get('geometries'), 'geojson');
  assert.equal(route.distanceMeters, 4820.3);
  assert.equal(route.durationSeconds, 734.4);
  assert.equal(route.coordinates.length, 3);
});

test('fails closed when Mapbox rejects the route or returns invalid geometry', async () => {
  await assert.rejects(fetchDrivingRoute({ lat: 50, lon: 4 }, { lat: 51, lon: 5 }, 'pk_test', async () => new Response('', { status: 401 })), /mapbox_route_unavailable/);
  await assert.rejects(fetchDrivingRoute({ lat: 50, lon: 4 }, { lat: 51, lon: 5 }, 'pk_test', async () => new Response(JSON.stringify({ routes: [] }), { status: 200 })), /mapbox_route_invalid/);
});


test('network failures become routing errors so optional estimates can fail safely', async () => {
  await assert.rejects(fetchDrivingRoute({lat:50.85,lon:4.35}, {lat:50.86,lon:4.36}, 'pk_test', async () => { throw new TypeError('Failed to fetch'); }), /mapbox_route_unavailable/);
});
