# 02 — Análise do Website Actual

> Data da análise: 2026-10-26
> Website: `https://www.consultoriacts.com/` (HTTPS, HTTP 200)
> Método: navegação real + leitura do HTML servido + verificação de `robots.txt` e `sitemap.xml` + inventário de recursos locais. **Tudo o que abaixo está afirmado foi observado; nada foi inventado.**

---

## 1. Estrutura real do site

O site é uma **página única** (single-page) com navegação por âncoras. Não existem páginas internas separadas.

| "Página" (âncora) | URL real | Conteúdo | Funcionalidades |
|---|---|---|---|
| Início / Hero | `/#inicio` | Carrossel de 2 slides: (1) Contabilidade & Fiscalidade "Desde 2016 em Luanda"; (2) Certificação ANPG | Carrossel automático com tabs, header fixo que muda ao rolar |
| Barra de factos | (parte do início) | Fundação 2016 · 11–50 especialistas · 29 associados · ANPG homologado · Sede Rangel | — |
| Sobre Nós | `/#sobre` | Institucional, citação da missão, foto+bio do CEO Mauro Torres Gonçalves, 3 benefícios, 6 especializações | CTAs para serviços e WhatsApp |
| Serviços | `/#servicos` | 6 serviços em acordeão (ver §3) | Acordeão, CTA WhatsApp por serviço |
| ANPG | `/#anpg` | Certificação petrolífera, citação do CEO, cartão "Fornecedor Registado", 3 pilares | CTA WhatsApp ANPG |
| CTA intermédio | (parte de ANPG) | "Diagnóstico contábil ou fiscal urgente" | Botões WhatsApp + telefone |
| Contactos | `/#contacto` | Mapa Google (iframe), morada, telefones, formulário | Formulário compõe mensagem WhatsApp (não persiste dados) |
| Rodapé | (global) | Navegação, especializações, contactos, certificação ANPG, CEO | Botão "Topo" |

**Não existem**: páginas de cursos/formação, notícias, blogue, FAQ, testemunhos, área de cliente, formulário com persistência em servidor, pesquisa, redirecionamentos.

## 2. SEO e metadados (observados)

| Item | Estado |
|---|---|
| `<title>` | "CTS Consultoria Empresarial \| Contabilidade & Fiscalidade em Luanda" ✅ |
| Meta description | Presente ✅ |
| Open Graph | `og:title`, `og:description`, `og:type`, `og:image` (`./assets/hero-edificios.jpg`) ✅ |
| Twitter card | `summary_large_image` ✅ |
| `robots.txt` | **404 — não existe** ❌ |
| `sitemap.xml` | **404 — não existe** ❌ |
| Canonical / hreflang | **Ausentes** ❌ (irrelevante hoje por ser single-page, obrigatório na nova versão bilingue) |
| Dados estruturados (JSON-LD) | **Ausentes** ❌ |
| Idioma | `lang="pt-AO"` ✅ (nota: o cliente pediu **pt-PT** no novo site — a esclarecer, ver doc 23 Q12) |
| Analytics | **Nenhum script de medição encontrado** ❌ |
| Theme color | `#071B3D` |

## 3. Serviços publicados (fonte: site actual, texto integral verificado)

| # | Serviço | Categoria | Conteúdo |
|---|---|---|---|
| P.01 | Contabilidade Geral & Financeira | Contabilidade | PGC-NIRF, balancetes, demonstrações financeiras, reconciliações, notas às contas |
| P.02 | Consultoria e Planeamento Fiscal | Fiscalidade | SELO, IVA, IRT, IP, II, IEC, retenções, Modelo 1 AGT, dossier para inspecções |
| P.03 | ERP PRIMAVERA v10 | Software ERP | Parametrização, módulos Compras/Vendas/Contabilidade/Tesouraria/RH, SAF-T AO |
| P.04 | Estudo de Viabilidade Económica & Financeira | Estratégia | VAL, TIR, payback, projeções, análise de sensibilidade |
| P.05 | Auditoria Financeira & Controlo Interno | Auditoria | Testes substantivos, relatório de auditoria, matriz de risco |
| P.06 | Gestão de RH, Salários & INSS | Recursos Humanos | Processamento salarial, recibos, IRT, Portal INSS |

Especializações listadas (tag cloud): Contabilidade · Fiscalidade · Estudo de Viabilidade · Gestão de RH · Informática de Gestão · Excel Avançado.

## 4. Informações institucionais confirmadas

