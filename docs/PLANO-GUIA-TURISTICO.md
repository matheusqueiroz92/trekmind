# Plano: TrekMind como guia turístico moderno

## Problemas atuais (resumo)

1. **Busca pouco relevante:** Wikipedia `list=search` retorna qualquer correspondência textual (ex.: "Eyiaba itapetinga", espécie de besouro), sem priorizar cidades ou destinos turísticos.
2. **Estrutura da página:** Lista genérica em vez de overview do destino + seções por categoria (hotéis, restaurantes, bares, pontos turísticos).
3. **Erro na página de detalhes:** O modal retorna "Não foi possível carregar os detalhes" porque o endpoint usa `title` exato (ex.: "Itapetinga") e na pt.wikipedia o artigo pode ser "Itapetinga (Bahia)". Sem fallback para inglês, o resumo não é encontrado.
4. **Mapa:** Leaflet/OpenStreetMap em vez de Google Maps, sem integração com os lugares retornados.
5. **Idioma:** Trechos ainda em inglês — pt.wikipedia nem sempre tem o artigo ou o snippet vem de outra origem.
6. **Falta de inteligência:** Não há fluxo do tipo "praia X" → cidade onde está, hotéis/restaurantes/bares próximos e dicas do que fazer.

---

## 1. Nova arquitetura de busca: resolução do lugar primeiro

**Ideia:** Antes de buscar lugares, **resolver** o termo do usuário em um lugar principal (cidade/região) com coordenadas. Depois, usar essas coordenadas para Wikipedia geosearch (overview) e Google Places (categorias).

### Fluxo proposto

```
Termo do usuário ("Itapetinga", "Praia do Forte", etc.)
    ↓
Resolução do lugar (Geocoding ou Google Places Text Search)
    → nome canônico (ex.: "Itapetinga, Bahia")
    → latitude, longitude
    ↓
Em paralelo:
  1. Wikipedia geosearch(lat, lng) → overview sobre a região/cidade
  2. Google Places Nearby Search (lat, lng) → restaurantes, hospedagem, pontos turísticos, bares
  3. (Opcional) Google Places Text Search → lugar principal se for ponto específico (praia)
```

### Implementação sugerida

- **Novo use case:** `ResolvePlaceUseCase` que usa Geocoding (Nominatim) ou Google Places Text Search para obter nome canônico + lat/lng.
- **Novo endpoint:** `GET /api/places/resolve?q=...` que retorna `{ name, latitude, longitude }` ou null.
- **Frontend:** Primeiro chama `/api/places/resolve?q=...` e, com as coordenadas, chama overview (Wikipedia geosearch) e categorias (Google Places Nearby).

**Benefício:** "Praia do Forte" resolve para localização, depois busca hotéis/restaurantes/bares próximos; reduz resultados irrelevantes.

---

## 2. Estrutura da página de resultados: overview + categorias

### Layout proposto

1. **Hero / Overview (topo):**
   - Nome do lugar (ex.: "Itapetinga, Bahia").
   - Trecho rico da Wikipedia (geosearch) em português.
   - Imagem principal.
   - Mini mapa integrado (Google Maps).

2. **Seções por categoria:**
   - Hotéis e hospedagem
   - Restaurantes
   - Bares e vida noturna
   - Pontos turísticos

3. **Dicas "O que fazer":**
   - Bloco com sugestões geradas por IA usando RAG (Wikipedia + dados dos lugares).

### Backend

- **Overview:** Usar Wikipedia `searchNearby(lat, lng, lang=pt)` para obter artigos relevantes à região.
- **Categorias:** Usar Google Places **Nearby Search** com lat/lng (em vez de Text Search) para resultados mais precisos.
- **Bares:** Incluir categoria `bar` (e/ou `night_club`) na busca.

---

## 3. Correção da página de detalhes

### Causa do erro

O modal chama `/api/places/details?title=Itapetinga&lang=pt`. Na pt.wikipedia o artigo pode ser "Itapetinga (Bahia)". O endpoint usa título exato; se não existir, retorna 404.

### Ajustes

1. **Fallback PT → EN no backend:**
   - Se `getPageSummary(title, "pt")` retornar null, tentar `getPageSummary(title, "en")`.
   - Retornar flag `lang` para a UI avisar "Conteúdo disponível em inglês" quando apropriado.

2. **Uso do título correto da Wikipedia:**
   - Ao clicar em "Ver mais", usar o título exato retornado pela Wikipedia na listagem (ex.: "Itapetinga (Bahia)"), não o nome genérico exibido.

3. **Detalhes para lugares do Google:**
   - Para restaurantes, hotéis etc., usar Place Details da Google em vez da Wikipedia (nome, endereço, rating, fotos, horários).

---

## 4. Mapa Google Maps

### Objetivo

Substituir Leaflet/OpenStreetMap por Google Maps integrado aos lugares.

### Implementação

- **Biblioteca:** `@react-google-maps/api` ou script do Maps JavaScript API.
- **Componente:** `GooglePlaceMap` com marcadores clicáveis para os lugares.
- **Variável de ambiente:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Maps JavaScript API).
- **Remover:** Leaflet após migração.

### Observação

Requer API key e conformidade com os [termos do Google Maps](https://developers.google.com/maps/terms).

---

## 5. Conteúdo em português

- **Wikipedia:** Usar `pt.wikipedia.org` com fallback para `en` quando necessário.
- **Google Places:** `languageCode: "pt-BR"` em todas as requisições.
- **UI:** Textos e labels sempre em português.

---

## 6. Busca inteligente: "praia X" → cidade + entorno

### Comportamento esperado

1. Usuário busca "Praia do Forte".
2. Sistema resolve para localização (ex.: Mata de São João, BA).
3. Sistema busca overview (Wikipedia) e categorias (Google Places Nearby) com lat/lng.
4. Sistema gera "O que fazer" com IA (RAG).

### Implementação

- `ResolvePlaceUseCase` + Geocoding/Places Text Search.
- Endpoint agregado que resolve e busca overview + categorias em paralelo.
- Bloco "O que fazer" com chat/RAG existente.

---

## 7. Ordem sugerida de implementação

| # | Item | Dependência |
|---|------|-------------|
| 1 | Fallback PT→EN na página de detalhes (Wikipedia) | Nenhuma |
| 2 | ResolvePlaceUseCase + endpoint /api/places/resolve | Geocoding ou Places API |
| 3 | Novo fluxo de busca: resolve → overview + categorias por lat/lng | Itens 1–2 |
| 4 | Estrutura da página: overview no topo + seções (hotéis, restaurantes, bares, pontos) | Item 3 |
| 5 | Google Places Nearby (em vez de Text Search) quando houver lat/lng | API Key Google |
| 6 | Incluir bar/night_club nas categorias | Item 5 |
| 7 | Substituir Leaflet por Google Maps | Maps API Key |
| 8 | Detalhes para lugares Google (Place Details) | Item 5 |
| 9 | Bloco "O que fazer" com IA | Chat/RAG existente |

---

## 8. Resumo das mudanças

- **Busca:** Resolver termo em lugar com coordenadas; usar coordenadas para overview e categorias.
- **Página:** Overview no topo; seções por categoria (hotéis, restaurantes, bares, pontos turísticos).
- **Detalhes:** Fallback PT→EN; suporte a detalhes via Google Place Details para lugares do Google.
- **Mapa:** Google Maps no lugar de Leaflet/OpenStreetMap.
- **Idioma:** Preferência por português em todas as fontes.
- **Dicas:** Bloco "O que fazer" gerado por IA com RAG.
