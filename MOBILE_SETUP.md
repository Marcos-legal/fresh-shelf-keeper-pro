# Configuração Mobile - Sistema de Validade

Este projeto agora suporta desenvolvimento mobile usando **Capacitor**. Siga as instruções abaixo para configurar e executar o app em dispositivos móveis.

## 📱 Capacidades Mobile Implementadas

- ✅ Layout responsivo para mobile e tablet
- ✅ Navegação mobile com drawer
- ✅ Componentes otimizados para touch
- ✅ Configuração Capacitor para iOS/Android
- ✅ Hot-reload em desenvolvimento

## 🚀 Setup Inicial

O projeto já está configurado com Capacitor. Para desenvolvimento mobile:

### 1. Exportar para GitHub
1. Clique no botão "Export to Github" no Lovable
2. Faça git pull do seu repositório

### 2. Instalar Dependências
```bash
npm install
```

### 3. Adicionar Plataformas
```bash
# Para Android
npx cap add android

# Para iOS (requer macOS)
npx cap add ios
```

### 4. Atualizar Dependências Nativas
```bash
# Android
npx cap update android

# iOS
npx cap update ios
```

### 5. Build e Sync
```bash
npm run build
npx cap sync
```

### 6. Executar no Dispositivo
```bash
# Android (requer Android Studio)
npx cap run android

# iOS (requer Xcode no macOS)
npx cap run ios
```

## 📱 Recursos Mobile

### Navegação Mobile
- **Drawer Menu**: Menu lateral deslizante para navegação
- **Touch-friendly**: Botões e elementos otimizados para toque
- **Responsivo**: Layout adapta-se a diferentes tamanhos de tela

### Funcionalidades Móveis
- **Hot Reload**: Desenvolvimento em tempo real
- **Offline Ready**: Preparado para funcionalidades offline
- **Performance**: Otimizado para dispositivos móveis

## 🛠️ Desenvolvimento

### Hot Reload
Durante o desenvolvimento, o app mobile conecta-se automaticamente ao servidor de desenvolvimento do Lovable:
```
https://727567d0-f790-4ae1-9b4c-1e1c79db0238.lovableproject.com
```

### Comandos Úteis
```bash
# Sync após mudanças de código
npx cap sync

# Limpar e rebuild
npx cap clean android
npx cap clean ios

# Abrir IDE nativo
npx cap open android  # Android Studio
npx cap open ios      # Xcode
```

## 📋 Requisitos

### Para Android
- Android Studio instalado
- SDK Android configurado
- Dispositivo Android ou emulador

### Para iOS
- macOS
- Xcode instalado
- Dispositivo iOS ou simulador

## 🎯 Próximos Passos

1. **Notificações Push**: Implementar notificações para vencimentos
2. **Camera**: Integrar scanner de códigos de barras
3. **Storage Local**: Implementar cache offline
4. **Sincronização**: Sync automático quando online

## 📚 Recursos Adicionais

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Blog Lovable Mobile](https://lovable.dev/blogs/TODO)
- [Guia iOS/Android](https://capacitorjs.com/docs/getting-started)

---

**Importante**: Sempre execute `npx cap sync` após fazer git pull de mudanças do projeto para sincronizar com as plataformas nativas.