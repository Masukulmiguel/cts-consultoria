import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import { Stepper } from './stepper';

function item(markup: string, passo: number): string {
  const partes = markup.split(`data-step="${passo}"`);
  return partes[1]?.split('</li>')[0] ?? '';
}

describe('Stepper', () => {
  it('renderiza as cinco etapas', () => {
    const markup = renderToStaticMarkup(
      <Stepper currentStep={3} basePath="/pt/aluno/inscricao/e1/etapa" />,
    );

    expect((markup.match(/data-step=/g) ?? []).length).toBe(5);
  });

  it('mostra a etapa actual e quantas faltam', () => {
    const markup = renderToStaticMarkup(
      <Stepper currentStep={3} basePath="/pt/aluno/inscricao/e1/etapa" />,
    );

    expect(markup).toContain('Etapa 3 de 5');
    expect(markup).toContain('Faltam 2');
  });

  it('marca apenas a etapa actual com aria-current', () => {
    const markup = renderToStaticMarkup(
      <Stepper currentStep={3} basePath="/pt/aluno/inscricao/e1/etapa" />,
    );

    expect(item(markup, 3)).toContain('aria-current="step"');
    expect(item(markup, 1)).not.toContain('aria-current');
    expect(item(markup, 2)).not.toContain('aria-current');
    expect(item(markup, 4)).not.toContain('aria-current');
    expect(item(markup, 5)).not.toContain('aria-current');
  });

  it('desactiva as etapas futuras', () => {
    const markup = renderToStaticMarkup(
      <Stepper currentStep={3} basePath="/pt/aluno/inscricao/e1/etapa" />,
    );

    expect(item(markup, 4)).toContain('aria-disabled="true"');
    expect(item(markup, 5)).toContain('aria-disabled="true"');
    expect(item(markup, 1)).not.toContain('aria-disabled');
    expect(item(markup, 3)).not.toContain('aria-disabled');
  });
});
