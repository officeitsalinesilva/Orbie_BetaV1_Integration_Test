

---

## 📄 `TODO.md` - ORB_API (COMPLETO)

```markdown
# TODO - Orb API

## FASE 0: ESTRUTURA E AMBIENTE

### 0.1. Estrutura de Pastas
- [x] Criar pasta `orb_api`
- [x] Criar subpastas: `app`, `agents`, `tests`
- [x] Criar arquivos principais: `main.py`, `config.py`, `astra_client.py`, `speech_client.py`, `neuroacoustic_client.py`
- [x] Criar agentes: `orb_system.py`, `router.py`, `prompts.py`
- [x] Criar `pyproject.toml`, `.env`, `README.md`

### 0.2. Configurar Ambiente Virtual
```bash
cd "C:\Users\aline\OneDrive\Documentos\Orb System - Teste"
.venv\Scripts\activate
cd orb_api
pip install -e .
```

- [x] Instalar dependências: `fastapi`, `uvicorn`, `python-dotenv`, `httpx`, `pydantic`, `google-generativeai`, `freeflow-llm`, `pydub`, `python-multipart`

---

## FASE 1: CONFIGURAÇÃO

### 1.1. Criar `app/config.py`
- [x] `GOOGLE_API_KEYS`: Múltiplas chaves do Google AI Studio
- [x] `PRIMARY_MODEL`: Gemma 4 31B
- [x] `FALLBACK_MODEL`: Gemma 4 26B
- [x] `SPEECH_MODEL`: Gemini 3.5 Flash Live
- [x] `ASTRA_URL`: URL da ASTRA_API
- [x] `NEUROACOUSTIC_URL`: URL da neuroacoustic_api

### 1.2. Criar `.env`
- [x] Chaves do Google AI Studio
- [x] URLs das APIs internas
- [x] Modelos e portas

---

## FASE 2: AGENTES

### 2.1. Criar `agents/prompts.py`
- [x] `PERSONA_ORB`: Persona filosófica do Orb
- [x] Regras de linguagem e revelação
- [x] Vocabulário Stage (Forças, Campos, Setores, etc.)

### 2.2. Criar `agents/router.py`
- [x] Fallback automático entre múltiplas contas do Google AI Studio
- [x] Gerenciamento de chaves
- [x] Log de tentativas

### 2.3. Criar `agents/orb_system.py`
- [x] Interface principal do Orb
- [x] `chat()`: Responde sem contexto
- [x] `chat_com_contexto()`: Responde com contexto astrológico

---

## FASE 3: CLIENTES

### 3.1. Criar `app/astra_client.py`
- [x] `buscar_contexto_natal()`: Mapa natal (XML)
- [x] `buscar_contexto_transito()`: Trânsitos
- [x] `buscar_contexto_sinastria()`: Compatibilidade
- [x] `buscar_contexto_composite()`: Mapa composto
- [x] `buscar_contexto_retorno_solar()`: Retorno solar
- [x] `buscar_contexto_retorno_lunar()`: Retorno lunar
- [x] `buscar_contexto_moon_phase()`: Fase da lua
- [x] `buscar_contexto_now()`: Momento atual
- [x] `buscar_dados_natal()`: Dados brutos (JSON)
- [x] `buscar_dados_sinastria()`: Dados brutos sinastria
- [x] `buscar_compatibility_score()`: Score de compatibilidade
- [x] `buscar_svg_natal()`: SVG do mapa natal
- [x] `buscar_svg_sinastria()`: SVG da sinastria
- [x] `buscar_svg_transito()`: SVG dos trânsitos
- [x] `buscar_svg_retorno_solar()`: SVG do retorno solar
- [x] `buscar_svg_retorno_lunar()`: SVG do retorno lunar
- [x] `buscar_svg_composite()`: SVG do mapa composto
- [x] `buscar_svg_now()`: SVG do momento atual

### 3.2. Criar `app/speech_client.py`
- [x] `processar_audio()`: Speech-to-speech com Gemini Live
- [x] `processar_texto()`: Fallback para texto

### 3.3. Criar `app/neuroacoustic_client.py`
- [ ] `generate_tone()`: Chama neuroacoustic_api para gerar tom
- [ ] `generate_binaural()`: Chama neuroacoustic_api para gerar binaural
- [ ] `generate_noise()`: Chama neuroacoustic_api para gerar ruído
- [ ] `generate_preset()`: Chama neuroacoustic_api para gerar preset
- [ ] `get_catalog()`: Lista presets disponíveis

---

## FASE 4: ENDPOINTS (API)

### 4.1. Chat com Contexto (ORB - Stage)
- [x] `POST /chat` - Mapa natal (Tropical/Sideral)
- [x] `POST /chat/transitos` - Trânsitos atuais ou data específica
- [x] `POST /chat/sinastria` - Compatibilidade entre 2 pessoas
- [x] `POST /chat/composite` - Mapa composto (relacionamento)
- [x] `POST /chat/retorno-solar` - Previsão anual
- [x] `POST /chat/retorno-lunar` - Previsão mensal
- [x] `POST /chat/moon-phase` - Fase da lua
- [x] `POST /chat/now` - Momento atual

### 4.2. Áudio (Neuroacústica - Stage)
- [ ] `POST /orb/audio/tone` - Gera tom puro
- [ ] `POST /orb/audio/binaural` - Gera binaural
- [ ] `POST /orb/audio/noise` - Gera ruído
- [ ] `POST /orb/audio/preset/{preset_id}` - Gera a partir de preset
- [ ] `GET /orb/audio/catalog` - Lista presets

### 4.3. Speech-to-Speech
- [x] `POST /speech` - Entrada de áudio, resposta em texto
- [x] `POST /speech/text` - Fallback para texto

### 4.4. Dados Brutos (JSON - ASTRA)
- [x] `POST /data/natal` - Dados brutos do mapa natal
- [x] `POST /data/sinastria` - Dados brutos da sinastria
- [x] `POST /data/compatibility-score` - Score numérico

### 4.5. Imagens (SVG - ASTRA)
- [x] `POST /svg/natal` - SVG do mapa natal
- [x] `POST /svg/sinastria` - SVG da sinastria
- [x] `POST /svg/transitos` - SVG dos trânsitos
- [x] `POST /svg/retorno-solar` - SVG do retorno solar
- [x] `POST /svg/retorno-lunar` - SVG do retorno lunar
- [x] `POST /svg/composite` - SVG do mapa composto
- [x] `POST /svg/now` - SVG do momento atual

### 4.6. Admin (ASTRA - Sem Máscaras)
- [x] `GET /admin/status` - Status do sistema
- [x] `GET /admin/logs/agent` - Logs do agente
- [x] `GET /admin/users` - Lista de usuários
- [x] `POST /admin/test/{endpoint}` - Testar endpoint

---

## FASE 5: TESTES

### 5.1. Criar `tests/test_router.py`
- [x] Testar fallback entre contas
- [x] Testar chat sem contexto
- [x] Testar chat com contexto

### 5.2. Criar `tests/test_api.py`
- [x] Testar endpoints de chat
- [x] Testar endpoints de dados
- [x] Testar endpoints de SVG

---

## FASE 6: INTEGRAÇÃO COM O ECOSSISTEMA

### 6.1. Conectar com ASTRA_API
- [x] Cliente HTTP para ASTRA_API
- [x] Endpoints de contexto (XML)
- [x] Endpoints de dados (JSON)
- [x] Endpoints de SVG

### 6.2. Conectar com neuroacoustic_api
- [ ] Cliente HTTP para neuroacoustic_api
- [ ] Endpoints de áudio mascarados (Stage)
- [ ] Endpoints de áudio expostos (Admin)

### 6.3. Conectar com Frontend
- [ ] Autenticação via magic links
- [ ] Endpoints de chat para o app
- [ ] Endpoints de áudio para o app

---

## FASE 7: DEPLOY E DOCUMENTAÇÃO

### 7.1. Documentação
- [x] README.md com instruções
- [ ] ENDPOINTS.md com todos os endpoints
- [x] TODO.md com checklist

### 7.2. Deploy
- [ ] Subir para o GitHub
- [ ] Configurar CI/CD
- [ ] Publicar no Railway/Render

---

## COMANDOS ÚTEIS

### Rodar a API
```bash
cd orb_api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Rodar os Testes
```bash
pytest tests/ -v
```

