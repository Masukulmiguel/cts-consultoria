# 03 — Análise de Integração com o AngoAPI

> Data da análise: 2026-10-26 (2.ª ronda — repositório tornado público nesse mesmo dia)
> Repositório: `https://github.com/Masukulmiguel/angoapi` (público, branch `main`)
> Nota histórica: numa primeira tentativa (manhã de 26/10) o repositório devolvia 404; foi tornado público de seguida e analisado integralmente. **Tudo o que se segue é factual, lido no código.**

---

## 1. Identificação

**AngoAPI = plataforma/API de validação e serviços para Angola**, desenvolvida em **Laravel 12 (PHP 8.2)**. Marketplace de APIs (validação de BI, NIF, telefones, OTP, SMS, email, QR), com planos, subscrições, pagamentos Multicaixa Express (via BitPay) e API keys. Criado 22/08/2026, último push 26/08/2026, ~18 commits, 0 estrelas, sem licença, sem CI.

| Item | Facto |
|---|---|
| Stack | Laravel 12, PHP 8.2, Sanctum, Socialite (Google), spatie/laravel-permission, spatie/laravel-activitylog, PHPUnit 11 |
| Base de dados | PostgreSQL (Supabase em produção; sqlite in-memory nos testes) |
| Frontend | Nenhum no repo (welcome blade por omissão); o frontend é separado (Vercel, `angoapi.vercel.app`) |
| Testes | **Apenas os 2 exemplos por omissão do Laravel** — zero cobertura de negócio |
| Deployment | Dockerfile (`php artisan serve` sem nginx/FPM) + entrypoint com migrate/seed a cada arranque |

## 2. Endpoints existentes (extraídos de `routes/api.php` — prefixo `/api`)

**Públicos**: `POST /register`, `POST /login`, `GET /google/{redirect,callback}`, `GET /plans`, `GET /plans/{plan}`, `POST /payments/callback` (webhook BitPay), e sandbox: `POST /v1/sandbox/validate/{bi,nif,phone}`, `/v1/sandbox/otp/{generate,verify}`, `/v1/sandbox/sms/send`, `/v1/sandbox/email/send`, `/v1/sandbox/qrcode/generate`.

**Autenticados (Sanctum + `EnsureUserIsActive`)**: `/logout`, `/me`, `PUT /profile`, `PUT /password`, `GET /dashboard`, `GET /subscriptions{,/current,/{subscription}}`, `GET /payments{,/{payment}}`, `POST /payments/multicaixa-express`, `GET /payments/status/{id}`, CRUD de `/api-keys` (+revoke/regenerate/toggle), `POST /chat`.

**Gateway (API key própria `ango_...` via `VerifyApiKey`)**: `/gateway/nif/validate`, `/gateway/identity/verify`, `/gateway/location/{provinces,municipalities}`, `/gateway/phone/validate`, `/gateway/otp/{generate,verify}`, `/gateway/sms/send`, `/gateway/email/send`, `/gateway/qr/generate`.

**Admin (Sanctum + `AdminMiddleware`)**: `/admin/dashboard`, `/admin/payments{,/{id},/{id}/approve,/{id}/reject}`, `/admin/users{,/{id},/{id}/status}`, `/admin/subscriptions{,/{id}}`, `/admin/api-keys{,/{id}/revoke}`, `/admin/settings{,}`.

## 3. Modelos de dados existentes

`users` (com status enum e soft deletes), `plans`, `api_products`, `subscriptions`, `payments`, `payment_proofs` (fluxo órfão), `api_keys` (hash sha256), `api_requests` (log de uso), `settings` (key-value), `social_accounts`, `audit_logs` + tabelas Spatie.

## 4. O que NÃO existe (resposta directa ao objectivo de integração)

| Funcionalidade CTS pretendida | Existe no AngoAPI? |
|---|---|
| Formandos / alunos | **Não existe** (zero tabelas/rotas) |
| Cursos / turmas / formação | **Não existe** |
| Clientes (entidade CRM com empresa/NIF) | **Só como `users` com role CLIENT** — sem entidade de cliente |
| Funcionários | **Não existe** como entidade |
| Inscrições em cursos | **Não existe** |
| Pagamentos | **Existe** (fluxo Multicaixa Express via BitPay + aprovação manual admin) |
| Conteúdos / CMS | **Não existe** |

