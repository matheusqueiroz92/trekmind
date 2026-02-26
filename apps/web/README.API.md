# TrekMind — API (Backend)

Documentação da API do TrekMind. As rotas são implementadas como **Next.js Route Handlers** em `app/api/` e utilizam os casos de uso e a infraestrutura do monorepo (`@trekmind/application`, `@trekmind/infrastructure`).

## Visão geral

A API é servida pelo mesmo processo Next.js que o frontend (`apps/web`), na mesma origem (ex.: `http://localhost:3000`). Não há servidor backend separado.

Funcionalidades expostas:

- **Autenticação:** registro de usuário e login (JWT).
- **Lugares:** busca por texto (com geocoding) e lugares próximos (por coordenadas).
- **Chat:** assistente de viagens com RAG (Wikipedia + lugares) e OpenAI.

## Estrutura das rotas

```
app/api/
├── auth/
│   ├── login/route.ts    # POST — login (email + senha) → JWT + user
│   └── register/route.ts # POST — cadastro (name, email, password) → user
├── places/
│   ├── search/route.ts   # GET — busca por query (q) e opcionais (lat, lng, address, city, country)
│   └── nearby/route.ts   # GET — lugares próximos (lat, lng, radius, category)
└── chat/route.ts         # POST — mensagem do usuário (+ opcional lat/lng) → resposta do assistente
```

Cada `route.ts` exporta `GET` ou `POST` conforme o método HTTP da rota.

## Pré-requisitos