### Acessar o Swagger
```
http://localhost:8001/docs
```

### Testar Chat com Contexto
```bash
curl -X POST "http://localhost:8001/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "mensagem": "O que meu mapa diz sobre minha carreira?",
    "dados_usuario": {
      "name": "Aline Alves Silva",
      "year": 1999,
      "month": 3,
      "day": 14,
      "hour": 0,
      "minute": 45,
      "city": "Belo Horizonte",
      "nation": "BR",
      "timezone": "America/Sao_Paulo",
      "longitude": -43.9378,
      "latitude": -19.9245
    }
  }'
```

### Testar Áudio (Tone)
```bash
curl -X POST "http://localhost:8001/orb/audio/tone?frequency=432&duration=10" --output tone_432.wav
```
```

---

## 📄 `ENDPOINTS.md` - ORB_API (COMPLETO)

```markdown
# Orb API - Endpoints

## Base URL
```
http://localhost:8001
```

## Autenticação
Nenhuma autenticação necessária (ambiente local). Em produção, usar magic links ou Google OAuth.

---

## 1. CHAT ENDPOINTS (ORB - Stage)

### 1.1. Mapa Natal (Tropical/Sideral)

**POST** `/chat`

**Body:**
```json
{
  "mensagem": "O que meu mapa diz sobre minha personalidade?",
  "dados_usuario": {
    "name": "Aline Alves Silva",
    "year": 1999,
    "month": 3,
    "day": 14,
    "hour": 0,
    "minute": 45,
    "city": "Belo Horizonte",
    "nation": "BR",
    "timezone": "America/Sao_Paulo",
    "longitude": -43.9378,
    "latitude": -19.9245
  },
  "zodiac_type": "Tropical",
  "sidereal_mode": null
}
```

