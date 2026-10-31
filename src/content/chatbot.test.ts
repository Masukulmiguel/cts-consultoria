import { describe, expect, it } from 'vitest';
import { answerMessage } from '@/content/chatbot';

describe('answerMessage', () => {
  it('responde a saudacoes em portugues', () => {
    const reply = answerMessage('Boa tarde!', 'pt');
    expect(reply.text).toContain('assistente');
    expect(reply.suggestions?.length).toBeGreaterThan(0);
  });

  it('identifica contabilidade apesar dos acentos', () => {
    const reply = answerMessage('Preciso de ajuda com contabilidade', 'pt');
    expect(reply.text).toContain('Contabilidade Geral');
    expect(reply.links?.[0]?.href).toContain('/pt/servicos/');
  });

  it('identifica fiscalidade e envia para a pagina do servico', () => {
    const reply = answerMessage('Tenho dúvidas sobre IVA e AGT', 'pt');
    expect(reply.links?.[0]?.href).toBe('/pt/servicos/consultoria-fiscal');
  });

  it('responde em ingles', () => {
    const reply = answerMessage('How much does tax consulting cost?', 'en');
    expect(reply.text.length).toBeGreaterThan(0);
    expect(reply.links?.[0]?.href).toContain('/en/');
  });

  it('oferece contactos com WhatsApp, telefone e email', () => {
    const reply = answerMessage('Quero falar com alguem', 'pt');
    const hrefs = reply.links?.map((link) => link.href) ?? [];
    expect(hrefs.some((href) => href.includes('wa.me'))).toBe(true);
    expect(hrefs.some((href) => href.startsWith('tel:'))).toBe(true);
    expect(hrefs.some((href) => href.startsWith('mailto:'))).toBe(true);
  });

  it('devolve fallback com sugestoes para mensagens desconhecidas', () => {
    const reply = answerMessage('xyz abc 123', 'pt');
    expect(reply.suggestions?.length).toBeGreaterThan(0);
    expect(reply.text.length).toBeGreaterThan(0);
  });

  it('devolve fallback para mensagem vazia', () => {
    const reply = answerMessage('   ', 'pt');
    expect(reply.text.length).toBeGreaterThan(0);
  });
});
