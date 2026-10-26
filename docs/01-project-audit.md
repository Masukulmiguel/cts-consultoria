# 01 — Auditoria do Projecto (Fase Zero)

> Data da auditoria: 2026-10-26
> Âmbito: directorio de trabalho local `C:\xampp\htdocs\cts-consultoria`, repositório GitHub `Masukulmiguel/cts-consultoria`, website actual `https://www.consultoriacts.com/`.

---

## 1. Resumo executivo

O directorio de trabalho **não contém qualquer código-fonte** — é uma colecção de recursos gráficos (logótipos, panfletos, fotografias de eventos, foto do CEO, logótipos de parceiros). O repositório GitHub de destino existe mas está **vazio**. O website actual é um site estático de página única, publicado separadamente e sem qualquer backend, base de dados ou área administrativa. **O projecto é, portanto, um "greenfield"**: a nova plataforma será construída do zero, com os recursos gráficos existentes como activos a preservar.

---

## 2. Factos confirmados

### 2.1 Directorio de trabalho local

| Verificação | Resultado |
|---|---|
| É um repositório Git? | **Não** (`fatal: not a git repository`) |
| `package.json` / dependências | **Não existe** |
| Código-fonte (TS/JS/PHP/HTML) | **Não existe** |
| Testes | **Não existem** |
| Variáveis de ambiente / `.env` | **Não existem** (nenhum segredo encontrado) |
| Documentação | **Não existe** |

Conteúdo real (26 ficheiros, todos recursos gráficos/vídeo):

| Pasta | Conteúdo | Observações |
|---|---|---|
| `logotipos/` | 3 PNG: logo para cabeçalho (570×229), logo para mobile/favicon (299×299 e 190×190) | Ficheiros `*-removebg-preview.png` (fundos removidos) |
| `CEO/` | 1 PNG (2,1 MB) — foto do CEO Mauro Torres Gonçalves | Precisa optimização (dimensões muito acima do necessário) |
| `panfletos/` | 11 JPG de panfletos de formação + `parabens_mulher.jpg` | Única fonte existente de informação sobre cursos (ver doc 02, Anexo B) |
| `eventos/` | 5 JPG de eventos de formação + 1 MP4 (1,3 MB) de final de curso | Material válido para a secção de formação/notícias |
| `parceiros/` | 3 PNG de logótipos de parceiros (rembg) | A identificar com a empresa (pendente) |

Problemas de organização detectados: nomes de ficheiros com acentos (`logo_para_cabeçalho_site...`), espaços (`evento_do_fanal_do Curso1.jpg`), sufixos técnicos (`-removebg-preview`) — a normalizar antes de migrar para a plataforma.

### 2.2 Repositório GitHub

- `https://github.com/Masukulmiguel/cts-consultoria` — **existe, criado em 26/10/2026, totalmente vazio** (size 0, sem commits). Não há branch, remote local nem alterações a preservar.
- Conclusão: não há histórico Git a proteger; será seguro inicializar o repositório com o novo projecto.

### 2.3 Website actual

- Site acessível por HTTPS em `https://www.consultoriacts.com/` (HTTP 200).
- **Página única** com navegação por âncoras: `#inicio`, `#sobre`, `#servicos`, `#anpg`, `#contacto`.
- Tecnologia: HTML estático + CSS inline + JavaScript vanilla; ícones Lucide via CDN (`unpkg`); Google Fonts (IBM Plex Sans/Mono, Source Serif 4). **Sem framework, sem backend, sem base de dados.**
- `robots.txt` → **404**; `sitemap.xml` → **404**.
- Formulário de contacto: compõe uma mensagem para `wa.me` (WhatsApp) no浏览器 do utilizador — **nenhum dado é guardado em servidor**.
- Sem analytics, sem cookies, sem pixels de rastreio (verificado no HTML servido).
- Detalhes técnicos e de conteúdo: ver `docs/02-current-website-analysis.md`.

