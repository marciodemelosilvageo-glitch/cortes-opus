@echo off
chcp 65001 >nul
title Cortes Opus - SupoClip Local Launcher
cls
echo ========================================================
echo        Cortes Opus - SupoClip 100%% Local
echo ========================================================
echo.

cd /d "%~dp0"

:: ---------------------------------------------------------
:: 1. VERIFICAR / INICIAR DOCKER DESKTOP
:: ---------------------------------------------------------
echo [1/4] Verificando Docker Desktop...
docker info >nul 2>&1
if %errorlevel% equ 0 goto docker_ok

echo       Docker Desktop não está rodando. Iniciando...
if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
    start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
)
if exist "%ProgramFiles%\Docker\Docker\resources\com.docker.backend.exe" (
    start "" "%ProgramFiles%\Docker\Docker\resources\com.docker.backend.exe"
)

echo       Aguardando o serviço do Docker inicializar (pode levar alguns segundos)...
set /a DOCKER_RETRY=0

:wait_docker
ping 127.0.0.1 -n 3 >nul
docker info >nul 2>&1
if %errorlevel% equ 0 goto docker_ok

set /a DOCKER_RETRY+=1
if %DOCKER_RETRY% geq 40 (
    echo.
    echo [ERRO] O Docker Desktop demorou muito para responder.
    echo Por favor, abra o Docker Desktop manualmente pelo menu Iniciar e tente novamente.
    echo.
    pause
    exit /b 1
)
goto wait_docker

:docker_ok
echo       [OK] Docker Desktop está rodando!
echo.

:: ---------------------------------------------------------
:: 2. VERIFICAR / INICIAR OLLAMA
:: ---------------------------------------------------------
echo [2/4] Verificando Ollama...
curl.exe -s http://127.0.0.1:11434 >nul 2>&1
if %errorlevel% equ 0 goto ollama_ok

echo       Ollama não está rodando. Iniciando...
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe" (
    start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"
) else (
    start "" ollama serve
)

echo       Aguardando o Ollama inicializar...
set /a OLLAMA_RETRY=0

:wait_ollama
ping 127.0.0.1 -n 3 >nul
curl.exe -s http://127.0.0.1:11434 >nul 2>&1
if %errorlevel% equ 0 goto ollama_ok

set /a OLLAMA_RETRY+=1
if %OLLAMA_RETRY% geq 20 (
    echo.
    echo [AVISO] Ollama demorou para responder na porta 11434.
    echo Continuando com a inicializacao...
    goto ollama_cont
)
goto wait_ollama

:ollama_ok
echo       [OK] Ollama está rodando!
:ollama_cont
echo.

:: ---------------------------------------------------------
:: 3. SUBIR OS CONTAINERS COM DOCKER COMPOSE
:: ---------------------------------------------------------
echo [3/4] Iniciando os containers do SupoClip (Docker Compose)...
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao subir os containers com docker compose.
    echo Verifique se o Docker Desktop está aberto e tente novamente.
    echo.
    pause
    exit /b 1
)
echo       [OK] Containers iniciados com sucesso!
echo.

:: ---------------------------------------------------------
:: 4. AGUARDAR O SITE RESPONDER E ABRIR NO NAVEGADOR
:: ---------------------------------------------------------
echo [4/4] Aguardando o site carregar em http://localhost:3107...
set /a SITE_RETRY=0

:wait_site
curl.exe -s -f http://localhost:3107 >nul 2>&1
if %errorlevel% equ 0 goto site_ok

ping 127.0.0.1 -n 3 >nul
set /a SITE_RETRY+=1
if %SITE_RETRY% geq 45 (
    echo.
    echo [AVISO] O site ainda está iniciando em segundo plano.
    echo Tentando abrir http://localhost:3107 mesmo assim...
    goto site_open
)
goto wait_site

:site_ok
echo       [OK] SupoClip está online e respondendo!
echo.

:site_open
echo ========================================================
echo   Abrindo o SupoClip no navegador: http://localhost:3107
echo ========================================================
start http://localhost:3107
echo.
echo O SupoClip está em execução no seu computador.
echo Para fechar a aplicação, use o arquivo stop-supoclip.bat.
echo.
echo Esta janela pode ser minimizada ou fechada.
pause
