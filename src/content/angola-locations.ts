/**
 * Províncias e municípios de Angola copiados das listas estáticas reais da
 * AngoAPI (`GET /api/gateway/location/provinces` e `/municipalities`),
 * repositório `Masukulmiguel/angoapi`, ficheiro
 * `app/Http/Controllers/Api/V1/Gateway/LocationController.php`.
 *
 * Sincronizado em 2026-12-07. A lista de municípios da AngoAPI é parcial:
 * só Bengo (BGO), Benguela (BGU) e Luanda (LUA) têm municípios.
 */

export type Province = { code: string; name: string };
export type Municipality = { code: string; name: string };

export const PROVINCES: readonly Province[] = [
  { code: 'BGO', name: 'Bengo' },
  { code: 'BGU', name: 'Benguela' },
  { code: 'BIE', name: 'Bié' },
  { code: 'CAB', name: 'Cabinda' },
  { code: 'CCU', name: 'Cuando-Cubango' },
  { code: 'CNO', name: 'Cuanza Norte' },
  { code: 'CUS', name: 'Cuanza Sul' },
  { code: 'CNN', name: 'Cunene' },
  { code: 'HUA', name: 'Huambo' },
  { code: 'HUI', name: 'Huíla' },
  { code: 'IGE', name: 'Icolo e Bengo' },
  { code: 'LUA', name: 'Luanda' },
  { code: 'LNO', name: 'Lunda Norte' },
  { code: 'LSU', name: 'Lunda Sul' },
  { code: 'MAL', name: 'Malanje' },
  { code: 'MOX', name: 'Moxico' },
  { code: 'NAM', name: 'Namibe' },
  { code: 'UIG', name: 'Uíge' },
  { code: 'ZAI', name: 'Zaire' },
];

const MUNICIPALITIES: Readonly<Record<string, readonly Municipality[]>> = {
  BGO: [
    { code: 'AIM', name: 'Ambriz' },
    { code: 'DAN', name: 'Dande' },
    { code: 'IBR', name: 'Ibria' },
    { code: 'NCR', name: "N'calândia" },
  ],
  BGU: [
    { code: 'BMD', name: 'Benguela' },
    { code: 'CAL', name: 'Catumbela' },
    { code: 'LOB', name: 'Lobito' },
    { code: 'BAI', name: 'Baía Farta' },
  ],
  LUA: [
    { code: 'ALU', name: 'Alvalade' },
    { code: 'BEL', name: 'Belas' },
    { code: 'CAC', name: 'Cacuaco' },
    { code: 'CIT', name: 'Cazenga' },
    { code: 'EMA', name: 'Icolo e Bengo' },
    { code: 'KIL', name: 'Kilamba Kiaxi' },
    { code: 'MRA', name: 'Maianga' },
    { code: 'RAN', name: 'Rangel' },
    { code: 'SML', name: 'Samba' },
  ],
};

/** Municípios da província indicada; lista vazia quando a AngoAPI não tem lista. */
export function municipalitiesFor(provinceCode: string): Municipality[] {
  const code = provinceCode.trim().toUpperCase();
  return [...(MUNICIPALITIES[code] ?? [])];
}