### 2.4 Identidade visual

- Cores extraídas pixel a pixel dos logótipos oficiais (método: contagem de cores dominantes, excluindo fundo/preto):
  - **Azul CTS**: `#0054AE` (faixa real `#004299`–`#0057B0`)
  - **Vermelho CTS**: `#E41620` (faixa real `#CD1A15`–`#EE151D`)
  - **Preto do texto**: `#000000`
- O website actual usa `--navy: #0B2A5B`, `--navy-deep: #071B3D`, `--red: #A60303`, `--red-bright: #C8102E` — **divergem do logótipo real** (azul mais escuro e vermelho mais escuro/roxo). O novo sistema de design deve partir das cores reais do logótipo, corrigindo esta divergência.
- Existe ainda um segundo logótipo nos panfletos: emblema circular "CTS Academia de Gestão e Finanças Empresariais — Consultoria e Formação" (azul/branco), usado na comunicação de formação.

---

## 3. Problemas encontrados

| # | Problema | Impacto |
|---|---|---|
| P1 | Repositório de destino vazio; directorio local sem código | Projecto greenfield; nenhuma base existente a reutilizar |
| P2 | Website actual é single-page estático | Impossível indexar serviços/cursos individualmente; SEO fraco |
| P3 | Sem `robots.txt` nem `sitemap.xml` | Indexação Google incompleta |
| P4 | Formulário de contacto não persiste dados | Impossível gerir pedidos; dependência total do WhatsApp |
| P5 | Website não mostra a área de **formação** (cursos) apesar de existirem 11+ panfletos e eventos documentados | Perda de negócio; a formação é invisível online |
| P6 | Discrepância de contactos: os panfletos mostram `geral@consultoriacts.com` e os telefones 924 379 381 / 955 771 895, que **não constam do website** | Informação inconsistente a confirmar |
| P7 | Foto do CEO com 2,1 MB; logótipos com nomes problemáticos | Optimização e normalização necessárias |
| P8 | Cores do site actual não correspondem ao logótipo | Corrigir no novo design system |
| P9 | Sem MFA, sessões, contas — não há admin nenhum | A construir do zero (não há risco de migração) |

---

## 4. Hipóteses (a validar)

- **H1**: O código-fonte do site actual existe nalgum lado (o HTML publicado é cuidadoso e profissional), mas não está neste directorio nem no repositório. Provável cópia de trabalho noutra máquina.
- **H2**: A empresa opera de facto duas vertentes: **consultoria** (serviços, site actual) e **formação** ("CTS Academia", panfletos, eventos, homologação INEFOP) — a nova plataforma deve servir ambas.
- **H3**: O alojamento do site actual é estático (netlify/vercel/hosting tradicional com upload) — não confirmado.
- **H4**: Os 3 logótipos em `parceiros/` são clientes/parceiros reais a exibir com autorização — a confirmar.

---

## 5. Informações pendentes de confirmação

1. ~~Acesso ao repositório AngoAPI~~ — **resolvido** (repo público a 26/10/2026; análise completa na doc 03).
2. Alojamento actual, DNS do domínio e quem tem acesso.
3. Cursos reais, preços, datas e vagas (os panfletos são material de campanhas passadas/futuras — ver Anexo B da doc 02).
4. Preferência de provedor de pagamentos em Angola.
5. Existência de redes sociais oficiais (nenhuma ligada no site actual).
6. Titularidade e conformidade legal para protecção de dados em Angola (Lei n.º 22/11 — a validar com assessoria jurídica).

---

## 6. Conclusão

Não há código a preservar nem dependências a migrar: **o risco de regressão é nulo e a liberdade arquitectural é total**. Os activos a preservar são os gráficos (3 logótipos, foto do CEO, 12 panfletos, 5 fotos de eventos, 1 vídeo, 3 parceiros) e o conteúdo institucional verdadeiro do site actual (analisado na doc 02). O repositório GitHub está vazio e pronto a receber o projecto.
