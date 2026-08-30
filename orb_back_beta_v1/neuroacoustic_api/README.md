
---

## 📄 `TODO.md` (COMPLETO)

```markdown
# TODO - Neuroacoustic API

## FASE 0: ESTRUTURA E AMBIENTE

### 0.1. Criar Estrutura de Pastas
- [x] Criar pasta `neuroacoustic_api`
- [x] Criar subpastas: `app`, `presets`, `tests`
- [x] Criar arquivos: `main.py`, `config.py`, `generator.py`, `catalog.py`, `models.py`
- [x] Criar `pyproject.toml`, `.env`, `README.md`, `TODO.md`

### 0.2. Configurar Ambiente Virtual
```bash
cd "C:\Users\aline\OneDrive\Documentos\Orb System - Teste"
.venv\Scripts\activate
cd neuroacoustic_api
pip install -e .
```

- [x] Instalar dependências: `fastapi`, `uvicorn`, `python-dotenv`, `binaural-generator`, `numpy`, `soundfile`, `PyYAML`, `pydantic`, `pydub`, `scipy`

---

## FASE 1: MODELOS E CONFIGURAÇÃO

### 1.1. Criar `app/models.py`
- [x] `ToneRequest`: frequency, duration, volume, waveform (sine/square/sawtooth/triangle), format (wav/mp3)
- [x] `BinauralRequest`: left_frequency, right_frequency, duration, volume, waveform, format
- [x] `NoiseRequest`: noise_type (white/pink/brown/blue/violet/grey/rain/ocean), duration, volume, format
- [x] `PresetRequest`: preset_id, duration, format

### 1.2. Criar `app/config.py`
- [x] Configurações de ambiente: HOST, PORT, SAMPLE_RATE, DEFAULT_FORMAT, DEFAULT_VOLUME
- [x] Caminho para a pasta de presets: `PRESETS_DIR`

---

## FASE 2: CATÁLOGO DE PRESETS

### 2.1. Criar `app/catalog.py`
- [x] Carregar todos os presets YAML da pasta `presets/`
- [x] Extrair título, steps, duração, ruído de fundo
- [x] Método `list_presets()` com metadados
- [x] Método `get_preset(preset_id)` com detalhes

### 2.2. Copiar Presets da Biblioteca
```bash
copy "..\.venv\Lib\site-packages\binaural_generator\scripts\*.yaml" "presets\"
```

- [x] Copiar todos os presets disponíveis na biblioteca

---

## FASE 3: GERADOR DE ÁUDIO

### 3.1. Criar `app/generator.py`
- [x] `generate_tone()`: Sine, Square, Sawtooth, Triangle
- [x] `generate_binaural()`: Left/Right Frequency com forma de onda
- [x] `generate_noise()`: White, Pink, Brown, Blue, Violet, Grey, Rain, Ocean
- [x] `generate_preset()`: Gerar a partir de preset YAML
- [x] `_save_audio()`: Suporte a WAV e MP3

### 3.2. Dependências
- [x] `numpy` para cálculos de áudio
- [x] `soundfile` para salvar WAV
- [x] `pydub` para converter para MP3
- [x] `scipy` para filtros de ruído
- [x] `binaural-generator` para presets

---

## FASE 4: API FASTAPI

### 4.1. Criar `app/main.py`
- [x] `GET /catalog` - Lista todos os presets
- [x] `GET /catalog/{preset_id}` - Detalhes de um preset
- [x] `POST /generate/tone` - Gera tom puro
- [x] `POST /generate/binaural` - Gera binaural
- [x] `POST /generate/noise` - Gera ruído
- [x] `POST /generate/preset/{preset_id}` - Gera a partir de preset
- [x] `GET /health` - Health check
- [x] `GET /` - Root com lista de endpoints

### 4.2. Configurar Swagger
- [x] Documentação automática via FastAPI
- [x] Acessível em: `http://localhost:8002/docs`

---

## FASE 5: TESTES

