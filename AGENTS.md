# ORBIE — AGENT.md

# CANONICAL ARCHITECTURAL HARNESS v2.0

## 0. PROPÓSITO

Este arquivo é o contrato operacional obrigatório para qualquer agente de IA que analise, modifique, refatore, integre ou implemente código no projeto ORBIE.

O objetivo principal é impedir perda arquitetural, substituição acidental da aplicação canônica, reconstrução arbitrária de interfaces, criação de sistemas paralelos ou implementação baseada exclusivamente no preview.

O agente deve trabalhar SOBRE a implementação canônica existente.

O agente NÃO deve reconstruir o ORBIE a partir de uma descrição textual.

---

# 1. FONTES OFICIAIS CANÔNICAS

## 1.1 Frontend

Frontend Web + Mobile:

https://github.com/officeitsalinesilva/orb_front_beta_v1

## 1.2 Backend

Backend completo:

https://github.com/officeitsalinesilva/orb_back_beta_v1

## 1.3 Especificações

Documentação oficial de onboarding/especificações:

https://app.notion.com/p/Onboarding-Prim-rio-de-Implementa-o-Projeto-Orbie-21b9f9faccaa80908c0ac8b4cdd09338

---

# 2. REGRA ZERO — FONTE DE VERDADE

A implementação existente nos repositórios canônicos é a fonte de verdade do ORBIE.

A ordem de autoridade é:

1. Código existente nos repositórios canônicos
2. Contratos de fase aprovados
3. Documentação/especificações oficiais
4. Relatórios de auditoria derivados desses artefatos
5. Preview da plataforma

O preview NUNCA é fonte primária de arquitetura.

Se houver divergência entre preview e código, o código prevalece.

Se houver divergência entre documentação e código, o agente deve reportar a divergência antes de decidir unilateralmente.

---

# 3. PROIBIÇÃO ABSOLUTA DE SUBSTITUIÇÃO

É proibido:

* criar um novo frontend para substituir o frontend canônico;
* reconstruir telas existentes;
* criar uma aplicação visualmente semelhante como substituta;
* trocar arbitrariamente o design system;
* substituir a arquitetura Web existente;
* substituir a arquitetura Mobile existente;
* remover módulos canônicos para simplificar a aplicação;
* criar uma segunda implementação paralela do ORBIE;
* substituir APIs existentes por mocks;
* substituir engines existentes por implementações simplificadas;
* criar dados fictícios para fazer o preview parecer funcional;
* considerar um preview funcional como prova de integração real.

Alterações devem ocorrer sobre a arquitetura existente.

---

# 4. ARQUITETURA CANÔNICA OBRIGATÓRIA

O agente deve reconhecer e preservar a seguinte arquitetura:

ORBIE

├── FRONTEND
│   ├── Web
│   └── Mobile
│
└── BACKEND
├── Astra API
├── Neuroacoustic API
├── Orb API
└── Orb SystemBook

Estas partes não são opcionais.

A ausência de qualquer uma delas deve ser classificada como:

MISSING ou UNVERIFIED

e nunca automaticamente como EXISTING.

---

# 5. FRONTEND WEB

O frontend Web canônico deve ser preservado em sua estrutura existente.

O agente deve auditar e preservar, quando existentes:

* App/root;
* routing;
* contexts;
* hooks;
* services;
* libraries;
* components;
* views;
* catalog;
* chat;
* journal;
* checkpoint;
* profile;
* wallet;
* neuroacoustic;
* authentication;
* design system;
* UI components;
* assets;
* integrações;
* estados;
* navegação.

Não reconstruir esses módulos apenas porque uma nova implementação poderia parecer mais simples.

---

# 6. FRONTEND MOBILE

O frontend Mobile faz parte da arquitetura oficial.

O agente deve identificar e preservar:

* aplicação mobile;
* telas;
* componentes;
* contexts;
* hooks;
* navegação;
* serviços;
* gerenciamento de estado;
* integração com backend;
* elementos compartilhados quando existentes.

O Mobile NÃO deve ser tratado como protótipo descartável.

Web e Mobile são superfícies distintas do mesmo produto/core.

---

# 7. BACKEND CANÔNICO

O backend deve ser auditado como quatro partes distintas:

## 7.1 Astra API

Preservar:

* endpoints;
* request models;
* response models;
* middleware;
* autenticação;
* configuração;
* utilitários;
* engines de cálculo;
* Swiss Ephemeris;
* aspectos;
* trânsitos;
* sinastria;
* lunações;
* geração de artefatos;
* demais capacidades existentes.

Não remover endpoints existentes.

## 7.2 Neuroacoustic API