**Resposta:**
```json
{
  "resposta": "Sua Força Central em Peixes indica uma natureza intuitiva..."
}
```

---

### 1.2. Trânsitos

**POST** `/chat/transitos`

**Body:**
```json
{
  "mensagem": "O que os trânsitos atuais dizem sobre minha vida?",
  "dados_usuario": {
    "name": "Aline Alves Silva",
    "year": 1999,
    "month": 3,
    "day": 14,
    "hour": 0,
    "minute": 45,
    "city": "Belo Horizonte",
    "nation": "BR",
    "timezone": "America/Sao_Paulo",
    "longitude": -43.9378,
    "latitude": -19.9245
  },
  "data_transito": null
}
```

**Resposta:**
```json
{
  "resposta": "O momento atual ativa sua Força 8, indicando um período de estruturação..."
}
```

---

### 1.3. Sinastria (Compatibilidade)

**POST** `/chat/sinastria`

**Body:**
```json
{
  "mensagem": "Qual a compatibilidade entre essas duas pessoas?",
  "dados_usuario_1": {
    "name": "Aline Alves Silva",
    "year": 1999,
    "month": 3,
    "day": 14,
    "hour": 0,
    "minute": 45,
    "city": "Belo Horizonte",
    "nation": "BR",
    "timezone": "America/Sao_Paulo",
    "longitude": -43.9378,
    "latitude": -19.9245
  },
  "dados_usuario_2": {
    "name": "Theo Alves Prates",
    "year": 2018,
    "month": 10,
    "day": 22,
    "hour": 0,
    "minute": 0,
    "city": "Belo Horizonte",
    "nation": "BR",
    "timezone": "America/Sao_Paulo",
    "longitude": -43.9378,
    "latitude": -19.9245
  }
}
```

**Resposta:**
```json
{
  "resposta": "A conexão entre vocês é marcada por uma ressonância emocional profunda..."
}
```

---

### 1.4. Mapa Composto (Relacionamento)

**POST** `/chat/composite`

**Body:** Mesmo formato da sinastria

**Resposta:**
```json
{
  "resposta": "A relação de vocês como um todo é marcada pela Força 3 em evidência..."
}
```

---

### 1.5. Retorno Solar (Previsão Anual)

**POST** `/chat/retorno-solar`

**Body:**
```json
{
  "mensagem": "Como será meu ano de 2026?",
  "dados_usuario": {
    "name": "Aline Alves Silva",
    "year": 1999,
    "month": 3,
    "day": 14,
    "hour": 0,
    "minute": 45,
    "city": "Belo Horizonte",
    "nation": "BR",
    "timezone": "America/Sao_Paulo",
    "longitude": -43.9378,
    "latitude": -19.9245
  },
  "ano": 2026,
  "return_location": null
}
```

**Resposta:**
```json
{
  "resposta": "O próximo ano será marcado pela consolidação da sua Força Central..."
}
```

