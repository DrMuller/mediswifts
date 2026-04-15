// Migration route data for three swift species
// Based on ornithological research (geolocator tracking studies, BTO, RSPB)

export const species = [
  {
    id: 'common',
    name: 'Common Swift',
    scientificName: 'Apus apus',
    color: [1.0, 0.54, 0.24],
    hexColor: '#FF8A3D',
    particleCount: 80,
    waypoints: [
      { t: 0.00, lat: -2, lng: 25 },
      { t: 0.03, lat: -6, lng: 28 },
      { t: 0.06, lat: -10, lng: 32 },
      { t: 0.10, lat: -12, lng: 34 },
      { t: 0.15, lat: -8, lng: 30 },
      { t: 0.20, lat: -3, lng: 26 },
      { t: 0.25, lat: 0, lng: 22 },
      { t: 0.28, lat: 3, lng: 12 },
      { t: 0.30, lat: 6, lng: 0 },
      { t: 0.32, lat: 7, lng: -8 },
      { t: 0.35, lat: 14, lng: -10 },
      { t: 0.37, lat: 22, lng: -8 },
      { t: 0.39, lat: 30, lng: -6 },
      { t: 0.41, lat: 36, lng: -5 },
      { t: 0.43, lat: 43, lng: 0 },
      { t: 0.45, lat: 48, lng: 5 },
      { t: 0.47, lat: 52, lng: 10 },
      { t: 0.49, lat: 55, lng: 12 },
      // Breeding: Northern Europe (Jun - late Jul)
      { t: 0.58, lat: 55, lng: 12 },
      // Southward migration
      { t: 0.60, lat: 53, lng: 10 },
      { t: 0.62, lat: 48, lng: 6 },
      { t: 0.64, lat: 44, lng: 2 },
      { t: 0.66, lat: 40, lng: -2 },
      { t: 0.68, lat: 36, lng: -5 },
      { t: 0.71, lat: 30, lng: -9 },
      { t: 0.74, lat: 24, lng: -14 },
      { t: 0.77, lat: 18, lng: -16 },
      { t: 0.80, lat: 12, lng: -12 },
      { t: 0.83, lat: 8, lng: -8 },
      { t: 0.86, lat: 5, lng: -2 },
      { t: 0.89, lat: 3, lng: 6 },
      { t: 0.92, lat: 2, lng: 14 },
      { t: 0.95, lat: 0, lng: 20 },
      { t: 1.00, lat: -2, lng: 25 },
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
      { t: 0.00, lat: -1, lng: 35 },
      { t: 0.08, lat: 0, lng: 35 },
      // Wintering East Africa
      { t: 0.17, lat: 2, lng: 35 },
      // Northward migration
      { t: 0.20, lat: 6, lng: 36 },
      { t: 0.23, lat: 12, lng: 36 },
      { t: 0.26, lat: 20, lng: 35 },
      { t: 0.29, lat: 28, lng: 30 },
      { t: 0.31, lat: 33, lng: 24 },
      { t: 0.33, lat: 36, lng: 18 },
      { t: 0.35, lat: 40, lng: 14 },
      { t: 0.37, lat: 44, lng: 10 },
      { t: 0.39, lat: 46, lng: 8 },
      // Breeding: Alps (May - Aug)
      { t: 0.60, lat: 46, lng: 8 },
      // Southward migration
      { t: 0.63, lat: 44, lng: 10 },
      { t: 0.66, lat: 40, lng: 14 },
      { t: 0.69, lat: 36, lng: 18 },
      { t: 0.72, lat: 32, lng: 24 },
      { t: 0.75, lat: 26, lng: 30 },
      { t: 0.78, lat: 20, lng: 34 },
      { t: 0.81, lat: 14, lng: 36 },
      { t: 0.84, lat: 8, lng: 36 },
      { t: 0.88, lat: 3, lng: 35 },
      { t: 0.92, lat: 0, lng: 35 },
      { t: 1.00, lat: -1, lng: 35 },
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
      { t: 0.00, lat: 10, lng: 5 },
      { t: 0.08, lat: 10, lng: 3 },
      // Wintering Sahel/Nigeria
      { t: 0.16, lat: 10, lng: 2 },
      // Northward migration
      { t: 0.19, lat: 14, lng: 1 },
      { t: 0.22, lat: 20, lng: 0 },
      { t: 0.25, lat: 26, lng: -1 },
      { t: 0.28, lat: 31, lng: -1 },
      { t: 0.31, lat: 35, lng: 0 },
      { t: 0.34, lat: 38, lng: 0 },
      // Breeding: Mediterranean coast (May - Jul)
      { t: 0.58, lat: 38, lng: 0 },
      // Southward migration
      { t: 0.62, lat: 36, lng: -1 },
      { t: 0.66, lat: 32, lng: -1 },
      { t: 0.70, lat: 26, lng: 0 },
      { t: 0.74, lat: 20, lng: 1 },
      { t: 0.78, lat: 15, lng: 2 },
      { t: 0.82, lat: 11, lng: 3 },
      { t: 0.86, lat: 10, lng: 4 },
      // Back to wintering grounds
      { t: 1.00, lat: 10, lng: 5 },
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
