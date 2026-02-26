# TrekMind — Frontend (Web)

Aplicação web do TrekMind: interface para buscar destinos, ver lugares e conversar com o assistente de viagens. Desenvolvida com **Next.js 16** (App Router), **React 19** e **Tailwind CSS**.

## Visão geral

O frontend roda no mesmo projeto que a API (`apps/web`). As páginas consomem as rotas em `/api/*` na mesma origem (ex.: `http://localhost:3000`), sem CORS. Não há backend separado; o Next.js serve tanto as páginas quanto os Route Handlers da API.

Funcionalidades para o usuário:

- Navegar pela home e acessar busca, login, cadastro e chat.
- **Buscar destinos** por texto ou usar a localização do navegador para ver lugares próximos.
- **Ver lista de lugares** retornados pela busca ou pela busca por proximidade.
- **Login e cadastro** (integração com `/api/auth/login` e `/api/auth/register`).
- **Chat** com o assistente de viagens (RAG + OpenAI), com opção de enviar coordenadas para respostas contextualizadas.

## Estrutura do app (App Router)

```
app/
├── layout.tsx          # Layout raiz (metadata, fontes, body)
├── page.tsx            # Página inicial (home)
├── globals.css         # Estilos globais + Tailwind
├── login/
│   └── page.tsx        # Página de login
├── register/
│   └── page.tsx        # Página de cadastro
├── search/
│   └── page.tsx        # Busca por texto e “usar minha localização”
├── places/
│   └── page.tsx        # Lista de lugares (resultado da busca ou nearby)
├── chat/
│   └── page.tsx        # Interface do assistente de viagens
└── api/                # API (documentada em README.API.md)
    ├── auth/
    ├── places/
    └── chat/
```

Todas as páginas que precisam de interatividade (formulários, fetch) usam `"use client"` e hooks do React.

## Pré-requisitos

- Node.js >= 18, pnpm 9
- API disponível na mesma origem (rodar `pnpm --filter web dev` na raiz) ou configurar proxy/rewrite se a API estiver em outro host
- Para login/cadastro: PostgreSQL e variáveis `DATABASE_URL`, `JWT_SECRET` configuradas
- Para chat: `OPENAI_API_KEY` configurada

## Como rodar

Na raiz do monorepo:

```bash
pnpm install
pnpm --filter web dev
```

Ou, a partir de `apps/web`:

```bash
pnpm install  # na raiz, para instalar workspace
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Build e checagem

```bash
# Build de produção
pnpm --filter web build

# Checagem de tipos (Next.js typegen + tsc)
pnpm --filter web check-types
```

## Páginas e fluxos

### Home (`/`)

- Apresentação do TrekMind e links para:
  - **Buscar destinos** → `/search`
  - **Entrar** → `/login`
  - **Cadastrar** → `/register`
  - **Conversar com o assistente de viagens** → `/chat`

### Busca (`/search`)

- Campo de texto para busca (ex.: cidade ou ponto de interesse).
- Botão “Buscar” → chama `GET /api/places/search?q=...` e redireciona para `/places` com os dados no query (ex.: `data=...`).
- Botão “Usar minha localização” → usa `navigator.geolocation.getCurrentPosition`, depois `GET /api/places/nearby?lat=...&lng=...&radius=15` e redireciona para `/places` com dados e coordenadas.
- Link “Voltar” para `/`.

### Lugares (`/places`)

- Lista os lugares recebidos da busca ou da busca por proximidade.
- Lê parâmetros da URL (ex.: `q`, `lat`, `lng`, `data`) para exibir o contexto (termo buscado ou “Lugares próximos”) e a lista.
- Cada item pode mostrar nome, categoria, descrição, endereço (conforme implementação da página).

### Login (`/login`)

- Formulário: e-mail e senha.
- Submit → `POST /api/auth/login` com `{ email, password }`.
- Em sucesso: pode armazenar token e redirecionar (conforme implementação; a API retorna `token` e `user`).
- Em erro: exibe mensagem (ex.: “Invalid email or password”).

### Cadastro (`/register`)

- Formulário: nome, e-mail, senha.
- Submit → `POST /api/auth/register` com `{ name, email, password }`.
- Em sucesso: retorno com `id`, `name`, `email`; pode redirecionar para login ou home.
- Em erro: validação (400) ou e-mail já existe (409).

### Chat (`/chat`)

- Área de mensagens (user / assistant).
- Campo de texto + envio.
- Opcional: obter localização do navegador e enviar `latitude` e `longitude` no body do `POST /api/chat` para contextualizar a resposta.
- Envio → `POST /api/chat` com `{ message, latitude?, longitude? }`; exibe a resposta em `answer` ou mensagem de erro.

## Tecnologias e convenções

- **Next.js 16** com App Router; rotas em `app/`.
- **React 19**; componentes em TypeScript (`.tsx`).
- **Tailwind CSS** para estilos; `globals.css` e configuração em `tailwind.config.ts`, `postcss.config.mjs`.
- **Links:** `next/link` para navegação interna.
- **Fetch:** chamadas diretas a `/api/...` (mesma origem); sem cliente HTTP externo por padrão.
- **Formulários:** controlados com `useState`; validação pode usar os mesmos schemas do `@trekmind/shared` se importados no frontend.

## Variáveis de ambiente

O frontend usa as mesmas variáveis que a API (definidas em `.env` na raiz ou em `apps/web`), pois API e frontend estão no mesmo processo:

- `DATABASE_URL`, `JWT_SECRET` — auth
- `OPENAI_API_KEY` — chat

Não é necessário expor chaves no cliente; as chamadas são feitas ao mesmo host (API no servidor Next.js).

## Estilos e acessibilidade

- Uso de cores e contraste alinhados a um tema (ex.: emerald para ações principais, slate para texto).
- Layout responsivo (ex.: `flex-col sm:flex-row` na home).
- Estrutura semântica (títulos, links, botões) para melhor acessibilidade e SEO.

## Documentação relacionada

- **API (Backend):** [README.API.md](./README.API.md) — endpoints, body, query params e uso dos use cases.
- **Projeto geral:** [README.md](../../README.md) na raiz — monorepo, arquitetura, scripts e links para mobile e API.

Este README descreve apenas o frontend web; a documentação da API e do app mobile está nos respectivos arquivos.