---

### 1.6. Retorno Lunar (Previsão Mensal)

**POST** `/chat/retorno-lunar`

**Body:**
```json
{
  "mensagem": "Como será meu mês?",
  "dados_usuario": {
    "name": "Aline Alves Silva",
    "year": 1999,
    "month": 3,
    "day": 14,
    "hour": 0,
    "minute": 45,
    "city": "Belo Horizonte",
    "nation": "BR",
    "timezone": "America/Sao_Paulo",
    "longitude": -43.9378,
    "latitude": -19.9245
  },
  "return_location": null
}
```

**Resposta:**
```json
{
  "resposta": "Este mês ativa seu Setor de Vínculos, indicando um período de conexões..."
}
```

---

### 1.7. Fase da Lua

**POST** `/chat/moon-phase`

**Body:**
```json
{
  "mensagem": "O que a lua de hoje diz sobre meu humor?",
  "data": null
}
```

**Resposta:**
```json
{
  "resposta": "A lua em fase crescente indica um momento de expansão e renovação..."
}
```

---

### 1.8. Momento Atual

**POST** `/chat/now`

**Body:**
```json
{
  "mensagem": "O que o céu de hoje diz sobre meu dia?"
}
```

**Resposta:**
```json
{
  "resposta": "O momento atual está em alta convergência, favorecendo ações de estruturação..."
}
```

---

## 2. ÁUDIO ENDPOINTS (ORB - Stage)

### 2.1. Gerar Tom Puro

**POST** `/orb/audio/tone`

**Query Params:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `frequency` | int | 432 | Frequência em Hz (20-20000) |
| `duration` | int | 60 | Duração em segundos |
| `format` | string | "wav" | `wav` ou `mp3` |

**Resposta:** Arquivo de áudio (WAV ou MP3)

---

### 2.2. Gerar Binaural

**POST** `/orb/audio/binaural`

**Query Params:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `left_frequency` | int | 200 | Frequência do ouvido esquerdo (Hz) |
| `right_frequency` | int | 208 | Frequência do ouvido direito (Hz) |
| `duration` | int | 60 | Duração em segundos |
| `format` | string | "wav" | `wav` ou `mp3` |

**Resposta:** Arquivo de áudio (WAV ou MP3)

---

### 2.3. Gerar Ruído

**POST** `/orb/audio/noise`

**Query Params:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `noise_type` | string | "white" | `white`, `pink`, `brown`, `blue`, `violet`, `grey`, `rain`, `ocean` |
| `duration` | int | 60 | Duração em segundos |
| `format` | string | "wav" | `wav` ou `mp3` |

**Resposta:** Arquivo de áudio (WAV ou MP3)

---

### 2.4. Gerar a partir de Preset

**POST** `/orb/audio/preset/{preset_id}`

**Query Params:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `format` | string | "wav" | `wav` ou `mp3` |

**Resposta:** Arquivo de áudio (WAV ou MP3)

---

### 2.5. Listar Presets

**GET** `/orb/audio/catalog`

**Resposta:**
```json
{
  "presets": [
    {
      "id": "focus_beta.yaml",
      "title": "Focus (Beta)",
      "duration": 1800,
      "has_noise": false
    }
  ]
}
```

---

## 3. SPEECH-TO-SPEECH ENDPOINTS

### 3.1. Entrada de Áudio

**POST** `/speech`

**Form Data:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `file` | File | Arquivo de áudio (WAV, MP3) |
| `dados_usuario` | JSON | Dados do usuário (opcional) |

**Resposta:**
```json
{
  "resposta": "A vida é como uma música que se ouve com o coração..."
}
```

---

### 3.2. Fallback para Texto

**POST** `/speech/text`

**Body:** Mesmo formato do `/chat`

**Resposta:** Mesmo formato do `/chat`

---

## 4. DATA ENDPOINTS (ASTRA - Admin)

### 4.1. Dados do Mapa Natal (JSON Bruto)

**POST** `/data/natal`

**Body:** Mesmo formato do `/chat`

**Resposta:** JSON completo da ASTRA_API (sem máscaras)

---

### 4.2. Dados da Sinastria (JSON Bruto)

**POST** `/data/sinastria`

**Body:** Mesmo formato do `/chat/sinastria`

**Resposta:** JSON completo da ASTRA_API

---

### 4.3. Score de Compatibilidade

