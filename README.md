# TrekMind

Guia turístico inteligente. Descubra lugares, gastronomia e lazer com busca por texto, localização e um assistente de viagens baseado em IA.

## Visão geral

O **TrekMind** é um monorepo que reúne:

- **API (Backend)** — rotas Next.js em `apps/web` que expõem autenticação, busca de lugares e chat com assistente de viagens.
- **Frontend** — aplicação web Next.js (React) para usuários acessarem busca, lugares e chat.
- **Mobile** — aplicativo Expo (React Native) com as mesmas funcionalidades para uso em dispositivo.

A lógica de negócio está organizada em camadas (Domain, Application, Infrastructure) nos pacotes internos, com compartilhamento de tipos e validações.

## Estrutura do repositório

```
trekmind/
├── apps/
│   ├── web/          # Next.js: frontend + API (rotas em app/api)
│   └── mobile/       # Expo (React Native) com Expo Router
├── packages/
│   ├── domain/       # Entidades e value objects (User, Place, etc.)
│   ├── application/  # Casos de uso (create user, search places, chat, etc.)
│   ├── infrastructure/ # Repositórios, gateways (DB, OpenAI, Wikipedia, geocoding)
│   ├── shared/       # Schemas Zod e validações compartilhadas
│   ├── typescript-config/ # Configurações TypeScript do monorepo
│   └── eslint-config/     # Configurações ESLint
├── docker-compose.yml     # PostgreSQL (pgvector) para desenvolvimento
├── turbo.json             # Configuração Turborepo
└── pnpm-workspace.yaml    # Workspaces pnpm
```

## Arquitetura

- **Domain** (`packages/domain`): entidades (User, Place), value objects (Email, LatLong, Address, PlaceCategory, Location) e erros de domínio. Sem dependências externas.
- **Application** (`packages/application`): casos de uso que orquestram repositórios e serviços (interfaces). Depende apenas do domain.
- **Infrastructure** (`packages/infrastructure`): implementações concretas — Drizzle (PostgreSQL), repositório externo de lugares, Wikipedia, geocoding, OpenAI, JWT, bcrypt. Implementa interfaces da application.
- **Shared** (`packages/shared`): schemas Zod para validação de entrada/saída (registro, login, busca de lugares, etc.).

As apps (`web`, `mobile`) consomem `@trekmind/application` e `@trekmind/infrastructure`; a API em `apps/web/app/api` instancia repositórios e serviços e chama os use cases.

## Pré-requisitos

- **Node.js** >= 18
- **pnpm** 9.x (gerenciador de pacotes do monorepo)
- **Docker** e **Docker Desktop** (necessário para login e cadastro — a API usa PostgreSQL)

## Como rodar a aplicação (primeira vez)

Para **cadastro e login** funcionarem, o banco de dados precisa estar no ar. Siga esta ordem:

1. **Instale e abra o Docker Desktop**  
   O PostgreSQL sobe dentro do Docker; sem o Docker em execução, o comando abaixo não funciona.

2. **Suba o PostgreSQL (na raiz do projeto):**
   ```bash
   pnpm docker:up
   ```
   Isso sobe o container do banco na porta 5432 (credenciais em `docker-compose.yml`: usuário/senha `trekmind`, banco `trekmind`).

3. **Crie as tabelas no banco (primeira vez ou após reset do container):**
   ```bash
   pnpm db:push
   ```
   Esse comando aplica o schema do Drizzle (tabelas `user`, `session`, `account`, `verification` do Better Auth, além de `users` legado). Sem ele, login e cadastro falham com "relation does not exist".

4. **Configure o `.env` na raiz do projeto** (pasta `trekmind`, não dentro de `apps/web`):
   ```bash
   cp .env.example .env
   ```
   O app web carrega esse `.env` da raiz. O `.env.example` já traz `DATABASE_URL` compatível com o Docker e variáveis do **Better Auth** (`BETTER_AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`). Para login social (Google/GitHub), configure opcionalmente `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. Não remova usuário e senha da URL do banco — são obrigatórios.

5. **Rode a aplicação:**
   ```bash
   pnpm install   # só na primeira vez
   pnpm dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000). Cadastro e login passam a usar o PostgreSQL do Docker.

**Resumo:** Docker Desktop aberto → `pnpm docker:up` → `pnpm db:push` (primeira vez) → `pnpm dev`. Sem o banco ou sem rodar `db:push`, a API devolve erro 400 ou "relation \"users\" does not exist".

## Configuração inicial (detalhes)

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd trekmind
pnpm install
```

### 2. Variáveis de ambiente

Copie o exemplo e ajuste os valores:

```bash
cp .env.example .env
```

Principais variáveis (ver `.env.example`):

| Variável              | Descrição                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Connection string PostgreSQL (ex.: `postgresql://trekmind:trekmind@localhost:5432/trekmind`) |
| `JWT_SECRET`          | Chave para assinatura de tokens JWT (use valor forte em produção)                            |
| `OPENAI_API_KEY`      | Chave da API OpenAI para o assistente de viagens (chat)                                      |
| `EXPO_PUBLIC_API_URL` | (Opcional) URL base da API para o app mobile (ex.: `http://localhost:3000`)                  |

### 3. Banco de dados (PostgreSQL)

Com Docker:

```bash
pnpm docker:up
```

Isso sobe o PostgreSQL (com pgvector) na porta 5432. Para aplicar migrações Drizzle a partir do pacote infrastructure, consulte o README da API ou do pacote `infrastructure`.

### 4. Rodar a aplicação

**Web (frontend + API):**

```bash
pnpm dev
# ou apenas o app web:
pnpm --filter web dev
```

Acesse [http://localhost:3000](http://localhost:3000).

**Mobile:**

```bash
pnpm --filter mobile dev
```

Use o Expo Go no celular ou emulador, configurando `EXPO_PUBLIC_API_URL` se a API estiver em outra máquina (ex.: IP da sua rede).

## Scripts principais (raiz)

| Script             | Descrição                                          |
| ------------------ | -------------------------------------------------- |
| `pnpm dev`         | Sobe todos os apps em modo desenvolvimento (turbo) |
| `pnpm build`       | Build de todos os pacotes e apps                   |
| `pnpm test`        | Executa testes em todos os workspaces              |
| `pnpm check-types` | Verificação de tipos TypeScript                    |
| `pnpm lint`        | Lint em todo o monorepo                            |
| `pnpm format`      | Formatação com Prettier                            |
| `pnpm docker:up`   | Sobe PostgreSQL com Docker Compose                 |
| `pnpm docker:down` | Para e remove containers do Compose                |
| `pnpm db:push`     | Aplica o schema no PostgreSQL (cria/atualiza tabelas) |

## Documentação por parte do projeto

- **[API / Backend](apps/web/README.API.md)** — rotas, autenticação, lugares, chat, dependências e como rodar só a API.
- **[Frontend (Web)](apps/web/README.md)** — páginas, fluxos e desenvolvimento da aplicação Next.js.
- **[Mobile](apps/mobile/README.md)** — estrutura do app Expo, telas e integração com a API.

## Tecnologias principais

- **Monorepo:** Turborepo + pnpm workspaces
- **Backend/API:** Next.js App Router (Route Handlers em `app/api`)
- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Mobile:** Expo (SDK 52), React Native, Expo Router
- **Domain/Application:** TypeScript, casos de uso e interfaces
- **Infra:** Drizzle ORM, PostgreSQL (pgvector), OpenAI, Wikipedia API, geocoding
- **Validação:** Zod (`@trekmind/shared`)
- **Testes:** Vitest

## Licença

Projeto privado / uso interno (ajuste conforme sua política).
