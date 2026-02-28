# TrekMind — API (Backend)

Documentação da API do TrekMind. As rotas são implementadas como **Next.js Route Handlers** em `app/api/` e utilizam os casos de uso e a infraestrutura do monorepo (`@trekmind/application`, `@trekmind/infrastructure`).

## Documentação Swagger / OpenAPI

A API possui documentação interativa em **Swagger UI** em `/api-docs`. Acesse `http://localhost:3000/api-docs` com o servidor rodando para explorar os endpoints, testar requisições e consultar os schemas. O spec OpenAPI está em `public/openapi.json`.

## Visão geral

A API é servida pelo mesmo processo Next.js que o frontend (`apps/web`), na mesma origem (ex.: `http://localhost:3000`). Não há servidor backend separado.

Funcionalidades expostas:

- **Autenticação:** Better Auth (sessões, login/registro por e-mail, OAuth Google/GitHub, magic link, 2FA). Rotas de compatibilidade para o app mobile (`POST /api/auth/login` e `POST /api/auth/register`) devolvem JWT para uso em `Authorization: Bearer`.
- **Lugares:** busca por texto (com geocoding) e lugares próximos (por coordenadas).
- **Chat:** assistente de viagens com RAG (Wikipedia + lugares) e OpenAI.

## Estrutura das rotas

```
app/api/
├── auth/
│   ├── [...all]/route.ts  # Better Auth (sign-in/email, sign-up/email, get-session, sign-out, OAuth, magic link, 2FA)
│   ├── login/route.ts     # POST — compatibilidade mobile: login → JWT + user
│   └── register/route.ts  # POST — compatibilidade mobile: cadastro → JWT + user
├── places/
│   ├── search/route.ts    # GET — busca por query (q) e opcionais (lat, lng, address, city, country)
│   └── nearby/route.ts    # GET — lugares próximos (lat, lng, radius, category)
└── chat/route.ts          # POST — mensagem do usuário (+ opcional lat/lng) → resposta do assistente
```

Rotas protegidas exigem **sessão** (cookie do Better Auth, no web) ou **JWT** (`Authorization: Bearer <token>`, no mobile). O proxy valida um dos dois antes de liberar acesso.

## Pré-requisitos