- Node.js >= 18, pnpm 9
- PostgreSQL (recomendado Docker: `pnpm docker:up` na raiz)
- Variáveis de ambiente configuradas (ver seção [Variáveis de ambiente](#variáveis-de-ambiente))

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim (para auth) | Connection string PostgreSQL (ex.: `postgresql://trekmind:trekmind@localhost:5432/trekmind`) |
| `JWT_SECRET` | Sim (para auth) | Chave secreta para assinatura dos tokens JWT |
| `OPENAI_API_KEY` | Sim (para chat) | Chave da API OpenAI para o assistente de viagens |

Sem `DATABASE_URL`, rotas de registro e login falham. Sem `OPENAI_API_KEY`, o endpoint de chat falha.

## Migrações do banco

O schema e as migrações Drizzle ficam em `packages/infrastructure`. Na raiz do monorepo:

```bash
pnpm exec drizzle-kit push
# ou
pnpm exec drizzle-kit migrate
```

Consulte `packages/infrastructure/drizzle.config.ts` e a pasta `drizzle/` para o estado do schema.

## Endpoints

### Autenticação

#### POST `/api/auth/register`

Cadastra um novo usuário.

**Body (JSON):**

```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

- `name`: string, mínimo 2 caracteres (validação via `@trekmind/shared`).
- `email`: string, formato e-mail válido.
- `password`: string, mínimo 8 caracteres (opcional no schema; recomendado enviar).

**Respostas:**

- `200`: usuário criado. Body: `{ id, name, email }`.
- `400`: validação falhou. Body: `{ error: { fieldErrors } }`.
- `409`: e-mail já existe. Body: `{ error: "..." }`.

**Use case:** `CreateUserUseCase` (application). Infra: `DrizzleUserRepository`, `hashPassword` (bcrypt).

---

#### POST `/api/auth/login`

Autentica usuário e retorna token JWT.

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

**Use case:** `AuthenticateUserUseCase`. Infra: `DrizzleUserRepository`, `JwtTokenService`, `comparePassword`.

---

### Lugares

#### GET `/api/places/search`

Busca lugares por texto (e opcionalmente por contexto geográfico).

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

**Use case:** `SearchPlacesUseCase`. Infra: `ExternalPlaceRepository`, `GeocodingServiceImpl` (geocoding + Wikipedia/external source).

---

#### GET `/api/places/nearby`

Retorna lugares próximos a um ponto (lat/lng) em um raio em km.

**Query params:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `lat` | number | Sim | Latitude. |
| `lng` | number | Sim | Longitude. |
| `radius` | number | Não | Raio em km (default 10). |
| `category` | string | Não | Filtro por categoria (ex.: restaurant, museum). |

**Exemplo:** `GET /api/places/nearby?lat=-23.55&lng=-46.63&radius=15`

**Resposta:** `200` — array de lugares (mesmo formato do search).

**Use case:** `GetNearbyPlacesUseCase`. Infra: `ExternalPlaceRepository`. Validação de query: `placeSearchQuerySchema` (`@trekmind/shared`).

---

### Chat (Assistente de viagens)

#### POST `/api/chat`

Envia uma mensagem ao assistente de viagens. O assistente usa RAG (busca em lugares + Wikipedia) antes de gerar a resposta com OpenAI, para reduzir alucinações.

**Body (JSON):**

```json
{
  "message": "O que visitar em São Paulo em um dia?",
  "latitude": -23.55,
  "longitude": -46.63
}
```

- `message`: string, obrigatório. Pergunta ou pedido do usuário.
- `latitude` / `longitude`: number, opcionais. Se enviados, o contexto de lugares pode ser enriquecido com a localização.

**Resposta:** `200` — `{ answer: "..." }`. Em erro: `400`/`500` com `{ error: "..." }`.

**Use case:** `AnswerTravelQuestionUseCase`. Infra: `TravelRetrievalService` (placeRepository + wikiProvider + geocoding), `OpenAILLMClient`.

---

## Arquitetura (fluxo da API)

1. **Route Handler** (`app/api/.../route.ts`): recebe a requisição, parseia body/query, valida com Zod (schemas de `@trekmind/shared` quando aplicável).
2. **Use case**: instanciado com repositórios e serviços concretos de `@trekmind/infrastructure`; executa a regra de negócio.
3. **Resposta**: JSON com dados ou mensagem de erro e status HTTP apropriado.

Dependências são instanciadas no próprio arquivo de rota (singleton por processo). Para testes ou injeção mais elaborada, pode-se extrair factories ou um pequeno container.

## Entidades e DTOs relevantes

- **User** (domain): id, name, email, createdAt. Persistido em `users` (Drizzle) com `password_hash`.
- **Place** (domain): id, name, description, category, coordinates (LatLong), address, source (wikipedia | google), createdAt. Lugares vêm de fontes externas (Wikipedia, etc.); não há tabela `places` no banco por padrão.
- **PlaceDTO** (application): formato plano usado na API (id, name, description, category, latitude, longitude, address, source, createdAt).

Categorias de lugar (domain + shared): restaurant, museum, beach, trail, hotel, lodging, bar, nightlife, park, waterfall, river, shopping, club, water_park, other.

## Como rodar só a API (com o servidor Next)

Na raiz do monorepo:

```bash
pnpm --filter web dev
```

A API fica em `http://localhost:3000/api/...`. O frontend consome essas rotas na mesma origem; o app mobile deve apontar `EXPO_PUBLIC_API_URL` para essa URL (ou para o IP da máquina em rede local).

## Testes e tipos

- Testes dos use cases e do domain estão em `packages/application` e `packages/domain` (Vitest).
- Para checagem de tipos no app web (inclui as rotas da API): na raiz, `pnpm check-types` ou, dentro de `apps/web`, `pnpm exec tsc --noEmit` (ou `next typegen` conforme configurado no `package.json`).

## Resumo de dependências da API

- **@trekmind/application:** CreateUserUseCase, AuthenticateUserUseCase, SearchPlacesUseCase, GetNearbyPlacesUseCase, AnswerTravelQuestionUseCase.
- **@trekmind/infrastructure:** DrizzleUserRepository, ExternalPlaceRepository, JwtTokenService, hashPassword, comparePassword, WikipediaGateway, GeocodingServiceImpl, TravelRetrievalService, OpenAILLMClient.
- **@trekmind/shared:** userRegisterSchema, userLoginSchema, placeSearchQuerySchema (validação de entrada).

Este README descreve apenas a API; para o frontend (páginas e fluxos) veja [README.md](./README.md) neste mesmo diretório.