Preservar:

* endpoints;
* presets;
* geração de áudio;
* processamento;
* dependências;
* modelos;
* configuração;
* integração existente.

Não substituir a engine por geração simplificada no frontend.

## 7.3 Orb API

Preservar:

* endpoints;
* chat;
* speech/voice;
* agent routing;
* integrações;
* middleware;
* serviços;
* modelos;
* configuração;
* demais capacidades existentes.

## 7.4 Orb SystemBook

O Orb SystemBook deve ser tratado como componente canônico do backend.

O agente deve localizar e auditar:

* arquivos;
* módulos;
* entrypoints;
* estruturas de conhecimento;
* schemas;
* serviços;
* dependências;
* interfaces;
* consumidores;
* integrações;
* relação com Astra;
* relação com Orb API;
* relação com frontend;
* demais componentes existentes.

Não assumir que o SystemBook está presente apenas porque o backend compila.

Sua presença deve ser comprovada.

---

# 8. AUDITORIA DE INTEGRIDADE CANÔNICA

Antes de qualquer implementação significativa, o agente deve verificar a integridade da arquitetura.

Cada componente deve receber uma classificação:

* CANONICAL
* EXISTING
* PARTIAL
* DOCUMENTED
* MISSING
* MODIFIED
* INCOMPATIBLE
* MOCK / LOCAL
* FRONT_ONLY
* BACK_ONLY
* UNVERIFIED

Definições:

CANONICAL:
Componente localizado e confirmado como pertencente à implementação oficial.

EXISTING:
Existe efetivamente no código atual.

PARTIAL:
Existe, mas possui implementação incompleta.

DOCUMENTED:
Existe em documentação/spec, mas não foi localizado como implementação funcional.

MISSING:
Necessário ou canônico, porém inexistente.

MODIFIED:
Existe, mas diverge da implementação canônica.

INCOMPATIBLE:
Frontend e backend possuem contratos incompatíveis.

MOCK / LOCAL:
Funciona por simulação, hardcode ou persistência local.

FRONT_ONLY:
Existe somente no frontend.

BACK_ONLY:
Existe somente no backend.

UNVERIFIED:
O agente não conseguiu comprovar sua existência ou equivalência.

UNVERIFIED NÃO pode ser promovido automaticamente para EXISTING.

---

# 9. INVENTÁRIO OBRIGATÓRIO DE ENDPOINTS

Todo endpoint existente no backend deve ser catalogado.

A auditoria deve produzir:

Endpoint
→ Engine
→ Método HTTP
→ Input
→ Output
→ Autenticação
→ Autorização
→ Persistência
→ Consumidor Web
→ Consumidor Mobile
→ Consumidor Admin
→ Consumidor User
→ Artifact
→ Library
→ Journal
→ Chat
→ Status

A ausência de consumidor frontend não significa que o endpoint deva ser removido.

Pode representar:

* capacidade administrativa;
* capacidade interna;
* capacidade futura;
* capacidade de engine;
* capacidade usada por outro serviço;
* gap de integração.

---

# 10. COBERTURA FRONTEND ↔ BACKEND

Cobertura significa rastreabilidade arquitetural.

Não significa que cada endpoint precise possuir uma tela.

A relação esperada é:

Backend Endpoint
↓
API Client / Adapter
↓
Domain Service
↓
Context / Hook / State
↓
Component
↓
View / Screen

Quando aplicável:

↓
Artifact
↓
Library
↓
Journal
↓
Chat

Cada endpoint deve possuir uma classificação de consumo:

* CONSUMED
* PARTIALLY_CONSUMED
* NOT_CONSUMED
* INTERNAL
* ADMIN_ONLY
* USER_ONLY
* SHARED
* FUTURE
* UNVERIFIED

---

# 11. CAPABILITY GRAPH

Toda capacidade relevante do ORBIE deve poder ser rastreada:

CAPABILITY
↓
ENGINE
↓
ENDPOINT
↓
INPUT
↓
PROCESSING
↓
OUTPUT
↓
ADAPTER
↓
FRONTEND
↓
ARTIFACT
↓
LIBRARY
↓
JOURNAL
↓
CHAT

O agente não deve implementar uma capacidade duplicando lógica que já existe em uma engine canônica.

Sempre procurar primeiro pela capacidade existente.

---

# 12. ADMINISTRATIVE SYSTEM

O sistema administrativo é uma superfície legítima e completa do ORBIE.

O Admin pode possuir:

* todas as capacidades disponíveis ao usuário;
* controles adicionais;
* gestão;
* diagnóstico;
* inspeção;
* administração;
* ferramentas internas;
* gerenciamento de catálogo;
* gerenciamento de perfis;
* gerenciamento de créditos;
* gerenciamento de artefatos;
* observabilidade;
* testes;
* ferramentas operacionais;
* capacidades internas das engines.

Não limitar o desenvolvimento do Admin para reproduzir antecipadamente a superfície final do User.

---

# 13. USER SYSTEM

O futuro sistema User será uma superfície restrita do mesmo ecossistema.

Arquitetura conceitual:

ORBIE CORE
│
├── ADMIN SURFACE
│   └── capacidades completas + gestão
│
└── USER SURFACE
└── capacidades autorizadas/restritas

Não criar um backend duplicado exclusivamente para o User.

A restrição deve ser realizada através de:

* autenticação;
* autorização;
* RBAC;
* capabilities;
* composição de interface;
* escopos;
* políticas de acesso.

O User não deve receber capacidades administrativas apenas porque elas existem no core.

---

# 14. ADMIN ≠ BYPASS DE SEGURANÇA

O fato de uma capacidade existir no Admin não significa que ela deva ser pública.

Toda capacidade administrativa deve possuir controle server-side quando necessário.

Nunca confiar somente em:

* esconder botão;
* esconder rota;
* condição React;
* estado local;
* parâmetro enviado pelo frontend.

Autorização crítica deve ser validada no backend.

---

# 15. IDENTIDADE E OWNER ISOLATION

Dados de usuário devem possuir identidade server-side verificável.

Quando aplicável:

Firebase Identity
↓
Bearer Token
↓
Backend Authentication
↓
Resolved User Identity
↓
ownerUid
↓
Resource
↓
Authorization

Não confiar em `ownerUid` arbitrariamente enviado pelo cliente.

O backend deve derivar ou validar a identidade autenticada.

---

# 16. PROFILE ID

Quando `profileId` representar identidade computacional, o agente deve preservar a separação:

User Identity
≠
Profile Identity
≠
Event Identity

Quando uma engine exigir dados brutos:

profileId
↓
Profile Repository
↓
Profile Data
↓
Adapter
↓
Engine Payload

Não alterar engines canônicas apenas para adaptar a uma convenção arbitrária do frontend.

---

# 17. DADOS REAIS

Produção não deve depender de:

* mocks;
* dados fictícios;
* valores hardcoded;
* localStorage como banco principal;
* respostas simuladas;
* objetos estáticos utilizados como persistência.

Mocks podem existir exclusivamente em testes controlados quando explicitamente identificados.

---

# 18. PRESERVAÇÃO DO DESIGN SYSTEM

Preservar:

* cores;
* tipografia;
* espaçamento;
* componentes;
* navegação;
* modais;
* drawers;
* cards;
* tabs;
* padrões visuais;
* comportamento responsivo;
* identidade visual.

Uma integração funcional não autoriza redesign.

---

# 19. FASES

Cada fase possui escopo próprio.

O agente deve:

1. ler o contrato da fase;
2. identificar o escopo;
3. identificar dependências;
4. auditar o estado atual;
5. implementar somente o necessário;
6. testar;
7. reportar alterações;
8. reportar o que permaneceu intocado;
9. reportar gaps restantes.

Não antecipar arbitrariamente fases posteriores.

Gaps podem ser documentados sem serem implementados.

---

# 20. FASE 3 — RECONCILIAÇÃO ARQUITETURAL

A Fase 3 deve produzir diagnóstico.

Ela deve responder:

* O que existe?
* O que existe parcialmente?
* O que diverge?
* O que está somente no frontend?
* O que está somente no backend?
* O que está documentado?
* O que está faltando?
* Quais endpoints existem?
* Quais capacidades existem?
* Quais capacidades possuem consumidor?
* Quais capacidades geram artefatos?
* Quais inputs estão faltando?
* Quais integrações estão faltando?
* Qual é a ordem correta de implementação?

A Fase 3 NÃO deve reconstruir a aplicação.

---

# 21. FASE 4+

Implementações posteriores devem ser derivadas do diagnóstico da Fase 3.

Cada implementação deve declarar:

* arquivos alterados;
* arquivos adicionados;
* endpoints envolvidos;
* entidades envolvidas;
* contratos alterados;
* frontend Web afetado;
* frontend Mobile afetado;
* backend afetado;
* SystemBook afetado;
* testes;
* riscos;
* gaps restantes.

---

# 22. STOP CONDITIONS

O agente deve interromper a implementação imediatamente quando:

