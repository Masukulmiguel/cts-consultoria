export type FieldOutcome = 'MATCH' | 'DIFFERENT' | 'UNKNOWN';

export type ComparedField = {
  field: string;
  registered: string;
  extracted: string | null;
  outcome: FieldOutcome;
};

/** Normaliza texto para comparação: sem acentos, minúsculas, espaços colapsados. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Converte 'dd/mm/aaaa' ou 'aaaa-mm-dd' em 'aaaa-mm-dd'; null se não for uma data real. */
export function normalizeDate(value: string): string | null {
  const text = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  const br = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);

  let year: number;
  let month: number;
  let day: number;

  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else if (br) {
    day = Number(br[1]);
    month = Number(br[2]);
    year = Number(br[3]);
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const data = new Date(Date.UTC(year, month - 1, day));
  if (
    data.getUTCFullYear() !== year ||
    data.getUTCMonth() !== month - 1 ||
    data.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function compareName(registered: string, extracted: string): FieldOutcome {
  const left = normalizeText(registered);
  const right = normalizeText(extracted);
  if (!left || !right) return 'UNKNOWN';
  return left === right ? 'MATCH' : 'DIFFERENT';
}

function compareBiNumber(registered: string, extracted: string): FieldOutcome {
  const left = registered.replace(/[^a-z0-9]/gi, '').toUpperCase();
  const right = extracted.replace(/[^a-z0-9]/gi, '').toUpperCase();
  if (!left || !right) return 'UNKNOWN';
  return left === right ? 'MATCH' : 'DIFFERENT';
}

function compareBirthDate(registered: string, extracted: string): FieldOutcome {
  const left = normalizeDate(registered);
  const right = normalizeDate(extracted);
  if (!left || !right) return 'UNKNOWN';
  return left === right ? 'MATCH' : 'DIFFERENT';
}

/**
 * Compara os dados registados com os extraídos por OCR. O resultado é
 * consultivo: nunca declara identidade confirmada.
 */
export function compareIdentity(
  registered: { fullName: string; biNumber: string; birthDate: string },
  extracted: { fullName?: string; biNumber?: string; birthDate?: string },
): ComparedField[] {
  const campos: Array<{
    field: string;
    registered: string;
    extracted?: string;
    compare: (registado: string, extraido: string) => FieldOutcome;
  }> = [
    {
      field: 'fullName',
      registered: registered.fullName,
      extracted: extracted.fullName,
      compare: compareName,
    },
    {
      field: 'biNumber',
      registered: registered.biNumber,
      extracted: extracted.biNumber,
      compare: compareBiNumber,
    },
    {
      field: 'birthDate',
      registered: registered.birthDate,
      extracted: extracted.birthDate,
      compare: compareBirthDate,
    },
  ];

  return campos.map((campo) => {
    const valor = campo.extracted?.trim();
    if (!valor) {
      return {
        field: campo.field,
        registered: campo.registered,
        extracted: null,
        outcome: 'UNKNOWN' as FieldOutcome,
      };
    }
    return {
      field: campo.field,
      registered: campo.registered,
      extracted: valor,
      outcome: campo.compare(campo.registered, valor),
    };
  });
}