### 5.1. Criar `tests/test_neuroacoustic.py`
- [x] `test_catalog_list` - Verifica listagem de presets
- [x] `test_generate_tone_sine` - Gera tom sine
- [x] `test_generate_binaural` - Gera binaural
- [x] `test_generate_noise` - Gera ruído branco
- [x] `test_health` - Verifica health check

### 5.2. Executar Testes
```bash
pytest tests/test_neuroacoustic.py -v
```

- [x] **5 testes passando** ✅

---

## FASE 6: INTEGRAÇÃO COM O ECOSSISTEMA

### 6.1. Conectar com a ORB_API
- [ ] Adicionar `NEUROACOUSTIC_URL` no `.env` da ORB_API
- [ ] Criar cliente HTTP na ORB_API para chamar a neuroacoustic_api
- [ ] Adicionar endpoints na ORB_API que redirecionam para a neuroacoustic_api (com máscara Stage)

### 6.2. Conectar com a ASTRA (Admin)
- [ ] Adicionar rota no ASTRA para testar a neuroacoustic_api diretamente (sem máscaras)

---

## FASE 7: DEPLOY E DOCUMENTAÇÃO

### 7.1. Documentação
- [x] README.md com instruções de uso
- [x] ENDPOINTS.md com todos os endpoints
- [x] TODO.md com o checklist

### 7.2. Deploy
- [ ] Subir para o GitHub
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Publicar no Railway/Render (quando for para produção)

---

## COMANDOS ÚTEIS

### Rodar a API
```bash
cd neuroacoustic_api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

### Rodar os Testes
```bash
pytest tests/test_neuroacoustic.py -v
```

### Acessar o Swagger
```
http://localhost:8002/docs
```

### Exemplos de Teste via cURL

```bash
# Tom puro (Sine, 432Hz, 60s, WAV)
curl -X POST "http://localhost:8002/generate/tone" -H "Content-Type: application/json" -d '{"frequency": 432, "duration": 60, "waveform": "sine"}' --output tone_432.wav

# Tom puro (Square, 528Hz, 30s, MP3)
curl -X POST "http://localhost:8002/generate/tone" -H "Content-Type: application/json" -d '{"frequency": 528, "duration": 30, "waveform": "square", "format": "mp3"}' --output tone_528.mp3

# Binaural (Theta: 200Hz L, 208Hz R, 60s)
curl -X POST "http://localhost:8002/generate/binaural" -H "Content-Type: application/json" -d '{"left_frequency": 200, "right_frequency": 208, "duration": 60}' --output binaural_theta.wav

# Ruído Branco
curl -X POST "http://localhost:8002/generate/noise" -H "Content-Type: application/json" -d '{"noise_type": "white", "duration": 60}' --output white_noise.wav

# Listar Presets
curl -X GET "http://localhost:8002/catalog"
```
```

---

## 📄 `ENDPOINTS.md` (COMPLETO)

