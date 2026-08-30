# TODO - Orb API

- [ ] Adicionar suporte a múltiplas contas do Google AI Studio (fallback automático)
- [ ] Implementar rate limiting para evitar estouro do RPD
- [ ] Adicionar cache de respostas para perguntas frequentes
- [ ] Criar sistema de logging para monitorar uso da IA
- [ ] Integrar com o astra_api para usar dados astrológicos

---
# Ative o ambiente virtual da raiz
cd "C:\Users\aline\OneDrive\Documentos\Orb System - Teste"
.venv\Scripts\activate

# Verifique se está usando o Python correto
python --version  # Deve mostrar Python 3.11.x

- Dependencies:
pip install fastapi uvicorn python-dotenv google-generativeai httpx

- Run:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

- Acces:
Swagger UI (para testar os endpoints): http://localhost:8001/docs

Redoc (documentação alternativa): http://localhost:8001/redoc

Health check: http://localhost:8001/health

---
## Estrutura do Projeto
