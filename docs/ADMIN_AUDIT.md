# ValiControl — auditoria administrativa

Data: 24/10/2026. Diagnóstico somente leitura; nenhuma alteração de banco ou funcionalidade operacional aplicada nesta fase.

## Evidências confirmadas no banco conectado

- Existem 11 tabelas públicas, todas com RLS: empresas, membros, convites, perfis, papéis, assinaturas e tabelas operacionais.
- Existem 5 usuários, 5 empresas e nenhuma atribuição de `user_roles.admin`.
- A conta de referência administrativa não tem permissão administrativa configurada. O e-mail não será usado como condição de autorização.
- As 5 assinaturas estão gravadas como `trialing`, mas todas têm término de teste no passado. Indicadores devem derivar o estado efetivo pela data, não pelo texto do status.
- Duas assinaturas não possuem `empresa_id`; não migrar ou atribuir silenciosamente a uma empresa.
- Nenhuma assinatura possui referência de pagamento/assinatura do provedor no momento da consulta.
- As funções `prevent_role_manipulation` e `prevent_subscription_manipulation` levantam exceção incondicionalmente. Os gatilhos estão ativos, inclusive gatilhos duplicados de proteção de papéis. O comentário sobre permitir service role não corresponde ao código executado.
- A política de inserção de `empresa_members` permite autoatribuição de owner sem conferir o proprietário da empresa. Políticas diretas de atualização também permitem contornar restrições das RPCs de gestão.
- A política de atualização de empresas não protege especificamente `owner_id`.
- Permissões de tabela incluem privilégios amplos para anon; a RLS continua ativa. Reduzir permissões apenas após verificar dependências legítimas.
- Existem relacionamentos com `ON DELETE CASCADE`. O painel não oferecerá exclusão de usuários ou empresas.
- O advisor informa proteção de senhas vazadas desabilitada, atualização de Postgres disponível e 12 funções SECURITY DEFINER executáveis por authenticated. Funções usadas legitimamente pela RLS não devem ter EXECUTE revogado indiscriminadamente.

## Evidências do código

- `App.tsx` não possui /admin; `ProtectedRoute` verifica somente sessão, não papel administrativo.
- A interface de Minha Empresa usa RPCs existentes para membros e convites.
- A função histórica `get_effective_subscription` foi removida em uma migração. Não há chamadas de cobrança ou `canEdit` no código atual pesquisado.
- Não existe `supabase/functions/` neste checkout. Isso não demonstra ausência de funções implantadas remotamente: checkout, cancelamento e webhook precisam ter inventário/código remoto confirmado antes de substituir endpoints existentes.
- Não há catálogo de planos, razão de pagamentos, histórico administrativo ou estado administrativo de suspensão nas tabelas atuais.
- O build hospedado consultado estava concluído e sincronizado. Logs locais consultados não apresentaram erro.

## Reutilização e limites

Reutilizar Supabase Auth, `user_roles`, `has_role`, empresas/membros/convites, subscriptions, React Router, TanStack Query, shadcn, Recharts e tokens de CSS. Separar o tema administrativo do tema azul dos clientes.

Criar somente estruturas administrativas/financeiras ausentes, mantendo produtos, estoque, datas, etiquetas, impressão, QR Code e relatórios operacionais intactos. Correções de segurança devem preservar o contrato das funções usadas pela RLS e pelos fluxos de criação de empresa/convites.

## Dependências de validação

- Supabase externo com `external_unmanaged`: o ambiente não oferece sessão gerenciada para testes autenticados. Não solicitar senhas ou tokens; fluxos autenticados completos permanecerão não verificados até haver ambiente de teste autorizado.
- Nenhum administrador está provisionado. O primeiro grant será procedimento privilegiado revisado por UUID verificado, nunca promoção automática por e-mail.
- Os nomes dos secrets Mercado Pago já estão configurados; sua presença não comprova validade, ambiente de testes ou funcionamento do webhook.
- Trabalho de código é gerenciado em uma branch de edição pela plataforma; o banco externo conectado não oferece isolamento de dados automaticamente. Não presumir que um draft isola esse banco.
- Proteção de senhas vazadas e atualização de Postgres dependem das configurações do projeto Supabase; informar ações no dashboard sem fingir que migrações resolvem essas configurações.