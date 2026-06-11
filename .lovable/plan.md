# Roadmap de implementação (1 → 4)

Vou executar nesta ordem, fazendo deploy a cada etapa e validando antes de seguir para a próxima.

---

## Etapa 1 — UI Multitenant

**Objetivo:** permitir que o usuário troque entre empresas e gerencie membros.

- Criar `EmpresaContext` (lista de empresas do usuário, empresa ativa, persistência em `localStorage` apenas do **id selecionado**).
- Adicionar **seletor de empresa** no header (dropdown ao lado do `UserMenu`) mostrando nome da empresa ativa e troca rápida.
- Quando a empresa ativa muda, invalidar queries do React Query (products, estoque, eventos).
- Atualizar `set_empresa_id_default()` no DB para considerar a empresa ativa enviada pelo cliente via header customizado **ou** manter padrão `get_empresa_ativa` (mais simples — manteremos e o cliente filtrará explicitamente por `empresa_id`).
- Atualizar hooks (`useProductsSupabase`, `useEstoqueSupabase`, `useProductEvents`) para filtrarem por `empresa_id` ativo.
- Nova página **Configurações da Empresa** (`/empresa`):
  - Renomear empresa (somente owner/admin).
  - Listar membros (nome, e‑mail, role).
  - Convidar membro por e‑mail (usa Edge Function `invite-empresa-member` que valida admin e cria registro em `empresa_members` se o e‑mail já existir em `auth.users`; senão grava em uma fila `empresa_invites`).
  - Alterar role e remover membro.
- Migration adicional: tabela `empresa_invites` (email, empresa_id, role, token, expires_at) + RLS para admins.

## Etapa 2 — Alertas WhatsApp (Twilio)

**Objetivo:** envio diário automático de produtos próximos do vencimento.

- Secrets novos: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (pedirei ao usuário antes de implementar).
- Edge Function `send-whatsapp-alerts`:
  - Lê todas as `whatsapp_alerts_config` com `enabled=true` cuja hora local bate com `daily_hour`.
  - Para cada uma, consulta produtos com `validade ≤ hoje+2 dias` da empresa.
  - Monta mensagem em português e envia via API Twilio.
  - Grava `last_sent_at`.
- Cron via `pg_cron` chamando a Edge Function de hora em hora.
- Tela **Alertas WhatsApp** dentro de Configurações:
  - Toggle on/off, telefone E.164 (com máscara), horário (0–23h), botão **“Enviar teste agora”** (chama a edge function com `dry_run=false` e `force=true`).

## Etapa 3 — Tela “Minha Assinatura”

**Objetivo:** repaginar `MinhaAssinatura.tsx` com visual premium.

- Layout em card único centralizado: status (Ativa / Trial X dias / Expirada / Pendente), próximo vencimento, valor R$ 29,90/mês.
- CTA principal contextual:
  - Trial → “Assinar agora”.
  - Ativa → “Gerenciar pagamento” (Mercado Pago link).
  - Expirada/Pendente → “Reativar assinatura”.
- Lista de benefícios do plano e botão **Cancelar assinatura** (modal de confirmação chamando `cancel-subscription`).
- Histórico básico (últimos status de `subscriptions`).

## Etapa 4 — Refino de impressão térmica

**Objetivo:** zerar margens em Chrome/Edge para 57 mm e 80 mm.

- Em `etiquetaPrintTemplate.ts`: adicionar `@page { size: Xmm Ymm; margin: 0 } @media print { html, body { margin:0; padding:0; width:Xmm } }` (já existe parcialmente — vou reforçar com `-webkit-print-color-adjust`, `page-break-after: always` apenas entre etiquetas e remover bordas externas duplicadas).
- Adicionar opção em `ImpressaoEtiquetas.tsx`: select de preset (57 mm / 80 mm) que aplica largura travada e mostra dica para o usuário marcar **“Margens: Nenhuma”** no diálogo de impressão (com print screen ilustrativo).
- Testar a saída em viewport print preview.

---

## Confirmações que preciso antes de começar a Etapa 2

1. Você já tem conta Twilio com WhatsApp habilitado? Se sim, me passe os 3 secrets quando eu chegar nessa etapa.
2. Posso usar **pg_cron de hora em hora** (recomendado) ou prefere a cada 15 min?

Posso seguir direto para a **Etapa 1** sem aguardar essas respostas — elas só travam a Etapa 2.
