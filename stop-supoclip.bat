@echo off
chcp 65001 >nul
title Cortes Opus - Parar SupoClip
cls
echo ========================================================
echo        Cortes Opus - Parando o SupoClip
echo ========================================================
echo.

cd /d "%~dp0"

echo Parando os serviços com Docker Compose...
docker compose down
if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   [OK] Todos os serviços foram parados com sucesso!
    echo ========================================================
) else (
    echo.
    echo [AVISO] Houve um problema ao parar alguns containers.
)
echo.
echo Esta janela será fechada em instantes...
ping 127.0.0.1 -n 4 >nul