```markdown
# Neuroacoustic API - Endpoints

## Base URL
```
http://localhost:8002
```

## Autenticação
Nenhuma autenticação necessária (ambiente local).

---

## 1. Catálogo de Presets

### 1.1. Listar todos os presets

**GET** `/catalog`

**Resposta:**
```json
{
  "presets": [
    {
      "id": "focus_beta.yaml",
      "title": "Focus (Beta)",
      "duration": 1800,
      "has_noise": false,
      "steps_count": 3
    },
    {
      "id": "relaxation_alpha.yaml",
      "title": "Relaxation (Alpha)",
      "duration": 1200,
      "has_noise": false,
      "steps_count": 2
    }
  ]
}
```

### 1.2. Detalhes de um preset

**GET** `/catalog/{preset_id}`

**Exemplo:** `/catalog/relaxation_alpha.yaml`

**Resposta:**
```json
{
  "id": "relaxation_alpha.yaml",
  "title": "Relaxation (Alpha)",
  "config": {
    "title": "Relaxation (Alpha)",
    "base_frequency": 100,
    "sample_rate": 44100,
    "output_filename": "audio/relaxation_alpha.flac",
    "steps": [...]
  },
  "steps": [...],
  "background_noise": null,
  "duration": 1200
}
```

---

## 2. Geração de Áudio

### 2.1. Gerar Tom Puro

**POST** `/generate/tone`

**Body:**
```json
{
  "frequency": 432,
  "duration": 60,
  "volume": 0.5,
  "waveform": "sine",
  "format": "wav"
}
```

**Parâmetros:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `frequency` | int | 432 | Frequência em Hz (20-20000) |
| `duration` | int | 60 | Duração em segundos |
| `volume` | float | 0.5 | Volume (0.0 a 1.0) |
| `waveform` | string | "sine" | `sine`, `square`, `sawtooth`, `triangle` |
| `format` | string | "wav" | `wav` ou `mp3` |

**Resposta:** Arquivo de áudio (WAV ou MP3)

---

### 2.2. Gerar Binaural

**POST** `/generate/binaural`

**Body:**
```json
{
  "left_frequency": 200,
  "right_frequency": 208,
  "duration": 60,
  "volume": 0.5,
  "waveform": "sine",
  "format": "wav"
}
```

**Parâmetros:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `left_frequency` | int | 200 | Frequência do ouvido esquerdo (Hz) |
| `right_frequency` | int | 208 | Frequência do ouvido direito (Hz) |
| `duration` | int | 60 | Duração em segundos |
| `volume` | float | 0.5 | Volume (0.0 a 1.0) |
| `waveform` | string | "sine" | `sine`, `square`, `sawtooth`, `triangle` |
| `format` | string | "wav" | `wav` ou `mp3` |

**Resposta:** Arquivo de áudio (WAV ou MP3)

**Diferença de frequência (Left - Right) e estado cerebral:**

| Diferença | Estado | Uso |
|-----------|--------|-----|
| 0.5-4 Hz | Delta | Sono profundo |
| 4-8 Hz | Theta | Meditação, criatividade |
| 8-12 Hz | Alpha | Relaxamento, calma |
| 12-30 Hz | Beta | Foco, alerta |
| 30-100 Hz | Gamma | Concentração intensa |

---

### 2.3. Gerar Ruído

**POST** `/generate/noise`

**Body:**
```json
{
  "noise_type": "white",
  "duration": 60,
  "volume": 0.3,
  "format": "wav"
}
```

**Parâmetros:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `noise_type` | string | "white" | `white`, `pink`, `brown`, `blue`, `violet`, `grey`, `rain`, `ocean` |
| `duration` | int | 60 | Duração em segundos |
| `volume` | float | 0.3 | Volume (0.0 a 1.0) |
| `format` | string | "wav" | `wav` ou `mp3` |

**Resposta:** Arquivo de áudio (WAV ou MP3)

---

### 2.4. Gerar a partir de Preset

**POST** `/generate/preset/{preset_id}`

**Parâmetros Query:**
| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `format` | string | "wav" | `wav` ou `mp3` |

**Exemplo:** `/generate/preset/relaxation_alpha.yaml?format=mp3`

**Resposta:** Arquivo de áudio (WAV ou MP3)

---

## 3. Health Check

### 3.1. Verificar status da API

**GET** `/health`

**Resposta:**
```json
{
  "status": "OK",
  "service": "neuroacoustic-api"
}
```

---

## 4. Root

### 4.1. Listar todos os endpoints

**GET** `/`

**Resposta:**
```json
{
  "service": "Neuroacoustic API",
  "version": "0.1.0",
  "endpoints": {
    "catalog": "/catalog",
    "preset_details": "/catalog/{preset_id}",
    "generate_tone": "/generate/tone",
    "generate_binaural": "/generate/binaural",
    "generate_noise": "/generate/noise",
    "generate_preset": "/generate/preset/{preset_id}"
  }
}
```

---

## Exemplos Práticos

### Listar todos os presets disponíveis
```bash
curl -X GET "http://localhost:8002/catalog"
```

### Gerar tom de 432Hz em MP3
```bash
curl -X POST "http://localhost:8002/generate/tone" \
  -H "Content-Type: application/json" \
  -d '{"frequency": 432, "duration": 30, "format": "mp3"}' \
  --output tone_432.mp3