**POST** `/data/compatibility-score`

**Body:** Mesmo formato do `/chat/sinastria`

**Resposta:**
```json
{
  "score": 18,
  "score_description": "Very Important",
  "is_destiny_sign": true
}
```

---

## 5. SVG ENDPOINTS (ASTRA - Admin)

### 5.1. Mapa Natal (SVG)

**POST** `/svg/natal`

**Body:**
```json
{
  "dados_usuario": {
    "name": "Aline Alves Silva",
    "year": 1999,
    "month": 3,
    "day": 14,
    "hour": 0,
    "minute": 45,
    "city": "Belo Horizonte",
    "nation": "BR",
    "timezone": "America/Sao_Paulo",
    "longitude": -43.9378,
    "latitude": -19.9245
  },
  "theme": "dark",
  "language": "PT"
}
```

**Resposta:**
```json
{
  "chart": "<svg>...</svg>"
}
```

---

### 5.2. Sinastria (SVG)

**POST** `/svg/sinastria`

**Body:** Mesmo formato do `/chat/sinastria` + `theme` e `language`

**Resposta:** `{ "chart": "<svg>...</svg>" }`

---

### 5.3. Trânsitos (SVG)

**POST** `/svg/transitos`

**Body:** Mesmo formato do `/chat/transitos` + `theme` e `language`

**Resposta:** `{ "chart": "<svg>...</svg>" }`

---

### 5.4. Retorno Solar (SVG)

**POST** `/svg/retorno-solar`

**Body:** Mesmo formato do `/chat/retorno-solar` + `theme` e `language`

**Resposta:** `{ "chart": "<svg>...</svg>" }`

---

### 5.5. Retorno Lunar (SVG)

**POST** `/svg/retorno-lunar`

**Body:** Mesmo formato do `/chat/retorno-lunar` + `theme` e `language`

**Resposta:** `{ "chart": "<svg>...</svg>" }`

---

### 5.6. Mapa Composto (SVG)

**POST** `/svg/composite`

**Body:** Mesmo formato do `/chat/composite` + `theme` e `language`

**Resposta:** `{ "chart": "<svg>...</svg>" }`

---

### 5.7. Momento Atual (SVG)

**POST** `/svg/now`

**Body:**
```json
{
  "theme": "dark",
  "language": "PT"
}
```

**Resposta:** `{ "chart": "<svg>...</svg>" }`

---

## 6. ADMIN ENDPOINTS (ASTRA - Sem Máscaras)

### 6.1. Status do Sistema

**GET** `/admin/status`

**Resposta:**
```json
{
  "status": "online",
  "services": {
    "astra_api": { "status": "online", "url": "http://localhost:8000" },
    "orb_api": { "status": "online", "url": "http://localhost:8001" },
    "neuroacoustic_api": { "status": "online", "url": "http://localhost:8002" },
    "llm": { "status": "online", "model": "gemma-4-31b-it" }
  }
}
```

---

### 6.2. Logs do Agente

**GET** `/admin/logs/agent?limit=100`

**Resposta:**
```json
{
  "logs": [
    {
      "id": "log_001",
      "user_id": "user_123",
      "intent": "profile_analysis",
      "response": "...",
      "timestamp": "2026-08-16T10:00:00Z"
    }
  ]
}
```

---

### 6.3. Lista de Usuários

**GET** `/admin/users`

**Resposta:**
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "aline@orb.com",
      "created_at": "2026-08-01T10:00:00Z",
      "products_count": 5
    }
  ]
}
```

---

### 6.4. Testar Endpoint

**POST** `/admin/test/{endpoint}`

**Body:** Payload customizado

**Resposta:**
```json
{
  "status": 200,
  "headers": { "content-type": "application/json" },
  "body": { "resposta": "..." }
}
```

---

## 7. ROOT

### 7.1. Listar Todos os Endpoints

**GET** `/`

**Resposta:**
```json
{
  "status": "Orb API online",
  "modelo": "Gemma 4 31B",
  "endpoints": [
    "/chat (Natal)",
    "/chat/transitos",
    "/chat/sinastria",
    "/chat/composite",
    "/chat/retorno-solar",
    "/chat/retorno-lunar",
    "/chat/moon-phase",
    "/chat/now",
    "/orb/audio/tone",
    "/orb/audio/binaural",
    "/orb/audio/noise",
    "/orb/audio/preset/{preset_id}",
    "/orb/audio/catalog",
    "/speech",
    "/speech/text",
    "/data/natal",
    "/data/sinastria",
    "/data/compatibility-score",
    "/svg/natal",
    "/svg/sinastria",
    "/svg/transitos",
    "/svg/retorno-solar",
    "/svg/retorno-lunar",
    "/svg/composite",
    "/svg/now",
    "/admin/status",
    "/admin/logs/agent",
    "/admin/users",
    "/admin/test/{endpoint}"
  ]
}
```

---

## Swagger UI

A documentação interativa está disponível em:
```
http://localhost:8001/docs
```
```