| Dado | Valor | Fonte |
|---|---|---|
| Nome oficial | CTS Consultoria Empresarial & Gestão de Negócios | site (header/footer) |
| Fundação | 2016, Luanda | site (facts bar) |
| Equipa | "11 a 50 Especialistas" | site |
| Associados | 29 | site (significado a esclarecer — doc 23 Q8) |
| Certificação | ANPG — Homologado (Agência Nacional de Petróleo e Gás) | site + citação do CEO |
| CEO | Mauro Torres Gonçalves — Contabilista & Consultor Fiscal | site + foto `CEO/` |
| Missão (citação) | "Garantir a qualidade da informação financeira dos clientes, pela prestação dos nossos serviços, com ênfase no cumprimento das obrigações contabilísticas e fiscais melhorando o ambiente da gestão empresarial..." | site |
| Morada | Rua Avenida Brasil, Casa n° 162 A, 1.º Andar, Rangel, Luanda (de frente ao Ministério da Acção Social — MASFAMU) | site |
| Telefone | +244 992 771 895 | site (`tel:992771895`) |
| WhatsApp | +244 958 893 484 (`wa.me/244958893484`) | site |
| Mapa | Google Maps embed + link de pesquisa | site |
| Redes sociais | **Nenhuma ligação encontrada** | verificação do HTML |

### Discrepância de contactos (importante)

Os **panfletos locais** mostram canais que **não constam do website**:
- E-mail: `geral@consultoriacts.com`
- Telefones adicionais: 924 379 381 · 955 771 895 (958 893 484 já confere)
- Site: `www.consultoriacts.com` ✅

**A confirmar com a empresa** quais são os canais oficiais activos (doc 23 Q6).

## 5. Vertente de formação — INVISÍVEL no site (problema central)

O site actual **não menciona cursos, formação nem a Academia**, contudo:

- Existem **11 panfletos** de cursos na pasta local, todos com o emblema "**CTS Academia de Gestão e Finanças Empresariais — Consultoria e Formação**", cursos de Contabilidade e Fiscalidade (níveis Sénior/Intermédio, com Primavera v10 e Portal AGT), homologação **INEFOP**, estágio profissional, e datas/horários concretos;
- Existem **5 fotografias + 1 vídeo** de "final de curso" e "sala de formação".

Leitura: a empresa já forma (com certificação homologada), mas a formação **não tem qualquer presença online**. Esta é a maior oportunidade da nova plataforma (catálogo de cursos + inscrições online — doc 05, módulo M4).

> Catálogo pormenorizado dos panfletos: **Anexo B** (abaixo).

## 6. Aspectos técnicos e de design observados

- **Tecnologia**: HTML estático único + ~1000 linhas de CSS inline + JS vanilla; Lucide via `unpkg` CDN; Google Fonts (IBM Plex Sans/Mono, Source Serif 4).
- **Qualidade visual**: razoável/profissional (paleta navy+vermelho, tipografia serif+sans, acordeão, carrossel), mas **não corresponde às cores reais do logótipo** (o site usa navy `#0B2A5B`/vermelho `#A60303`; o logótipo é azul `#0054AE`/vermelho `#E41620`).
- **Performance**: carrega fonts e ícones de CDNs externos; imagens do hero com `preload`; sem formatos modernos (WebP/AVIF) detectáveis; foto do CEO não optimizada.
- **Acessibilidade**: existem `skip-link`, `aria-expanded`, `aria-current`, `prefers-reduced-motion` respeitado — acima da média; manter e alargar.
- **Formulário**: só compõe mensagem para WhatsApp (`wa.me`) — nenhum dado persiste, nenhum email é enviado, zero gestão administrativa.
- **Bilinguismo**: inexistente (só pt).
- **PWA**: inexistente (sem manifest, sem service worker).

## 7. Conclusões para a nova plataforma

1. **Conteúdo verdadeiro a migrar**: 6 serviços, institucional, CEO, missão, morada/contatos, certificação ANPG, mapa.
2. **Conteúdo a criar**: toda a vertente de formação (catálogo, inscrições), notícias, FAQ, e o administrador que hoje não existe.
3. **Corrigir**: cores do design system (usar as do logótipo), idioma (pt-PT + EN), contactos divergentes (após confirmação).
4. **Preservar/renomear URLs**: como só existe `/`, o SEO perdido é mínimo; manter `/` → redirect para `/pt/`, e criar redirects apenas para URLs reais descobertas (nenhuma outra existe).

---

## Anexo A — Recursos gráficos locais (inventário)

