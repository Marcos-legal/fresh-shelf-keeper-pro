# ValiControl — Programa de Adequação à LGPD

Este documento registra os controles técnicos e organizacionais implementados no sistema. Ele não constitui parecer jurídico nem certificação de conformidade.

## Princípios adotados
- finalidade, adequação e necessidade;
- transparência e livre acesso;
- segurança, prevenção e responsabilização;
- isolamento de dados entre contas e estabelecimentos;
- atendimento aos direitos dos titulares.

## Direitos do titular
O sistema deve disponibilizar canal de contato para solicitações de confirmação/acesso, correção, anonimização, bloqueio ou eliminação quando cabível, informação sobre compartilhamentos, portabilidade quando regulamentada e revogação de consentimento quando esta for a base legal aplicável.

## Segurança
- RLS deve estar habilitado nas tabelas que armazenam dados de usuários;
- políticas devem restringir operações ao proprietário/estabelecimento autorizado;
- funções SECURITY DEFINER devem usar `search_path` restrito e conceder somente os privilégios necessários;
- credenciais e segredos não devem ser armazenados no código-fonte;
- logs e incidentes devem ser tratados segundo procedimento interno de segurança.

## Retenção e eliminação
Dados pessoais devem ser mantidos apenas pelo período necessário à finalidade ou enquanto houver fundamento legal para conservação. A exclusão de conta deve remover ou anonimizar os dados pessoais que não precisem ser conservados por obrigação legal, exercício regular de direitos ou outra hipótese prevista em lei.

## Fornecedores e transferências internacionais
A política pública do produto deve identificar categorias de fornecedores que tratem dados pessoais e informar transferências internacionais quando existentes, seus países/destinos, finalidades e mecanismo jurídico aplicável. A contratação de operadores deve prever confidencialidade, segurança, auxílio ao controlador e tratamento conforme instruções lícitas.

## Encarregado/canal
O controlador deve divulgar um canal de privacidade. A necessidade de encarregado formal deve ser avaliada conforme o porte e as regras da ANPD aplicáveis ao agente de tratamento.

## Incidentes
Deve existir procedimento interno para detectar, registrar, avaliar e comunicar incidentes de segurança com dados pessoais, observando os prazos e critérios aplicáveis da ANPD.