```

### Gerar binaural Theta (200/208Hz)
```bash
curl -X POST "http://localhost:8002/generate/binaural" \
  -H "Content-Type: application/json" \
  -d '{"left_frequency": 200, "right_frequency": 208, "duration": 60}' \
  --output binaural_theta.wav
```

### Gerar ruído rosa
```bash
curl -X POST "http://localhost:8002/generate/noise" \
  -H "Content-Type: application/json" \
  -d '{"noise_type": "pink", "duration": 60}' \
  --output pink_noise.wav
```

### Gerar preset de relaxamento em MP3
```bash
curl -X POST "http://localhost:8002/generate/preset/relaxation_alpha.yaml?format=mp3" \
  --output relaxation_alpha.mp3
```

---

## Erros Comuns

| Status | Código | Descrição |
|--------|--------|-----------|
| 404 | `Preset não encontrado` | O preset_id não existe no catálogo |
| 422 | `Validation Error` | Campos obrigatórios faltando ou inválidos |
| 500 | `Internal Server Error` | Erro na geração do áudio |

---

## Swagger UI

A documentação interativa está disponível em:
```
http://localhost:8002/docs
```
```

---

## 📁 ESTRUTURA FINAL

```
neuroacoustic_api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── generator.py
│   ├── catalog.py
│   └── models.py
├── presets/
│   ├── creativity_blue.yaml
│   ├── creativity_theta.yaml
│   ├── focus_beta.yaml
│   ├── focus_gamma.yaml
│   ├── focus_violet.yaml
│   ├── lucid_dreaming.yaml
│   ├── lucid_dream_pink_noise.yaml
│   ├── meditation_theta.yaml
│   ├── migraine_relief.yaml
│   ├── relaxation_alpha.yaml
│   ├── relaxation_grey.yaml
│   ├── relaxation_ocean.yaml
│   ├── relaxation_rain.yaml
│   └── sleep_delta.yaml
├── tests/
│   ├── __init__.py
│   └── test_neuroacoustic.py
├── .env
├── pyproject.toml
├── pytest.ini
├── README.md
├── TODO.md
└── ENDPOINTS.md
```

---

Com a `neuroacoustic_api` concluída e testada, o próximo passo lógico é **integrá-la ao seu ecossistema**, conectando-a à `orb_api` e, futuramente, ao frontend. Isso criará um sistema unificado onde o Orb (Stage) pode oferecer a experiência enigmática e o Astra (Admin) pode acessar todos os dados brutos.

## Roteiro de Integração e Próximos Passos

### Fase 1: Conectar a `neuroacoustic_api` à `orb_api`

A `orb_api` será o orquestrador central. Ela precisará de um cliente para se comunicar com a sua nova API de áudio.

**1.1. Atualizar o `.env` da `orb_api`**

Adicione a URL da sua nova API ao arquivo `.env` da `orb_api`:
```env
# ... outras variáveis ...
NEUROACOUSTIC_URL=http://localhost:8002
```

**1.2. Criar um Cliente na `orb_api`**

Crie um novo arquivo `orb_api/app/neuroacoustic_client.py`. Ele será o responsável por fazer as requisições HTTP para a `neuroacoustic_api`.

```python
# orb_api/app/neuroacoustic_client.py
import httpx
from app.config import config

NEUROACOUSTIC_URL = config.NEUROACOUSTIC_URL

async def generate_tone(frequency: int, duration: int = 60, waveform: str = "sine", format: str = "wav"):
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
        return response.content  # Retorna os bytes do áudio

# Funções semelhantes para generate_binaural, generate_noise, generate_preset
```

**1.3. Atualizar o `config.py` da `orb_api`**

```python
# orb_api/app/config.py
# ... (código existente) ...
NEUROACOUSTIC_URL = os.getenv("NEUROACOUSTIC_URL", "http://localhost:8002")
```

**1.4. Adicionar Endpoints "Mascarados" na `orb_api`**

Agora, crie endpoints na `orb_api` que serão consumidos pelo frontend. Eles chamarão a `neuroacoustic_api` por trás dos panos, mas devolverão a resposta com a "mística" do Orb, sem revelar a fonte técnica.

