export type SniffedMimeType = 'image/jpeg' | 'image/png' | 'application/pdf';

/**
 * Detecta o tipo do ficheiro a partir dos primeiros bytes. Não confia no nome
 * nem no tipo declarado pelo cliente.
 */
export function sniffMimeType(bytes: Uint8Array): SniffedMimeType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return 'application/pdf';
  }
  return null;
}
