# Ative o ambiente virtual
cd "C:\Users\aline\OneDrive\Documentos\Orb System - Teste"
.venv\Scripts\activate

# Entre na pasta da orb_api
cd orb_api

# Instale as dependências de desenvolvimento
pip install pytest pytest-cov black mypy

# Rode todos os testes
pytest tests/ -v

# Rode com cobertura
pytest tests/ --cov=app --cov-report=term-missing

# Rode uma categoria específica
pytest tests/test_chat.py -v
pytest tests/test_speech.py -v
pytest tests/test_data.py -v
pytest tests/test_svg.py -v
pytest tests/test_admin.py -v
pytest tests/test_router.py -v