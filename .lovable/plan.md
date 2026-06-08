
## Escopo confirmado

- Apenas **Plano Pro** continua existindo, sem limites/upgrade modal. A tela "Minha Assinatura" recebe polimento (status, próximo vencimento, botão assinar/cancelar — já parcialmente pronta).
- Multitenant **real** com tabela `empresas` + `empresa_members` (papéis: `owner`, `admin`, `staff`).
- Baixa via QR **somente interna** (sem rota pública).
- WhatsApp **real** via connector Twilio.

---

## 1. Multitenant (migração crítica)

Nova migração:

- `empresas` (`nome`, `owner_id`, `created_at`) + grants + RLS.
- `empresa_members` (`empresa_id`, `user_id`, `role app_role_empresa`) + RLS por membership.
- Função `public.empresa_membro(_empresa uuid, _user uuid) returns boolean` security definer.
- Função `public.empresa_ativa(_user uuid) returns uuid` — retorna a primeira empresa do usuário (usada como default).
- Adicionar coluna **nullable** `empresa_id uuid` em: `products`, `produtos_estoque`, `contagens_estoque`, `subscriptions` (e novas tabelas abaixo).
- Backfill: para cada `user_id` distinto que ainda não tem empresa, criar uma empresa "Minha Empresa" com `owner_id = user_id`, inserir em `empresa_members` como `owner`, e preencher `empresa_id` em todas as linhas existentes.
- Depois do backfill, tornar `empresa_id` `NOT NULL` e atualizar RLS de todas as tabelas para usar `empresa_membro(empresa_id, auth.uid())` em vez de `user_id = auth.uid()`. `user_id` continua existindo como "criado por".
- Trigger `set_empresa_id_default` que preenche automaticamente `empresa_id` com `empresa_ativa(auth.uid())` se vier nulo (mantém compatibilidade do código atual).

Frontend:
- `EmpresaContext` que carrega empresas do usuário e expõe `empresaAtual` + setter (persistido em `user_metadata`).
- Seletor de empresa no header/sidebar quando o usuário tem 2+.
- Tela `Configurações da Empresa`: editar nome, listar membros, convidar por email (cria registro pendente — convite real fica para depois, mas a UI já existe).

## 2. Baixa via QR (consumo/descarte) + custo

Migração:
- Adicionar `preco_custo numeric(10,2)` em `products`.
- Nova tabela `product_events` (`id`, `empresa_id`, `product_id`, `user_id`, `tipo product_event_type` enum `consumido | descartado | vencido`, `motivo text`, `custo_snapshot numeric(10,2)`, `created_at`).
- Grants + RLS por `empresa_membro`.

Frontend:
- `ProductForm`: novo campo "Preço de custo (R$)".
- `LeitorQrCode`: cards de etiqueta lida ganham 2 botões — **Dar Baixa (Consumido)** (verde) e **Descartar** (vermelho, abre dialog com `<select>` de motivos: Vencido, Contaminado, Quebra/Avaria, Outro + textarea). Ao confirmar, grava em `product_events` e remove o produto (mantém histórico no event).
- Funciona offline-friendly: ação só persiste com sucesso após call ao Supabase, com toast.

## 3. Relatório de Desperdício Financeiro

- Nova aba "Desperdício" em `Relatorios.tsx`:
  - Card "Prejuízo no mês" + "Prejuízo no ano".
  - Gráfico de barras (recharts) com prejuízo por mês dos últimos 12 meses (soma de `custo_snapshot` onde `tipo in ('descartado','vencido')`).
  - Tabela com últimos 20 descartes (produto, motivo, valor, data).
- Filtro por intervalo de datas reutilizando o padrão existente.

## 4. Impressão térmica otimizada

A impressão já usa `buildEtiquetaPrintHTML` com `@page size: WxH mm`. Vou:
- Garantir `margin: 0` no `@page` e remover qualquer espaçamento residual.
- Aplicar `body { width: ${w}mm }` para evitar o "papel A4" que alguns browsers (Edge) assumem por padrão.
- Adicionar instrução visual no diálogo de impressão ("Selecione 'Margens: Nenhuma' e tamanho personalizado WxH mm") via banner discreto que só aparece em modo de impressão `display:none` no print, visível antes.
- Forçar `window.print()` após `onload` em vez de timeout fixo, para Chrome+Edge dispararem o diálogo já com o layout pronto.

## 5. Alertas via WhatsApp (Twilio real)

- Conectar connector Twilio (pede confirmação do usuário no painel).
- Migração: tabela `whatsapp_alerts_config` (`empresa_id` único, `enabled bool`, `phone_e164 text`, `from_number text`, `last_sent_at timestamptz`, `daily_hour smallint default 8`).
- Edge function `send-validade-alert`:
  - Recebe `{ empresa_id }`, busca produtos com `validade` <= hoje+1 ou `utilizarAte` <= hoje+1.
  - Monta texto resumo PT-BR, envia via gateway Twilio (`/Messages.json`, `From`, `To`, `Body`).
  - Valida autenticação JWT (`getClaims`) + membership na empresa.
- Edge function agendada (`cron` diário 11:00 UTC ≈ 08:00 BRT) que percorre `whatsapp_alerts_config WHERE enabled` e dispara `send-validade-alert` para cada empresa.
- Tela `Alertas de Validade` (nova rota `/alertas-whatsapp`, no menu Configurações):
  - Toggle "Ativar alertas diários".
  - Input telefone E.164 com máscara BR.
  - Hora preferida do envio.
  - Botão **"Enviar alerta agora"** chama a edge function imediatamente e exibe toast com a contagem de produtos enviados.
- Antes de implementar, vou pedir confirmação para conectar Twilio. Se você não tiver conta Twilio ainda, paro nessa parte e seguimos com o resto.

---

## Ordem de execução

1. Pedir conexão Twilio (não bloqueia 1–4).
2. Migração 1: multitenant + backfill + RLS novas.
3. Migração 2: `preco_custo`, `product_events`, `whatsapp_alerts_config`.
4. Frontend: contexto empresa + seletor + tela config.
5. Frontend: campo preço de custo + ações no leitor QR.
6. Frontend: aba Desperdício em Relatórios.
7. Refino da impressão térmica.
8. Edge functions Twilio + tela de alertas + cron.

---

## Pontos de atenção (técnicos)

- A migração de multitenant altera **todas as RLS atuais**; vou rodar com `DROP POLICY ... CREATE POLICY` na mesma transação e o backfill antes do `NOT NULL` para não travar dados existentes.
- O `subscriptions` hoje é por `user_id`. Vou mantê-lo por `user_id` (assinante = pessoa física pagante) mas adicionar `empresa_id` opcional para futuras assinaturas por empresa. Acesso continua liberado se o `owner` da empresa tiver assinatura ativa.
- O cron Supabase exige `pg_cron`+`pg_net` habilitados — vou habilitar na migração.
- WhatsApp Twilio em sandbox exige que o destinatário tenha enviado `join <code>` antes; vou colocar essa instrução visível na tela de configuração.

Confirma para eu começar? Se preferir que eu pule alguma etapa (ex.: deixar o cron para depois e só liberar o botão "Enviar agora"), me diga antes.
