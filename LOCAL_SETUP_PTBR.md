# SupoClip - Execução 100% Local (Cortes Opus)

Este projeto está configurado para rodar **100% localmente**, sem depender de nenhuma API externa paga (sem OpenAI, AssemblyAI, Anthropic ou Google).

---

## 🛠 Requisitos

1. **Docker Desktop** (com suporte a WSL2 no Windows).
2. **Ollama** instalado e rodando no host:
   ```bash
   ollama pull qwen2.5:7b
   ```

---

## 🚀 Como Iniciar

1. Copie o template local para `.env`:
   ```bash
   cp .env.local.example .env
   ```

2. Certifique-se de que o **Ollama** e o **Docker Desktop** estão rodando.

3. Suba os containers:
   ```bash
   docker compose up -d
   ```

4. Acesse a interface web:
   👉 **http://localhost:3107**

---

## 📊 Como Acompanhar os Logs

- Ver logs de processamento de vídeos (Whisper e Ollama):
  ```bash
  docker compose logs -f worker
  ```

- Ver logs de todos os containers:
  ```bash
  docker compose logs -f
  ```

---

## 🛑 Como Parar

```bash
docker compose down
```

---

## ⚙️ Arquitetura Local

- **Frontend:** Next.js rodando na porta `3107`.
- **Backend:** FastAPI rodando na porta `8000`.
- **Worker:** Processa filas Arq/Redis com FFmpeg, OpenCV e Whisper.
- **Transcrição:** OpenAI Whisper (`medium`) executando localmente via CPU/PyTorch.
- **Análise & Seleção de Clipes:** Ollama (`qwen2.5:7b`) rodando via GPU na máquina host através de `http://host.docker.internal:11434/v1`.
