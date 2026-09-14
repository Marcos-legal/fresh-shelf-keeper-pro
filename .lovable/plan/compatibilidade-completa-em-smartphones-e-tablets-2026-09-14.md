# Compatibilidade completa em smartphones e tablets

## Objetivo
Corrigir os problemas que dificultam abrir e operar o ValiControl em celulares e tablets, preservando integralmente dados, autenticação e regras de negócio.

## Implementação

1. **Base móvel e acessibilidade**
   - Permitir zoom manual no navegador e manter campos com tamanho adequado para evitar zoom automático no iPhone.
   - Respeitar áreas seguras de aparelhos com recorte de tela e garantir rolagem vertical estável.
   - Tornar janelas e listas roláveis quando a altura disponível for pequena, mantendo ações acessíveis.

2. **Navegação e Dashboard**
   - Eliminar controles duplicados de menu no Dashboard e manter uma única navegação móvel funcional.
   - Reservar espaço para a barra inferior e ajustar o botão flutuante para não cobrir conteúdo.
   - Adaptar indicadores, ações rápidas e itens de atenção para 320, 375 e 414 px sem cortes de texto.
   - Manter a apresentação compacta em tablets e a navegação lateral apenas em desktop.

3. **Operações e formulários**
   - Ajustar o fluxo “Registrar abertura” para caber e rolar em telas pequenas, inclusive com teclado aberto.
   - Garantir campos e botões com alvos de toque confortáveis.
   - Melhorar listas de pesquisa de produtos e cartões expansíveis sem alterar salvamento ou cálculos.

4. **Leitor de QR Code**
   - Dimensionar automaticamente a área de leitura conforme a câmera e a largura do aparelho.
   - Organizar controles e ações em uma coluna nas telas estreitas.
   - Manter leitura contínua, múltiplas etiquetas, baixa e descarte exatamente como já funcionam.

5. **Validação geral**
   - Verificar compilação e erros de execução.
   - Testar visualmente em 320, 375, 414, tablet e desktop, conferindo ausência de rolagem horizontal e sobreposições.
   - Validar as rotas públicas disponíveis e preservar todas as operações autenticadas sem mudanças de banco ou permissões.

## Detalhes técnicos
- Alterações limitadas à apresentação, comportamento de viewport e configuração responsiva.
- Nenhuma mudança em Supabase, schema, RLS, autenticação, cálculos de validade, impressão ou regras de negócio.
- Compatibilidade priorizada para Chrome, Edge, Safari móvel e navegadores integrados de Android/iOS.