| Ficheiro | Tipo | Uso previsto |
|---|---|---|
| `logotipos/logo_para_cabeçalho_site-removebg-preview.png` | 570×229 PNG | Logótipo horizontal (header/footer claro) |
| `logotipos/logo_para_mobile-removebg-preview.png` | 299×299 PNG | Versão compacta/móvel |
| `logotipos/logo_favicon-removebg-preview.png` | 190×190 PNG | Favicon + ícone PWA (regenerar tamanhos) |
| `CEO/CEO_MAURO_TORRES_GONÇALVES.png` (2,1 MB) | Foto | Página Sobre Nós (optimizar para WebP/AVIF) |
| `panfletos/panfleto1..11.jpg`, `parabens_mulher.jpg` | 12 JPG | Catálogo de cursos (redigir texto; panfletos como galeria/documentos) |
| `eventos/*.jpg` (5) + `videos_final_curso.mp4` | Fotos+vídeo | Galeria de eventos/formação, homepage |
| `parceiros/parceiro1..3-removebg-preview.png` | 3 PNG | Secção de parceiros (identidade a confirmar) |

## Anexo B — Catálogo de formação segundo os panfletos (lidos integralmente)

**7 famílias de curso** encontradas em 11 panfletos, em 3 áreas: Contabilidade/Fiscalidade, Recursos Humanos e Fecho de Contas. Forte aposta no software **Primavera v10 / Portal AGT**. Preços só indicados em 2 panfletos.

| Curso | Nível | Datas (edições encontradas) | Duração/horários | Preço (AOA) | INEFOP |
|---|---|---|---|---|---|
| Contabilidade e Fiscalidade (Primavera v10 + Portal AGT) | Sénior | 12/11, 03/11, 07/07 | 3 sem seg–sex (08–11 / 14–17 / 17–20) ou 5 sábados (08–16, c/ coffee break) | não indicado | ✅ |
| Contabilidade e Fiscalidade (Primavera v10 + Portal AGT) | Intermédio | 12/11, 03/11 | idem | não indicado | ✅ |
| Estágio Formativo: Técnico Profissional como Contabilista (Gestão de Processos Admin., Contabilidade, Fiscalidade, ERP Primavera v10) | Técnico Profissional | 30/06 | 4 semanas/fase, 3×/sem (Seg/Qua/Sex ou Ter/Qua/Sáb), 08–13 ou 13–18 | não indicado | não visível |
| Técnicas de Gestão de Recursos Humanos + Primavera v10 | — | 30/06 | 1 sem seg–sex (turnos) ou 2 sábados (08–16) | não indicado | ✅ |
| Estágio Formativo: Técnica Profissional de Contabilidade e Fiscalidade + ERP Primavera v10 | Júnior & Sénior | 10/08, 01/09 | 1 mês por nível, turnos seg–sex ou 5 sábados (08–16) | Júnior **74.999** / Sénior **94.999** (edição Set); Júnior **59.999** / Sénior **79.999** (edição Agosto) | não visível |
| Treinamento de Fecho de Contas | — | 18/12, 23/12 (sábados) | 1 sem (12–15 / 17–20) ou 2 sábados (08–15) | não indicado | não visível |
| Formação Prática Contabilidade e Fiscalidade Sénior (Primavera V10) — "Promoção Março Mulher" | Sénior | 20/03, 18/03 (sábados) | 3 sem seg–sex (turnos) ou 5 sábados (09–15) | não indicado | ✅ |

Elementos transversais: "+Estágio Profissional" anunciado; presencial em Luanda; certificados **homologados pelo INEFOP** (Instituto Nacional de Emprego e Formação Profissional) na maioria das formações; campanhas sazonais (Natal, 8 de Março).

**Contactos nos panfletos**: 924 379 381 · 991 379 381 · 992 771 895 · 958 893 484 · 955 771 895 · 922 399 794 · 924 771 895 · 923 918 173 (banner de evento) — **e-mail `geral@consultoriacts.com`** — morada Rua Avenida Brasil, Casa nº 162 A, 1.º Andar. Dois panfletos têm typo no site: `www.consutoriacts.com` (corrigir).

**Avisos para o catálogo novo**:
1. Todos os panfletos são de **campanhas passadas** (marcas de meses sem ano, edições diferentes com preços diferentes) — **nenhum preço/data pode ser republicado sem confirmação actual** (doc 23 Q10).
2. As fotografias de eventos (`eventos/`) mostram entrega de certificados, sala com projecção do Primavera e um evento em auditório ("Primavera Training") — material excelente para a página de formação, com consentimentos a confirmar (rostos identificáveis).
3. Banner de evento revela serviços adicionais não publicados no site: abertura/fecho de empresas, formação corporativa, manutenção de informática e redes — a confirmar (doc 23 Q6).
