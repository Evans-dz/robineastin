/* ═══════════════════════════════════════════════════════════════
   Wilderness Escape Rentals · MAP GEOMETRY
   Park boundary, lakes and roads for the hand-built SVG map.
   Coordinates are [lat, lng]. Sources: ../Docs/research/
   yellowstone-map-points.json (OpenStreetMap / NPS, Sept 2026).
   ═══════════════════════════════════════════════════════════════ */
const MAP = {
  bounds: { n: 45.16, s: 44.05, w: -111.72, e: -109.78 },
  zoom: 3,
  parkLabel: [44.72, -110.45],
  shapes: {},
  roads: {},
};
