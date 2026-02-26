# TrekMind — Mobile

Aplicativo mobile do TrekMind para **Expo (React Native)** com **Expo Router**. Oferece as mesmas funcionalidades principais do frontend web: busca de destinos, lugares próximos, lista de resultados e chat com o assistente de viagens, além de login e cadastro.

## Visão geral

O app consome a **API do TrekMind** (servida pelo Next.js em `apps/web`). As chamadas são feitas à URL configurada em `EXPO_PUBLIC_API_URL` (ex.: `http://localhost:3000` em desenvolvimento no emulador, ou o IP da máquina na rede para dispositivo físico).

Funcionalidades:

- **Home** com acesso a busca, login, cadastro e chat.
- **Busca** por texto ou “Usar minha localização” (Expo Location).
- **Lista de lugares** exibindo resultados da busca ou da busca por proximidade.
- **Login e cadastro** (POST para `/api/auth/login` e `/api/auth/register`).
- **Chat** com o assistente de viagens (POST `/api/chat`), com opção de enviar coordenadas.

## Estrutura do app (Expo Router)

```
app/
├── _layout.tsx    # Layout raiz: Stack com todas as telas
├── index.tsx      # Home
├── login.tsx      # Tela de login
├── register.tsx   # Tela de cadastro
├── search.tsx     # Busca (texto + localização)
├── places.tsx     # Lista de lugares (recebe parâmetros da busca)
└── chat.tsx       # Assistente de viagens
```

Navegação por arquivo: cada arquivo em `app/` corresponde a uma rota (ex.: `app/search.tsx` → `/search`). O `_layout.tsx` define um `Stack` com títulos para cada tela.

## Pré-requisitos

- Node.js >= 18, pnpm 9
- **Expo CLI** (ou uso via `pnpm exec expo` no projeto)
- **Expo Go** no celular ou emulador Android/iOS para desenvolvimento
- API TrekMind rodando e acessível (ex.: `pnpm --filter web dev` na raiz)
- Para “Usar minha localização”: permissão de localização no dispositivo

## Variáveis de ambiente

O app usa variáveis **públicas** do Expo (prefixo `EXPO_PUBLIC_`) para que estejam disponíveis no cliente.

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | URL base da API (ex.: `http://localhost:3000` ou `http://192.168.1.10:3000`). Se não definida, o código pode usar um fallback (ex.: localhost); em dispositivo físico use o IP da sua máquina. |

Defina no `.env` na raiz do monorepo ou em `apps/mobile` (conforme configuração do Expo). Exemplo em `.env.example` na raiz:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Para dispositivo real, troque por algo como `http://<SEU_IP>:3000`.

## Como rodar

Na raiz do monorepo:

```bash
pnpm install
pnpm --filter mobile dev
```

Ou em `apps/mobile`:

```bash
pnpm dev
```

Isso inicia o bundler Expo. Escaneie o QR code com o Expo Go (Android) ou use o simulador iOS/Android conforme a documentação do Expo. Em dispositivo físico, garanta que `EXPO_PUBLIC_API_URL` aponte para o IP da máquina onde a API está rodando.

### Build (produção)

Para gerar builds nativos (EAS Build ou build local), consulte a [documentação do Expo](https://docs.expo.dev/build/introduction/). O projeto está configurado com `app.json` (Expo) e suporte a rotas tipadas (`typedRoutes`).

## Telas e fluxos

### Home (`/` — `index.tsx`)

- Título “TrekMind” e subtítulo.
- Botões:
  - **Buscar destinos** → `/search`
  - **Entrar** → `/login`
  - **Cadastrar** → `/register`
- Link **Conversar com o assistente** → `/chat`.

### Busca (`/search` — `search.tsx`)

- `TextInput` para termo de busca.
- Botão **Buscar**: chama `GET ${API_URL}/api/places/search?q=...` e navega para `/places` passando os dados no parâmetro `data` (JSON stringificado).
- Botão **Usar minha localização**: solicita permissão com `expo-location` (`requestForegroundPermissionsAsync`), obtém coordenadas (`getCurrentPositionAsync`), chama `GET ${API_URL}/api/places/nearby?lat=...&lng=...&radius=15` e navega para `/places` com `data` e coordenadas.
- Link **Voltar** para `/`.

### Lugares (`/places` — `places.tsx`)

- Lê o parâmetro `data` da navegação (query ou state, conforme Expo Router).
- Faz parse do JSON e exibe lista em `FlatList`: nome, categoria, descrição (resumida).
- Link **Nova busca** para `/search`.

### Login (`/login` — `login.tsx`)

- Formulário: e-mail e senha.
- Submit → `POST ${API_URL}/api/auth/login` com `{ email, password }`.
- Tratamento de sucesso/erro (ex.: alert ou navegação); a API retorna `token` e `user`.

### Cadastro (`/register` — `register.tsx`)

- Formulário: nome, e-mail, senha.
- Submit → `POST ${API_URL}/api/auth/register` com `{ name, email, password }`.
- Tratamento de sucesso (ex.: redirecionar para login) e erro (ex.: e-mail já existe).

### Chat (`/chat` — `chat.tsx`)

- Lista de mensagens (user / assistant) e campo de texto.
- Envio → `POST ${API_URL}/api/chat` com `{ message, latitude?, longitude? }`.
- Opcional: usar `expo-location` para enviar coordenadas e contextualizar a resposta do assistente.
- Resposta exibida em `answer` no body da resposta.

## Dependências principais

- **expo** (~52) — runtime e SDK
- **expo-router** (~4) — roteamento baseado em arquivos
- **expo-location** (~18) — permissões e geolocalização
- **react** 18.3.1, **react-native** 0.76.x
- **react-native-safe-area-context**, **react-native-screens** — suporte a navegação e safe area

TypeScript com `@types/react`; configuração estende `@repo/typescript-config/base.json`.

## Estilos e UX

- Estilos com `StyleSheet.create` (React Native).
- Paleta alinhada ao web: fundo `#f8fafc`, primário `#059669`, texto `#1e293b` / `#64748b`.
- Botões primários e secundários; estados de loading (ex.: “Buscando...”, desabilitar botões).
- Uso de `Alert` para erros quando apropriado.

## Integração com a API

Todas as requisições usam a base `process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"`. Endpoints utilizados:

| Ação | Método | Endpoint |
|------|--------|----------|
| Login | POST | `/api/auth/login` |
| Cadastro | POST | `/api/auth/register` |
| Busca por texto | GET | `/api/places/search?q=...` |
| Lugares próximos | GET | `/api/places/nearby?lat=...&lng=...&radius=15` |
| Chat | POST | `/api/chat` |

Detalhes dos body, query params e respostas estão em [apps/web/README.API.md](../web/README.API.md).

## Documentação relacionada

- **API (Backend):** [apps/web/README.API.md](../web/README.API.md) — referência completa dos endpoints.
- **Frontend Web:** [apps/web/README.md](../web/README.md) — equivalente web das funcionalidades.
- **Projeto geral:** [README.md](../../README.md) na raiz — monorepo, arquitetura e scripts.

Este README descreve apenas o app mobile; para backend e frontend web, consulte os links acima.
