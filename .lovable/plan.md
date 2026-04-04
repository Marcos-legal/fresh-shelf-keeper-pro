

## Plano: Corrigir autenticação e adicionar logo ValiControl

### Problemas identificados

1. **Logout falha com "Session not found"**: Os auth logs mostram erro 403 repetido no `/logout`. O `signOut()` tenta invalidar uma sessão que já expirou. Precisa tratar esse erro gracefully.

2. **Redefinição de senha incompleta**: O `resetPasswordForEmail` redireciona para `/auth?tab=reset`, mas não existe uma página `/reset-password` dedicada para o usuário definir a nova senha. Quando o link é clicado, o usuário é autologado sem conseguir redefinir a senha.

3. **hCaptcha com chave de teste**: A chave `10000000-ffff-ffff-ffff-000000000001` é a chave de teste do hCaptcha. Isso pode causar falhas com o Supabase se o captcha não estiver configurado corretamente no projeto Supabase. O erro de "not-using-dummy-secret" já é tratado no código mas pode estar bloqueando cadastros.

4. **Logo/ícone ausente**: A tela de login usa um ícone genérico `Package`. Precisa usar a imagem ValiControl enviada.

### Alterações planejadas

**1. Adicionar imagem do logo ao projeto**
- Copiar `user-uploads://Sleek_Modern_Logo_for_ValiControl_20260403_234345_0000.png` para `public/logo-valicontrol.png`
- Atualizar favicon em `index.html` para usar a mesma imagem
- Remover `public/favicon.ico` se existir

**2. Corrigir tela de login (Auth.tsx)**
- Substituir o ícone `Package` pela imagem do logo ValiControl
- Atualizar o footer com "ValiControl" em vez de "Sistema de Validade"

**3. Criar página /reset-password**
- Nova página `src/pages/ResetPassword.tsx` que:
  - Detecta `type=recovery` no URL hash
  - Mostra formulário para definir nova senha
  - Chama `supabase.auth.updateUser({ password })` para salvar
  - Redireciona ao login após sucesso

**4. Corrigir redirect da redefinição de senha (Auth.tsx)**
- Alterar `redirectTo` de `/auth?tab=reset` para `/reset-password`

**5. Adicionar rota /reset-password (App.tsx)**
- Adicionar rota pública (sem `ProtectedRoute`) para a nova página

**6. Corrigir logout (AuthContext.tsx)**
- Envolver `signOut` em try/catch para tratar o erro "Session not found" gracefully
- Limpar o estado local (user/session) mesmo se o logout no servidor falhar

**7. Atualizar títulos e metadados (index.html)**
- Alterar title para "ValiControl"
- Atualizar meta descriptions
- Adicionar favicon apontando para o logo

### Arquivos afetados

- `public/logo-valicontrol.png` (novo - cópia do upload)
- `index.html` (favicon + títulos)
- `src/pages/Auth.tsx` (logo + redirect fix)
- `src/pages/ResetPassword.tsx` (nova página)
- `src/App.tsx` (nova rota)
- `src/contexts/AuthContext.tsx` (fix signOut)

