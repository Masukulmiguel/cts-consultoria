'use client';

import {
  Camera,
  Crop,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

type Props = {
  /** Nome do campo no formulário (`file`). */
  name: string;
  label: string;
  /** Orientações visíveis para o formando. */
  hint?: string;
  accept?: string;
  capture?: boolean | 'user' | 'environment';
  /** Ficheiro escolhido (estado do componente pai). */
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Pré-visualização de um documento já gravado (URL assinada). */
  previewUrl?: string | null;
  disabled?: boolean;
  error?: string;
  busy?: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
    image.src = src;
  });
}

async function recortarFicheiro(source: string, area: Area, nome: string): Promise<File> {
  const image = await loadImage(source);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const contexto = canvas.getContext('2d');
  if (!contexto) throw new Error('Recorte indisponível neste navegador.');

  contexto.drawImage(
    image,
    Math.round(area.x),
    Math.round(area.y),
    Math.round(area.width),
    Math.round(area.height),
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.92);
  });
  if (!blob) throw new Error('Não foi possível recortar a imagem.');

  const base = nome.replace(/\.[^.]+$/, '') || 'documento';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}

/**
 * Área de carregamento de um documento: captura com a câmara, escolha na
 * galeria, pré-visualização, substituição e recorte.
 */
export function FileDropzone({
  name,
  label,
  hint,
  accept = 'image/*,application/pdf',
  capture = 'environment',
  file,
  onFileChange,
  previewUrl,
  disabled,
  error,
  busy,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [recortando, setRecortando] = useState(false);
  const [area, setArea] = useState<Area>({ x: 0, y: 0, width: 0, height: 0 });
  const [erroInterno, setErroInterno] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const imagem = objectUrl ?? previewUrl ?? null;
  const eImagem = Boolean(file?.type.startsWith('image/'));
  const ePdf = file?.type === 'application/pdf' || previewUrl?.endsWith('.pdf');

  function escolher() {
    inputRef.current?.click();
  }

  function aoEscolher(event: React.ChangeEvent<HTMLInputElement>) {
    const escolhido = event.target.files?.[0] ?? null;
    setErroInterno(null);
    onFileChange(escolhido);
  }

  function remover() {
    setErroInterno(null);
    if (inputRef.current) inputRef.current.value = '';
    onFileChange(null);
  }

  async function aplicarRecorte() {
    if (!file || !objectUrl || area.width === 0 || area.height === 0) return;
    try {
      const recortado = await recortarFicheiro(objectUrl, area, file.name);
      const data = new DataTransfer();
      data.items.add(recortado);
      if (inputRef.current) inputRef.current.files = data.files;
      onFileChange(recortado);
      setRecortando(false);
      setErroInterno(null);
    } catch (falha) {
      setErroInterno(falha instanceof Error ? falha.message : 'Não foi possível recortar.');
    }
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          {hint ? <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={escolher}
            disabled={disabled || busy}
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-xs disabled:opacity-60"
          >
            <Camera size={14} />
            {file ? 'Substituir' : 'Carregar'}
          </button>
          {file ? (
            <button
              type="button"
              onClick={remover}
              disabled={disabled || busy}
              aria-label="Remover ficheiro"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-muted transition-colors hover:border-error/40 hover:text-error disabled:opacity-60"
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        capture={capture}
        onChange={aoEscolher}
        disabled={disabled || busy}
        className="sr-only"
      />

      {imagem ? (
        <div className="mt-3">
          <img
            src={imagem}
            alt={`Pré-visualização de ${label}`}
            className="max-h-64 w-full rounded-md border border-border object-contain"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <ImageIcon size={13} />
              {file?.name ?? 'Documento já carregado'}
            </span>
            {eImagem ? (
              <button
                type="button"
                onClick={() => setRecortando(true)}
                disabled={disabled || busy}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-ink-secondary transition-colors hover:border-primary-300 hover:text-primary-600 disabled:opacity-60"
              >
                <Crop size={13} />
                Recortar
              </button>
            ) : null}
            {ePdf ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <FileText size={13} />
                PDF
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-muted px-4 py-8 text-center">
          <Upload size={20} className="text-ink-muted" />
          <p className="mt-2 text-xs text-ink-muted">
            Fotografe com a câmara ou escolha um ficheiro da galeria.
          </p>
        </div>
      )}

      {erroInterno ? (
        <p role="alert" className="mt-2 text-xs text-error">
          {erroInterno}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : null}

      {recortando ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Recortar imagem</p>
              <button
                type="button"
                onClick={() => setRecortando(false)}
                aria-label="Fechar recorte"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="relative mt-3 h-72 w-full overflow-hidden rounded-md bg-ink">
              <Cropper
                image={objectUrl ?? ''}
                crop={area}
                zoom={1}
                aspect={4 / 3}
                onCropChange={(ponto) =>
                  setArea((actual) => ({ ...actual, x: ponto.x, y: ponto.y }))
                }
                onCropComplete={(_, pixels) => setArea(pixels)}
                onMediaLoaded={() => setArea({ x: 0, y: 0, width: 0, height: 0 })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRecortando(false)}
                className="rounded-md border border-border px-3 py-2 text-xs font-medium text-ink-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={aplicarRecorte}
                disabled={area.width === 0 || area.height === 0}
                className="btn-primary px-3 py-2 text-xs disabled:opacity-60"
              >
                Aplicar recorte
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