```python
# orb_api/app/main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import Response
from app.neuroacoustic_client import generate_tone as neuro_generate_tone

# ... (código existente) ...

@app.post("/orb/audio/tone")
async def orb_generate_tone(
    frequency: int = Query(..., description="Frequência em Hz (ex: 432)"),
    duration: int = Query(60, description="Duração em segundos"),
):
    """
    Gera um tom puro para o usuário. A resposta é um arquivo de áudio.
    """
    try:
        # 1. (Opcional) Buscar contexto astrológico do usuário para "justificar" a frequência
        # contexto = await buscar_contexto_para_frequencia(user_id, frequency)

        # 2. Chamar a neuroacoustic_api (sem máscaras)
        audio_bytes = await neuro_generate_tone(frequency=frequency, duration=duration)

        # 3. Retornar o áudio diretamente para o usuário
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... (endpoints similares para binaural e ruído) ...
```

### Fase 2: Integrar com o Astra (Admin)

No app Astra (Admin), você deve consumir a `neuroacoustic_api` diretamente, sem nenhuma máscara, para visualizar e testar todas as funcionalidades.

**2.1. Criar um Serviço no Astra**

No frontend do Astra (React Native), crie um serviço que se comunica diretamente com a `neuroacoustic_api`. A URL base será `http://localhost:8002`.

```typescript
// astra-app/src/services/neuroacousticApi.ts
import axios from 'axios';

const API_URL = 'http://localhost:8002';

export const neuroacousticApi = {
  // Sem máscaras: retorna o áudio bruto e o catálogo completo
  getCatalog: async () => {
    const response = await axios.get(`${API_URL}/catalog`);
    return response.data;
  },
  generateTone: async (params: any) => {
    const response = await axios.post(`${API_URL}/generate/tone`, params, {
      responseType: 'blob', // Para receber o áudio como blob
    });
    return response.data;
  },
  // ... funções para binaural, ruído, etc.
};
```

**2.2. Criar a Tela de Teste de Áudio no Astra**

Crie uma tela no Astra onde você pode:
- Ver a lista de presets disponíveis
- Selecionar um preset e ouvir o áudio
- Testar a geração de tons puros com parâmetros customizados (frequência, forma de onda, etc.)
- Testar a geração de ruídos e binaurais

### Fase 3: Conectar ao Frontend Público (Orb)

No app Orb (público), a interação com o áudio deve ser envolta em uma experiência mais suave e "misteriosa".

**3.1. Consumir os Endpoints Mascarados da `orb_api`**

Em vez de chamar a `neuroacoustic_api` diretamente, o app Orb chamará os endpoints da `orb_api` que criamos na Fase 1 (ex: `/orb/audio/tone`). Isso centraliza a lógica e mantém o backend como a única fonte de verdade.

**3.2. Player de Áudio no Frontend**

Implemente um player de áudio simples no app Orb. Quando o usuário selecionar uma "frequência" ou "ambiente sonoro", o app fará uma requisição para a `orb_api`, receberá o arquivo de áudio (WAV ou MP3) e o reproduzirá.

**3.3. Interface do Usuário**

Na interface do Orb, em vez de mostrar "Frequência: 432Hz, Forma de Onda: Sine", use nomes mais sugestivos. Por exemplo:
- Tom puro 432Hz: "Sintonia de Equilíbrio"
- Binaural Theta: "Onda de Criatividade"
- Ruído Rosa: "Chuva Constante"

Mapeie esses nomes para os parâmetros técnicos no backend da `orb_api`, mantendo a interface do usuário limpa e alinhada com a proposta do produto.

### Resumo do Próximo Passo

Seu foco agora deve ser:
1.  **Conectar a `neuroacoustic_api` à `orb_api`** como descrito na Fase 1. Isso unifica o backend e prepara o terreno para o frontend.
2.  **Criar um player de áudio simples** no seu frontend (React Native) para testar a reprodução dos arquivos gerados, seja chamando a `orb_api` (público) ou a `neuroacoustic_api` diretamente (admin).

