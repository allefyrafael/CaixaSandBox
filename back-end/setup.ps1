# Script de Setup do Backend JuniBox
# Execute como: .\setup.ps1

Write-Host "Junibox Backend - Setup Automatico" -ForegroundColor Cyan
Write-Host ""

# Verifica se está na pasta correta
if (!(Test-Path "main.py")) {
    Write-Host "[ERRO] Execute este script na pasta back-end/" -ForegroundColor Red
    exit 1
}

# Verifica versão do Python
Write-Host "Verificando Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host "   $pythonVersion" -ForegroundColor Gray

if ($pythonVersion -match "3\.14") {
    Write-Host "[AVISO] Python 3.14 pode ter problemas de compatibilidade" -ForegroundColor Yellow
    Write-Host "   Recomendamos Python 3.11 ou 3.12" -ForegroundColor Yellow
    Write-Host ""
}

# Cria ambiente virtual
Write-Host "Criando ambiente virtual..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   Removendo venv antigo..." -ForegroundColor Gray
    Remove-Item -Recurse -Force venv -ErrorAction SilentlyContinue
}

python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Erro ao criar ambiente virtual" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Ambiente virtual criado" -ForegroundColor Green

# Ativa ambiente virtual
Write-Host "Ativando ambiente virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "   [OK] Ambiente ativado" -ForegroundColor Green

# Atualiza pip
Write-Host "Atualizando pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "   [OK] Pip atualizado" -ForegroundColor Green

# Instala dependências
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar alguns minutos)" -ForegroundColor Gray
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Erro ao instalar dependencias" -ForegroundColor Red
    Write-Host ""
    Write-Host "Dica: Tente:" -ForegroundColor Yellow
    Write-Host "   1. Fechar todos os terminais" -ForegroundColor Gray
    Write-Host "   2. Usar Python 3.11 ou 3.12" -ForegroundColor Gray
    Write-Host "   3. Ver documentos/README.md para mais detalhes" -ForegroundColor Gray
    exit 1
}
Write-Host "   [OK] Dependencias instaladas" -ForegroundColor Green

# Verifica .env
Write-Host ""
Write-Host "Verificando configuracao..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "   [AVISO] Arquivo .env nao encontrado" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   [OK] Arquivo .env criado a partir do .env.example" -ForegroundColor Green
        Write-Host "   [IMPORTANTE] Edite o .env e adicione suas chaves!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [OK] Arquivo .env encontrado" -ForegroundColor Green
}

# Verifica Firebase
if (!(Test-Path "firebase_credentials.json")) {
    Write-Host "   [AVISO] firebase_credentials.json nao encontrado" -ForegroundColor Yellow
    Write-Host "      Baixe do Firebase Console e coloque aqui" -ForegroundColor Gray
    Write-Host "      (Opcional - chat simplificado funciona sem Firebase)" -ForegroundColor Gray
} else {
    Write-Host "   [OK] Credenciais do Firebase encontradas" -ForegroundColor Green
}

# Teste rápido
Write-Host ""
Write-Host "Testando instalacao..." -ForegroundColor Yellow
$testFile = "test_imports_temp.py"
$testContent = "try:`n    import fastapi`n    import firebase_admin`n    import groq`n    print('OK')`nexcept Exception:`n    print('ERROR')"
$testContent | Out-File -FilePath $testFile -Encoding utf8 -NoNewline
$result = python $testFile 2>$null
Remove-Item $testFile -ErrorAction SilentlyContinue
if ($result -match "OK") {
    Write-Host "   [OK] Todos os modulos importados com sucesso" -ForegroundColor Green
} else {
    Write-Host "   [AVISO] Alguns modulos podem ter problemas" -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "[OK] Setup concluido!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "   1. Configure o .env com suas chaves" -ForegroundColor White
Write-Host "      - GROQ_API_KEY (obtenha em https://console.groq.com/)" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Adicione firebase_credentials.json (opcional)" -ForegroundColor White
Write-Host "      - Baixe do Firebase Console" -ForegroundColor Gray
Write-Host "      - O chat simplificado funciona sem Firebase!" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Rode o servidor:" -ForegroundColor White
Write-Host "      uvicorn main:app --reload" -ForegroundColor Cyan
Write-Host ""
Write-Host "   4. Acesse a documentacao:" -ForegroundColor White
Write-Host "      http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