- Node.js >= 18, pnpm 9
- PostgreSQL (recomendado Docker: `pnpm docker:up` na raiz)
- Variáveis de ambiente configuradas (ver seção [Variáveis de ambiente](#variáveis-de-ambiente))

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim (para auth e dados) | Connection string PostgreSQL (ex.: `postgresql://trekmind:trekmind@localhost:5432/trekmind`) |
| `BETTER_AUTH_SECRET` | Sim (para auth) | Segredo do Better Auth (sessões, cookies). Mín. 32 caracteres. |
| `NEXT_PUBLIC_SITE_URL` | Sim (para auth) | URL do site (ex.: `http://localhost:3000`). Usado pelo Better Auth e pelo client. |
| `JWT_SECRET` | Recomendado (mobile) | Chave para assinatura dos JWT devolvidos em `/api/auth/login` e `/api/auth/register`. Fallback de `BETTER_AUTH_SECRET` se não definido. |
| `OPENAI_API_KEY` | Sim (para chat) | Chave da API OpenAI para o assistente de viagens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opcional | OAuth Google (login social) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Opcional | OAuth GitHub (login social) |

Sem `DATABASE_URL`, rotas de auth e dados falham. Sem `BETTER_AUTH_SECRET`/`NEXT_PUBLIC_SITE_URL`, o Better Auth não funciona. Sem `OPENAI_API_KEY`, o endpoint de chat falha.

## Migrações do banco

O schema e as migrações Drizzle ficam em `packages/infrastructure`. Na raiz do monorepo:

```bash
pnpm db:push
# ou
pnpm exec drizzle-kit push
```

Consulte `packages/infrastructure/drizzle.config.ts` e a pasta `drizzle/` para o estado do schema. As tabelas do Better Auth são `user`, `session`, `account`, `verification`.

## Endpoints

### Autenticação

A autenticação principal é feita pelo **Better Auth** em `/api/auth/[...all]`:

- **Web:** use o client `authClient` (better-auth/react): `signIn.email`, `signUp.email`, `signIn.social`, `signIn.magicLink`, `signOut`, `getSession`. Sessão via cookie.
- **Mobile:** use as rotas de compatibilidade abaixo e envie o JWT em `Authorization: Bearer <token>` nas demais requisições.

#### POST `/api/auth/register` (compatibilidade mobile)

Cadastra um novo usuário e retorna JWT para o app mobile.

**Body (JSON):**

```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

- `name`: string, obrigatório.
- `email`: string, obrigatório.
- `password`: string, opcional (Better Auth aceita cadastro sem senha; para login por senha depois, envie aqui).

**Respostas:**

- `200`: usuário criado e sessão. Body: `{ token: "jwt...", user: { id, name, email } }`.
- `400`: validação falhou. Body: `{ error: "..." }`.
- `409`: e-mail já existe. Body: `{ error: "..." }`.

Implementação: chama Better Auth `sign-up/email` e, em sucesso, gera JWT com `JwtTokenService` e devolve `token` + `user`. O mobile deve persistir o token (ex.: Expo SecureStore) e enviá-lo em `Authorization: Bearer` nas requisições a `/api/chat` e `/api/places/*`.

---

#### POST `/api/auth/login` (compatibilidade mobile)

Autentica usuário e retorna JWT para o app mobile.

**Body (JSON):**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Respostas:**

- `200`: sucesso. Body: `{ token: "jwt...", user: { id, name, email } }`.
- `400` / `401`: credenciais inválidas ou erro. Body: `{ error: "..." }`.

Implementação: chama Better Auth `sign-in/email` e, em sucesso, obtém a sessão e gera JWT com `JwtTokenService`.

---

### Lugares

#### GET `/api/places/search`

Busca lugares por texto (e opcionalmente por contexto geográfico). Requer autenticação (sessão ou Bearer).

**Query params:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `q` | string | Sim | Termo de busca (ex.: cidade ou ponto de interesse). |
| `lat` | number | Não | Latitude para contexto. |
| `lng` | number | Não | Longitude para contexto. |
| `address` | string | Não | Endereço. |
| `city` | string | Não | Cidade. |
| `country` | string | Não | País. |

**Exemplo:** `GET /api/places/search?q=Paris&city=Paris&country=France`

**Resposta:** `200` — array de lugares no formato do `PlaceDTO` (id, name, description, category, latitude, longitude, address, source, createdAt).

**Use case:** `SearchPlacesUseCase`. Infra: `ExternalPlaceRepository`, `GeocodingServiceImpl`.

---

#### GET `/api/places/nearby`

Retorna lugares próximos a um ponto (lat/lng) em um raio em km. Requer autenticação (sessão ou Bearer).

**Query params:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `lat` | number | Sim | Latitude. |
| `lng` | number | Sim | Longitude. |
| `radius` | number | Não | Raio em km (default 10). |
| `category` | string | Não | Filtro por categoria. |

**Exemplo:** `GET /api/places/nearby?lat=-23.55&lng=-46.63&radius=15`

**Resposta:** `200` — array de lugares (mesmo formato do search). Validação: `placeSearchQuerySchema` (`@trekmind/shared`).

**Use case:** `GetNearbyPlacesUseCase`. Infra: `ExternalPlaceRepository`.

---

### Chat (Assistente de viagens)

#### POST `/api/chat`

Envia uma mensagem ao assistente de viagens. Requer autenticação (sessão ou Bearer). O assistente usa RAG (lugares + Wikipedia) e OpenAI.

**Body (JSON):**

```json
{
  "message": "O que visitar em São Paulo em um dia?",
  "latitude": -23.55,
  "longitude": -46.63
}
```

- `message`: string, obrigatório.
- `latitude` / `longitude`: number, opcionais.

**Resposta:** `200` — `{ answer: "..." }`. Em erro: `400`/`500` com `{ error: "..." }`.

**Use case:** `AnswerTravelQuestionUseCase`. Infra: `TravelRetrievalService`, `OpenAILLMClient`.

---

## Arquitetura (fluxo da API)

1. **Proxy** (`proxy.ts`): para rotas protegidas, exige sessão (cookie) ou JWT válido em `Authorization: Bearer`. Rotas em `/api/auth/*` são liberadas sem auth.
2. **Route Handler** (`app/api/.../route.ts`): parseia body/query, valida (Zod quando aplicável), chama use case ou Better Auth.
3. **Use case** ou **Better Auth**: executa a regra; infra (Drizzle, OpenAI, etc.) é usada conforme a rota.
4. **Resposta**: JSON com dados ou `{ error: "..." }` e status HTTP apropriado.

## Entidades e DTOs relevantes

- **User (Better Auth):** tabela `user` (id, name, email, emailVerified, image, createdAt, updatedAt). Sessões em `session`; credenciais OAuth/senha em `account`.
- **Place** (domain): id, name, description, category, coordinates, address, source, createdAt. Lugares vêm de fontes externas; não há tabela `places` no banco por padrão.
- **PlaceDTO** (application): formato plano na API (id, name, description, category, latitude, longitude, address, source, createdAt).

## Como rodar só a API (com o servidor Next)

Na raiz do monorepo:

```bash
pnpm --filter web dev
```

A API fica em `http://localhost:3000/api/...`. O frontend web consome na mesma origem. O app mobile deve definir `EXPO_PUBLIC_API_URL` para essa URL (ou IP da máquina em rede local) e usar as rotas `/api/auth/login` e `/api/auth/register` para obter o JWT, enviando-o em `Authorization: Bearer` nas demais chamadas.

## Testes e tipos

- Testes dos use cases e do domain estão em `packages/application` e `packages/domain` (Vitest).
- Proxy é testado em `apps/web/middleware.spec.ts`.
- Para tipos: na raiz, `pnpm check-types` ou em `apps/web`: `pnpm exec tsc --noEmit`.

## Resumo de dependências da API

- **Better Auth:** autenticação (sessões, OAuth, magic link, 2FA); adapter Drizzle, tabelas no PostgreSQL.
- **@trekmind/application:** SearchPlacesUseCase, GetNearbyPlacesUseCase, AnswerTravelQuestionUseCase.
- **@trekmind/infrastructure:** JwtTokenService (compatibilidade mobile), ExternalPlaceRepository, WikipediaGateway, GeocodingServiceImpl, TravelRetrievalService, OpenAILLMClient.
- **@trekmind/shared:** placeSearchQuerySchema (validação de query em nearby).

Este README descreve apenas a API; para o frontend (páginas e fluxos) veja [README.md](./README.md) neste mesmo diretório.
