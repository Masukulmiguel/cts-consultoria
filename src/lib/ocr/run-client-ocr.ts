'use client';

import { createWorker } from 'tesseract.js';

import { parseAmountKz } from './extract-amount';

export type ExtractedIdentity = {
  fullName?: string;
  biNumber?: string;
  birthDate?: string;
  confidence: number;
  raw: string;
};

export type ExtractedProof = {
  amount?: string;
  paymentDate?: string;
  reference?: string;
  confidence: number;
  raw: string;
};

const BI_PATTERN = /\d{9,12}[A-Z]{1,3}\d{1,3}/;
const DATE_PATTERN = /\d{2}[/-]\d{2}[/-]\d{4}/;
const AMOUNT_PATTERN = /\d[\d.,]*/;
const REFERENCE_PATTERN = /(?=[A-Z0-9]{6,})(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{6,}/i;
const HEADER_WORDS = [
  'REPÚBLICA',
  'REPUBLICA',
  'BILHETE',
  'IDENTIDADE',
  'ANGOLA',
  'CARTAO',
  'CARTÃO',
  'DOCUMENTO',
  'TITULO',
  'TÍTULO',
];

function isNameCandidate(line: string): boolean {
  const upper = line.toUpperCase();
  if (HEADER_WORDS.some((palavra) => upper.includes(palavra))) return false;
  const words = line.split(' ').filter(Boolean);
  if (words.length < 2) return false;
  return words.every((word) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇÜÀ-Ý][A-ZÁÉÍÓÚÂÊÔÃÕÇÜÀ-Ý'.-]*$/i.test(word));
}

function extractFullName(text: string): string | undefined {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/\s+/g, ' ');
    if (!line) continue;
    if (isNameCandidate(line)) return line;
  }
  return undefined;
}

function extractAmount(text: string): string | undefined {
  const linhas = text.split(/\r?\n/);
  const comSinal = linhas.filter((linha) => /valor|montante|total|kz|kwanza|aoa/i.test(linha));
  const candidatas = comSinal.length > 0 ? comSinal : linhas;

  for (const linha of candidatas) {
    const match = AMOUNT_PATTERN.exec(linha);
    if (!match) continue;
    const candidato = match[0];
    if (parseAmountKz(candidato) !== null) return candidato;
  }
  return undefined;
}

async function recognise(file: File): Promise<{ text: string; confidence: number }> {
  const worker = await createWorker('por+eng');
  try {
    const resultado = await worker.recognize(file);
    const data = resultado?.data;
    const confidence = typeof data?.confidence === 'number' ? data.confidence : 0;
    return {
      text: typeof data?.text === 'string' ? data.text : '',
      confidence: Math.min(Math.max(confidence / 100, 0), 1),
    };
  } finally {
    await worker.terminate();
  }
}

/** Lê o documento de identificação. Nunca confirma nada: é uma proposta de preenchimento. */
export async function runIdentityOcr(file: File): Promise<ExtractedIdentity> {
  let text = '';
  let confidence = 0;

  try {
    const resultado = await recognise(file);
    text = resultado.text;
    confidence = resultado.confidence;
  } catch {
    return { confidence: 0, raw: '' };
  }

  return {
    fullName: extractFullName(text),
    biNumber: BI_PATTERN.exec(text)?.[0],
    birthDate: DATE_PATTERN.exec(text)?.[0],
    confidence,
    raw: text,
  };
}

/** Lê o comprovativo de pagamento. O valor extraído é apenas uma proposta. */
export async function runProofOcr(file: File): Promise<ExtractedProof> {
  let text = '';
  let confidence = 0;

  try {
    const resultado = await recognise(file);
    text = resultado.text;
    confidence = resultado.confidence;
  } catch {
    return { confidence: 0, raw: '' };
  }

  return {
    amount: extractAmount(text),
    paymentDate: DATE_PATTERN.exec(text)?.[0],
    reference: REFERENCE_PATTERN.exec(text)?.[0],
    confidence,
    raw: text,
  };
}