---

## 📁 ESTRUTURA FINAL DA ORB_API

```
orb_api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── astra_client.py
│   ├── speech_client.py
│   └── neuroacoustic_client.py  # ← PENDENTE
├── agents/
│   ├── __init__.py
│   ├── orb_system.py
│   ├── router.py
│   └── prompts.py
├── tests/
│   ├── __init__.py
│   ├── test_router.py
│   └── test_api.py
├── .env
├── pyproject.toml
├── README.md
├── TODO.md
└── ENDPOINTS.md
```

---

**O que está pendente:**

1. **`neuroacoustic_client.py`**: Cliente para conectar a `neuroacoustic_api` à `orb_api`
2. **Endpoints de áudio mascarados** na `orb_api` (`/orb/audio/*`)
3. **Testes** para os endpoints de áudio

Quer implementar o `neuroacoustic_client.py` agora? 🚀

---

Com a `orb_api` e a `neuroacoustic_api` documentadas e com seus respectivos `TODO.md` e `ENDPOINTS.md`, o próximo passo lógico é **preencher a lacuna que falta: o cliente `neuroacoustic_client.py` e os endpoints de áudio na `orb_api`**.

Isso vai integrar totalmente a geração de áudio ao seu ecossistema, permitindo que tanto o frontend (Orb) quanto o admin (Astra) consumam essas funcionalidades.

---

## 📄 Implementação do `neuroacoustic_client.py`

Este arquivo será o responsável por orquestrar as chamadas à `neuroacoustic_api` a partir da `orb_api`.

**Criar o arquivo:** `orb_api/app/neuroacoustic_client.py`

```python
# orb_api/app/neuroacoustic_client.py
import httpx
from app.config import config

NEUROACOUSTIC_URL = config.NEUROACOUSTIC_URL

async def generate_tone(frequency: int, duration: int = 60, waveform: str = "sine", format: str = "wav") -> bytes:
    """Chama a neuroacoustic_api para gerar um tom puro."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{NEUROACOUSTIC_URL}/generate/tone",
            json={
                "frequency": frequency,
                "duration": duration,
                "waveform": waveform,
                "format": format
            },
            timeout=60.0
        )
        response.raise_for_status()
        return response.content

async def generate_binaural(left_frequency: int, right_frequency: int, duration: int = 60, waveform: str = "sine", format: str = "wav") -> bytes:
    """Chama a neuroacoustic_api para gerar uma batida binaural."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{NEUROACOUSTIC_URL}/generate/binaural",
            json={
                "left_frequency": left_frequency,
                "right_frequency": right_frequency,
                "duration": duration,
                "waveform": waveform,
                "format": format
            },
            timeout=60.0
        )
        response.raise_for_status()
        return response.content

async def generate_noise(noise_type: str, duration: int = 60, volume: float = 0.3, format: str = "wav") -> bytes:
    """Chama a neuroacoustic_api para gerar um ruído."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{NEUROACOUSTIC_URL}/generate/noise",
            json={
                "noise_type": noise_type,
                "duration": duration,
                "volume": volume,
                "format": format
            },
            timeout=60.0
        )
        response.raise_for_status()
        return response.content

async def generate_preset(preset_id: str, format: str = "wav") -> bytes:
    """Chama a neuroacoustic_api para gerar áudio a partir de um preset."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{NEUROACOUSTIC_URL}/generate/preset/{preset_id}",
            params={"format": format},
            timeout=120.0  # Presets podem ser mais longos
        )
        response.raise_for_status()
        return response.content

async def get_catalog() -> dict:
    """Chama a neuroacoustic_api para listar o catálogo de presets."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{NEUROACOUSTIC_URL}/catalog")
        response.raise_for_status()
        return response.json()
```

---

