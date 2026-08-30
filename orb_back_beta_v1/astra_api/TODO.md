# TODO

- Add string normalizer (e.g., "Tropic", "TrOpical" -> "Tropical")

---
# Ative o ambiente virtual da raiz
cd "system"
.venv\Scripts\activate

# Verifique se está usando o Python correto
python --version  # Deve mostrar Python 3.11.x


- Dependencies:
pip install fastapi uvicorn pydantic pydantic-settings starlette pytz scour typing-extensions pyjwt kerykeion

- Run:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

- Acces:
Swagger UI (para testar os endpoints): http://localhost:8000/docs

Redoc (documentação alternativa): http://localhost:8000/redoc

Health check (se tiver): http://localhost:8000/health