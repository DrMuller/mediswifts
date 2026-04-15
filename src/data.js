// Migration route data for three swift species
// Sources:
//   Common Swift: Åkesson et al. 2012 (PLOS ONE) — 6 geolocator-tracked birds from Sweden
//   Alpine Swift: Meier & Liechti 2020 (Swiss Ornithological Institute) — 215 birds from Switzerland
//   Pallid Swift: Finlayson et al. 2021 (PLOS ONE) — GPS-tracked birds from Gibraltar

export const species = [
  {
    id: 'common',
    name: 'Common Swift',
    scientificName: 'Apus apus',
    color: [1.0, 0.54, 0.24],
    hexColor: '#FF8A3D',
    particleCount: 80,
    waypoints: [
      // Wintering: Congo basin (0.97°N–3.20°S, 10.4°E–19.4°E) — Oct to late Apr
      { t: 0.00, lat: 0, lng: 15 },
      { t: 0.08, lat: -1, lng: 16 },
      { t: 0.16, lat: 0, lng: 15 },
      { t: 0.25, lat: 0, lng: 16 },
      // Spring migration — late Apr: Congo → W to Liberia → NNE across Sahara → Europe
      { t: 0.30, lat: 1, lng: 8 },
      { t: 0.32, lat: 4, lng: -2 },
      { t: 0.34, lat: 7, lng: -10 },
      // Liberia stopover (~7 days, key refuelling site)
      { t: 0.36, lat: 7, lng: -10 },
      // NNE across Sahara, wind-assisted (300+ km/day)
      { t: 0.37, lat: 14, lng: -8 },
      { t: 0.38, lat: 22, lng: -6 },
      { t: 0.39, lat: 30, lng: -5 },
      { t: 0.40, lat: 36, lng: -4 },
      { t: 0.41, lat: 40, lng: -1 },
      { t: 0.42, lat: 44, lng: 2 },
      { t: 0.43, lat: 48, lng: 6 },
      { t: 0.44, lat: 52, lng: 10 },
      { t: 0.46, lat: 55, lng: 13 },
      // Breeding: S Sweden (late May – early Aug)
      { t: 0.58, lat: 55, lng: 13 },
      // Autumn migration — ~Aug 2: S through Europe then SW through W Sahara
      { t: 0.60, lat: 52, lng: 10 },
      { t: 0.62, lat: 48, lng: 6 },
      { t: 0.64, lat: 44, lng: 2 },
      { t: 0.66, lat: 40, lng: -2 },
      { t: 0.68, lat: 36, lng: -5 },
      { t: 0.70, lat: 30, lng: -8 },
      { t: 0.72, lat: 24, lng: -12 },
      { t: 0.74, lat: 18, lng: -14 },
      // West Africa stopovers (6–11°N, 8–12°W) — 10–56 days in Mali/Liberia area
      { t: 0.76, lat: 12, lng: -12 },
      { t: 0.78, lat: 9, lng: -10 },
      { t: 0.82, lat: 8, lng: -8 },
      // SE approach to Congo basin
      { t: 0.84, lat: 6, lng: -2 },
      { t: 0.86, lat: 4, lng: 4 },
      { t: 0.88, lat: 3, lng: 10 },
      // Arrive wintering grounds ~Oct 10
      { t: 0.90, lat: 1, lng: 14 },
      { t: 0.93, lat: 0, lng: 15 },
      { t: 1.00, lat: 0, lng: 15 },
    ],
  },
  {
    id: 'alpine',
    name: 'Alpine Swift',
    scientificName: 'Tachymarptis melba',
    color: [0.30, 0.93, 0.92],
    hexColor: '#4DEEEA',
    particleCount: 60,
    waypoints: [
      // Wintering: W Africa Sahel belt (~12°N) — Nov to Mar
      { t: 0.00, lat: 12, lng: -2 },
      { t: 0.08, lat: 12, lng: -1 },
      { t: 0.16, lat: 13, lng: -1 },
      // Spring migration — Mar: N through Sahara via Gibraltar (~3500 km in ~9 days)
      { t: 0.20, lat: 18, lng: -3 },
      { t: 0.22, lat: 24, lng: -4 },
      { t: 0.24, lat: 30, lng: -5 },
      { t: 0.26, lat: 34, lng: -4 },
      { t: 0.28, lat: 37, lng: -2 },
      { t: 0.30, lat: 40, lng: 1 },
      { t: 0.32, lat: 43, lng: 5 },
      { t: 0.34, lat: 46, lng: 8 },
      // Breeding: Alps (May – Aug)
      { t: 0.60, lat: 46, lng: 8 },
      // Autumn migration — Aug: SW via S France, Spain, Gibraltar to Sahel (~6 days)
      { t: 0.63, lat: 44, lng: 6 },
      { t: 0.65, lat: 42, lng: 3 },
      { t: 0.67, lat: 39, lng: 0 },
      { t: 0.69, lat: 36, lng: -4 },
      { t: 0.71, lat: 32, lng: -5 },
      { t: 0.73, lat: 26, lng: -4 },
      { t: 0.75, lat: 20, lng: -3 },
      { t: 0.77, lat: 16, lng: -2 },
      // Arrive Sahel wintering grounds ~Nov
      { t: 0.80, lat: 13, lng: -2 },
      { t: 0.84, lat: 12, lng: -2 },
      { t: 0.92, lat: 12, lng: -2 },
      { t: 1.00, lat: 12, lng: -2 },
    ],
  },
  {
    id: 'pallid',
    name: 'Pallid Swift',
    scientificName: 'Apus pallidus',
    color: [0.80, 0.42, 0.90],
    hexColor: '#CB6CE6',
    particleCount: 50,
    waypoints: [
      // Guinean forest zone (0–10°N) — Dec to Mar
      { t: 0.00, lat: 5, lng: -5 },
      { t: 0.08, lat: 4, lng: -3 },
      { t: 0.16, lat: 5, lng: -4 },
      // Spring migration — late Mar: rapid Sahara crossing (one bird crossed in ~1 day)
      { t: 0.21, lat: 8, lng: -5 },
      { t: 0.22, lat: 15, lng: -6 },
      { t: 0.23, lat: 24, lng: -6 },
      { t: 0.24, lat: 32, lng: -5 },
      { t: 0.26, lat: 36, lng: -5 },
      // Breeding: Gibraltar / W Mediterranean (Apr – mid-Aug)
      { t: 0.60, lat: 36, lng: -5 },
      // Autumn migration — mid-Aug: rapid Sahara crossing southward
      { t: 0.62, lat: 36, lng: -5 },
      { t: 0.63, lat: 28, lng: -6 },
      { t: 0.64, lat: 20, lng: -8 },
      // Sahel zone (15–20°N) — mid-Aug to early Nov (~2.5 months)
      { t: 0.65, lat: 17, lng: -8 },
      { t: 0.75, lat: 17, lng: -6 },
      { t: 0.83, lat: 17, lng: -5 },
      // Sudanian savannah transition (10–15°N) — Nov (~1 month)
      { t: 0.85, lat: 13, lng: -5 },
      { t: 0.88, lat: 9, lng: -4 },
      // Guinean forest zone (0–10°N) — Dec onwards
      { t: 0.91, lat: 5, lng: -5 },
      { t: 0.95, lat: 5, lng: -5 },
      { t: 1.00, lat: 5, lng: -5 },
    ],
  },
];

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