**Conclusão de integração**: o AngoAPI **não é um sistema de gestão de formandos/clientes** — é um gateway de APIs. Não há risco de duplicação de dados porque **não detém os dados que a plataforma CTS precisa**. A plataforma CTS será a fonte de verdade de formandos, clientes, funcionários, cursos e inscrições, como previsto na doc 05.

## 5. O que pode ser aproveitado (como referência, não como dependência)

1. **Fluxo de pagamento Multicaixa Express (BitPay)** — o serviço `BitPayService` + webhook + aprovação manual é um *template* útil se a CTS escolher o mesmo provedor (doc 23 Q4). **Não copiar cegamente** (ver §7).
2. **Padrão de API keys com hash** — caso a CTS venha a expor API própria.
3. **Confirmação de que Multicaixa Express/BitPay é viável em Angola** — prova de conceito real, ainda que sandbox.
4. **NIF/validações** — se um dia a CTS quiser validar NIFs de clientes (hoje o gateway é **mock**; o único scraper real é do portal AGT, com `CURLOPT_SSL_VERIFYPEER => false` — inseguro e não usar).

## 6. Estado de segurança do AngoAPI (risco para a CTS se o integrar sem auditoria)

Riscos observados no código (sem reproduzir valores):

| # | Risco | Gravidade |
|---|---|---|
| 1 | **`.env.production` com credenciais reais versionado num repo público** (password da BD Supabase produção, secret do gateway de pagamentos, webhook secret) — exposto no histórico Git; rotação obrigatória antes de qualquer uso | **Crítica** |
| 2 | Admin seed com credencial por omissão (`password`) que corre em cada deploy | Alta |
| 3 | `key:generate --force` a cada arranque do contentor (invalida tudo o que está encriptado) | Alta |
| 4 | Webhook de pagamento com verificação de assinatura **condicional** (processa mesmo sem secret) | Alta |
| 5 | Sem rate limiting efectivo (login/register/gateway); OTP devolvido na própria resposta | Média |
| 6 | CORS por omissão `*` | Média |
| 7 | `register()` cria contas já ACTIVE (contorna aprovação pendente) | Média |
| 8 | Enums MAIÚSCULOS nas migrations vs minúsculos nos modelos → falha provável em PostgreSQL; moedas inconsistentes (KZ/USD/AOA) | Média (integridade) |
| 9 | Gateway 100% mockado (QR falso com crc32, SMS/email nunca enviados) | Funcional |
| 10 | Chat OpenAI nunca funcionou (chave em falta no config) | Funcional |
| 11 | `chmod 777`, logs com payload completo do webhook, scraping de portal governamental por HTTP sem autorização | Média |

## 7. Decisão de arquitectura de integração (definitiva para a fase actual)

1. **A plataforma CTS ignora o AngoAPI na fase inicial.** Nenhum módulo da doc 05 depende dele.
2. **Adaptador isolado** (`src/integrations/angoapi/`) com feature flag `ANGOAPI_ENABLED=false` por omissão, tal como previsto originalmente — mantém-se, agora com conhecimento real do contrato.
3. **Único cenário de integração futura plausível**: reutilizar/adaptar o fluxo **Multicaixa Express/BitPay** para pagamentos de cursos (se a empresa escolher esse provedor na doc 23 Q4) — nesse caso, **não** integrar com o AngoAPI exposto; antes, isolar o SDK/fluxo directamente na CTS, depois de resolver os riscos §6-1,4.
4. **Nunca** usar as APIs mockadas do gateway como se fossem reais (violaria a regra "não inventes funcionalidades").

## 8. Bloqueios e recomendações à empresa

- **B1 (para a empresa, não para a CTS)**: o `.env.production` exposto deve ser tratado com urgência — **rotacionar** a password da BD Supabase, as chaves BitPay e revogar o webhook; remover o ficheiro do repo e limpar o histórico (ou repor o repo como privado). Recomenda-se fortemente.
- **B2**: corrigir a verificação do webhook antes de qualquer uso em produção.
- Nenhum teste foi executado contra o AngoAPI (sem autorização e sem valor para o objectivo da CTS).