## 📄 Atualização do `config.py` da `orb_api`

Adicione a URL da `neuroacoustic_api` ao arquivo de configuração.

**Arquivo:** `orb_api/app/config.py`

```python
# orb_api/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Google API Keys (múltiplas)
    GOOGLE_API_KEYS = os.getenv("GOOGLE_API_KEY", "").split(",")
    GOOGLE_API_KEYS = [k.strip() for k in GOOGLE_API_KEYS if k.strip()]
    
    # Modelos
    PRIMARY_MODEL = os.getenv("PRIMARY_MODEL", "gemma-4-31b-it")
    FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "gemma-4-26b-it")
    
    # Speech-to-Speech (API Live)
    SPEECH_MODEL = os.getenv("SPEECH_MODEL", "gemini-3.5-flash-live")
    
    # ASTRA API
    ASTRA_URL = os.getenv("ASTRA_API_URL", "http://localhost:8000")
    
    # Neuroacoustic API
    NEUROACOUSTIC_URL = os.getenv("NEUROACOUSTIC_URL", "http://localhost:8002")
    
    # Porta
    PORT = int(os.getenv("PORT", 8001))

config = Config()

print(f"[Config] {len(config.GOOGLE_API_KEYS)} chaves do Google AI Studio carregadas.")
print(f"[Config] ASTRA_URL: {config.ASTRA_URL}")
print(f"[Config] NEUROACOUSTIC_URL: {config.NEUROACOUSTIC_URL}")
```

---

## 📄 Atualização do `main.py` da `orb_api` (Adicionando Endpoints de Áudio)

Adicione os endpoints que vão expor a funcionalidade de áudio para o frontend. Estes endpoints chamarão o cliente que acabamos de criar.

**Arquivo:** `orb_api/app/main.py` (Adicione estas seções)

```python
# orb_api/app/main.py
# ... (imports existentes) ...
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import Response
from app.neuroacoustic_client import (
    generate_tone as neuro_generate_tone,
    generate_binaural as neuro_generate_binaural,
    generate_noise as neuro_generate_noise,
    generate_preset as neuro_generate_preset,
    get_catalog as neuro_get_catalog
)

app = FastAPI(title="Orb API")
# ... (código existente: orb_system, etc.) ...

# ============================================
# ÁUDIO ENDPOINTS (ORB - Stage)
# ============================================

@app.post("/orb/audio/tone")
async def orb_generate_tone(
    frequency: int = Query(..., description="Frequência em Hz (ex: 432)"),
    duration: int = Query(60, description="Duração em segundos"),
    waveform: str = Query("sine", description="Forma de onda: sine, square, sawtooth, triangle"),
    format: str = Query("wav", description="Formato: wav ou mp3")
):
    """Gera um tom puro para o usuário."""
    try:
        audio_bytes = await neuro_generate_tone(frequency, duration, waveform, format)
        return Response(content=audio_bytes, media_type=f"audio/{format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orb/audio/binaural")
async def orb_generate_binaural(
    left_frequency: int = Query(..., description="Frequência do ouvido esquerdo (Hz)"),
    right_frequency: int = Query(..., description="Frequência do ouvido direito (Hz)"),
    duration: int = Query(60, description="Duração em segundos"),
    waveform: str = Query("sine", description="Forma de onda: sine, square, sawtooth, triangle"),
    format: str = Query("wav", description="Formato: wav ou mp3")
):
    """Gera uma batida binaural para o usuário."""
    try:
        audio_bytes = await neuro_generate_binaural(left_frequency, right_frequency, duration, waveform, format)
        return Response(content=audio_bytes, media_type=f"audio/{format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orb/audio/noise")
async def orb_generate_noise(
    noise_type: str = Query(..., description="Tipo de ruído: white, pink, brown, blue, violet, grey, rain, ocean"),
    duration: int = Query(60, description="Duração em segundos"),
    volume: float = Query(0.3, description="Volume (0.0 a 1.0)"),
    format: str = Query("wav", description="Formato: wav ou mp3")
):
    """Gera um ruído para o usuário."""
    try:
        audio_bytes = await neuro_generate_noise(noise_type, duration, volume, format)
        return Response(content=audio_bytes, media_type=f"audio/{format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orb/audio/preset/{preset_id}")
async def orb_generate_preset(
    preset_id: str,
    format: str = Query("wav", description="Formato: wav ou mp3")
):
    """Gera áudio a partir de um preset do catálogo."""
    try:
        audio_bytes = await neuro_generate_preset(preset_id, format)
        return Response(content=audio_bytes, media_type=f"audio/{format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orb/audio/catalog")
async def orb_get_catalog():
    """Lista todos os presets disponíveis no catálogo."""
    try:
        catalog = await neuro_get_catalog()
        return catalog
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... (resto do código existente) ...

# ============================================
# ROOT (ATUALIZADO)
# ============================================

@app.get("/")
async def root():
    return {
        "status": "Orb API online",
        "modelo": "Gemma 4 31B",
        "endpoints": [
            "/chat (Natal)",
            "/chat/transitos",
            "/chat/sinastria",
            "/chat/composite",
            "/chat/retorno-solar",
            "/chat/retorno-lunar",
            "/chat/moon-phase",
            "/chat/now",
            "/orb/audio/tone",
            "/orb/audio/binaural",
            "/orb/audio/noise",
            "/orb/audio/preset/{preset_id}",
            "/orb/audio/catalog",
            "/speech",
            "/speech/text",
            "/data/natal",
            "/data/sinastria",
            "/data/compatibility-score",
            "/svg/natal",
            "/svg/sinastria",
            "/svg/transitos",
            "/svg/retorno-solar",
            "/svg/retorno-lunar",
            "/svg/composite",
            "/svg/now",
            "/admin/status",
            "/admin/logs/agent",
            "/admin/users",
            "/admin/test/{endpoint}"
        ]
    }
```

