@echo off
chcp 65001 >nul
title Cortes Opus - SupoClip Local Launcher
cls
echo ========================================================
echo        Cortes Opus - SupoClip 100%% Local
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo       Docker Desktop não está rodando. Iniciando...
    if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    ) else (
        start "" "Docker Desktop"
    )
    echo       Aguardando o serviço do Docker ficar pronto...
    :wait_docker
    ping 127.0.0.1 -n 3 >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 goto wait_docker
    echo       [OK] Docker Desktop está rodando!
) else (
    echo       [OK] Docker Desktop já está rodando.
)
echo.

echo [2/4] Verificando Ollama...
curl.exe -s http://127.0.0.1:11434 >nul 2>&1
if %errorlevel% neq 0 (
    echo       Ollama não está rodando. Iniciando...
    if exist "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe" (
        start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"
    ) else (
        start "" ollama serve
    )
    echo       Aguardando o Ollama ficar pronto...
    :wait_ollama
    ping 127.0.0.1 -n 3 >nul
    curl.exe -s http://127.0.0.1:11434 >nul 2>&1
    if %errorlevel% neq 0 goto wait_ollama
    echo       [OK] Ollama está rodando!
) else (
    echo       [OK] Ollama já está rodando.
)
echo.

echo [3/4] Iniciando os containers do SupoClip (Docker Compose)...
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Ocorreu uma falha ao subir os serviços no Docker Compose.
    pause
    exit /b 1
)
echo       [OK] Containers iniciados.
echo.

echo [4/4] Aguardando o site responder em http://localhost:3107...
:wait_site
curl.exe -s -f http://localhost:3107 >nul 2>&1
if %errorlevel% neq 0 (
    ping 127.0.0.1 -n 3 >nul
    goto wait_site
)
echo       [OK] Site online e pronto!
echo.

echo ========================================================
echo   Abrindo o SupoClip no navegador: http://localhost:3107
echo ========================================================
start http://localhost:3107
echo.
echo SupoClip está em execução!
echo Para encerrar, execute stop-supoclip.bat
ping 127.0.0.1 -n 4 >nul
