# ValiControl — Etapa Mobile + Tablet

## Objetivo
Deixar o ValiControl fluido e funcional principalmente em smartphones e tablets, preservando a lógica de negócio existente.

## Escopo da etapa
- Mobile-first para operação diária em restaurante.
- Tablet otimizado para uso em balcão/cozinha/escritório.
- Navegação e ações com áreas de toque confortáveis.
- Zero rolagem horizontal acidental.
- Formulários e diálogos adequados à altura/largura da tela.
- Listas de produtos legíveis e acionáveis em telas pequenas.
- Dashboard responsivo sem perda das informações existentes.
- Preservar autenticação, permissões, Supabase, regras de validade, QR Code, etiquetas e impressão.

## Breakpoints de validação
- 375 × 812 — smartphone compacto
- 390 × 844 — smartphone padrão
- 430 × 932 — smartphone grande
- 768 × 1024 — tablet retrato
- 820 × 1180 — tablet grande
- Desktop — preservar experiência existente

## Regras de segurança
1. Não alterar schema do banco.
2. Não alterar RLS, autenticação ou permissões.
3. Não alterar cálculos de validade.
4. Não remover funcionalidades existentes.
5. Não substituir fluxos funcionais sem necessidade.
6. Preferir componentes e dependências já existentes.
7. Cada mudança deve ser pequena, revisável e reversível.

## Critérios de aceite
- Nenhum overflow horizontal nas larguras testadas.
- Botões principais confortáveis para toque.
- Conteúdo respeita safe areas em aparelhos com notch/home indicator.
- Modais não ficam cortados e permitem rolagem quando necessário.
- Cadastro e edição continuam utilizáveis em teclado virtual.
- Dashboard mantém KPIs e ações existentes.
- Produto, QR Code e etiquetas continuam acessíveis.
- Build/rotas existentes não são quebrados.