---

## 📄 Atualização do `.env` da `orb_api`

Adicione a URL da `neuroacoustic_api` ao `.env`.

**Arquivo:** `orb_api/.env`

```env
# Google AI Studio - Múltiplas Contas
GOOGLE_API_KEY="AQ.sua_chave_1,AQ.sua_chave_2"

# Modelos
PRIMARY_MODEL=gemma-4-31b-it
FALLBACK_MODEL=gemma-4-26b-it

# Speech-to-Speech (API Live)
SPEECH_MODEL=gemini-3.5-flash-live

# ASTRA API
ASTRA_API_URL=http://localhost:8000

# Neuroacoustic API
NEUROACOUSTIC_URL=http://localhost:8002

# Porta
PORT=8001
```

---

## 🧪 Como Testar a Integração

### 1. Certifique-se de que ambas as APIs estão rodando

```bash
# Terminal 1 - ASTRA_API
cd astra_api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - neuroacoustic_api
cd neuroacoustic_api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002

# Terminal 3 - orb_api
cd orb_api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 2. Teste o catálogo de presets

```bash
curl -X GET "http://localhost:8001/orb/audio/catalog"
```

### 3. Teste a geração de um tom

```bash
curl -X POST "http://localhost:8001/orb/audio/tone?frequency=432&duration=10" --output tone_432.wav
```

### 4. Teste a geração de um preset

```bash
curl -X POST "http://localhost:8001/orb/audio/preset/relaxation_alpha.yaml?format=mp3" --output relaxation_alpha.mp3
```

---

## ✅ Checklist de Integração Completa

| Item | Status |
|------|--------|
| Criar `neuroacoustic_client.py` | ✅ Feito |
| Atualizar `config.py` com `NEUROACOUSTIC_URL` | ✅ Feito |
| Atualizar `.env` com `NEUROACOUSTIC_URL` | ✅ Feito |
| Adicionar endpoints de áudio no `main.py` | ✅ Feito |
| Testar catálogo de presets | ⬜ Pendente |
| Testar geração de tom | ⬜ Pendente |
| Testar geração de binaural | ⬜ Pendente |
| Testar geração de ruído | ⬜ Pendente |
| Testar geração de preset | ⬜ Pendente |

---

## 📋 Resumo do que foi feito

Agora a `orb_api` está completamente integrada com a `neuroacoustic_api`. O fluxo ficou:

1. **Frontend (Orb)** → chama um endpoint da `orb_api` (ex: `/orb/audio/tone`)
2. **`orb_api`** → recebe a requisição e chama a `neuroacoustic_client`
3. **`neuroacoustic_client`** → faz a requisição HTTP para a `neuroacoustic_api`
4. **`neuroacoustic_api`** → gera o áudio e retorna os bytes
5. **`orb_api`** → recebe os bytes e os repassa para o frontend como um arquivo de áudio

---