* não conseguir acessar o repositório canônico;
* não conseguir identificar os arquivos canônicos;
* não conseguir distinguir código canônico de código gerado;
* não conseguir localizar o frontend Web;
* não conseguir localizar o frontend Mobile;
* não conseguir localizar Astra API;
* não conseguir localizar Neuroacoustic API;
* não conseguir localizar Orb API;
* não conseguir localizar Orb SystemBook;
* houver evidência de substituição arquitetural;
* houver perda de módulos canônicos;
* houver conflito de contratos sem resolução;
* uma implementação exigir alteração fora do escopo da fase;
* a única maneira de prosseguir for inventar código, dados ou arquitetura.

Nessas situações:

NÃO implementar.

Reportar:

1. problema;
2. evidência;
3. arquivo/módulo afetado;
4. impacto;
5. informação necessária para continuar.

---

# 23. REGRA CONTRA ALUCINAÇÃO ARQUITETURAL

O agente não deve declarar que algo existe sem conseguir apontar sua localização ou evidência.

Expressões como:

"já existe"
"está integrado"
"está funcionando"
"está completo"

somente devem ser utilizadas quando houver evidência no código, testes ou integração verificável.

Quando não houver evidência:

"UNVERIFIED"

é a classificação correta.

---

# 24. REGRA CONTRA IMPLEMENTAÇÃO POR APARÊNCIA

Uma interface visualmente semelhante à aplicação canônica NÃO é equivalente à aplicação canônica.

O agente deve priorizar:

1. estrutura;
2. código;
3. contratos;
4. dados;
5. integrações;
6. comportamento;
7. testes;
8. aparência.

A semelhança visual isoladamente não comprova preservação.

---

# 25. REGRA DO PREVIEW

O preview deve ser utilizado somente para verificar o resultado da implementação.

Nunca utilizar o preview para reconstruir a arquitetura.

Nunca tomar:

"o preview parece correto"

como equivalente a:

"o sistema está arquiteturalmente correto".

---

# 26. REGRA DE NÃO DEGRADAÇÃO

Uma implementação nova não pode reduzir capacidades existentes.

Antes de modificar um módulo, verificar:

* dependências;
* consumidores;
* endpoints;
* imports;
* estados;
* contratos;
* Web;
* Mobile;
* Admin;
* User;
* testes.

Se uma alteração quebrar uma capacidade existente, ela não deve ser considerada concluída.

---

# 27. REGRA DE COMPATIBILIDADE

Ao integrar frontend e backend:

não substituir silenciosamente:

* nomes de campos;
* tipos;
* endpoints;
* métodos;
* formatos;
* autenticação;
* payloads;
* responses.

Quando houver incompatibilidade:

classificar como INCOMPATIBLE

e criar adapter quando apropriado.

---

# 28. RELATÓRIO OBRIGATÓRIO APÓS CADA IMPLEMENTAÇÃO

Toda fase implementada deve terminar com:

## Arquivos modificados

Lista completa.

## Arquivos adicionados

Lista completa.

## Arquivos removidos

Se houver, justificar explicitamente.

## Backend

Endpoints alterados/adicionados.

## Frontend Web

Componentes/views/services afetados.

## Frontend Mobile

Componentes/screens/services afetados.

## SystemBook

Módulos afetados.

## Dados

Persistência e entidades afetadas.

## Autenticação

Fluxo de identidade afetado.

## Autorização

RBAC/capabilities afetados.

## Testes

Testes executados e resultado.

## Preservação

Confirmar quais estruturas canônicas permaneceram intactas.

## Gaps

Problemas que permanecem.

---

# 29. CRITÉRIO DE CONCLUSÃO

Uma fase não está concluída simplesmente porque:

* compila;
* abre no preview;
* possui aparência correta;
* uma tela funciona isoladamente.

A fase somente pode ser considerada concluída quando:

1. o escopo do contrato foi implementado;
2. a arquitetura canônica foi preservada;
3. Web e Mobile não foram degradados;
4. backend não foi degradado;
5. endpoints relevantes foram verificados;
6. dados reais estão sendo utilizados quando aplicável;
7. autenticação/autorização estão corretas;
8. testes relevantes passam;
9. alterações estão documentadas;
10. gaps restantes estão explicitamente registrados.

---

# 30. PRINCÍPIO FINAL

O agente não é o autor da arquitetura do ORBIE.

O agente é um implementador sobre uma arquitetura existente.

A arquitetura canônica deve sobreviver a todas as fases.

Quando houver dúvida:

NÃO INVENTAR.

NÃO RECONSTRUIR.

NÃO SIMPLIFICAR.

NÃO SUBSTITUIR.

AUDITAR.

CLASSIFICAR.

REPORTAR.

E somente então implementar.
