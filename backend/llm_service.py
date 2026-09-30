"""
llm_service.py — FarmerAI LLM Engine (OpenAI-compatible)
=========================================================
Works with DeepSeek API, Ollama, or any OpenAI-compatible endpoint.

Configuration (backend/.env):
    LLM_API_KEY or DEEPSEEK_API_KEY
    LLM_BASE_URL or DEEPSEEK_BASE_URL  (e.g. http://localhost:11434/v1 for Ollama)
    LLM_MODEL or DEEPSEEK_MODEL
    LLM_PROVIDER=ollama  (optional; allows empty API key for local Ollama)
    MOCK_LLM=1  (tests only — never enable in production)
"""

import os
import json
import asyncio
import logging
from typing import AsyncGenerator
from pathlib import Path

import httpx

logger = logging.getLogger("farmerai.llm")

_env_file = Path(__file__).resolve().parent / ".env"


def reload_env():
    if _env_file.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(_env_file, override=False)
        except ImportError:
            for line in _env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())


reload_env()


def get_provider() -> str:
    prov = os.environ.get("LLM_PROVIDER", "").strip().lower()
    if prov:
        return prov
    if os.environ.get("GROQ_API_KEY", "").strip():
        return "groq"
    if os.environ.get("DEEPSEEK_API_KEY", "").strip():
        return "deepseek"
    return "openai"


def get_api_key() -> str:
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key:
        key = os.environ.get("LLM_API_KEY", "").strip()
    if not key:
        key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
    if not key and _env_file.exists():
        reload_env()
        key = (
            os.environ.get("GROQ_API_KEY", "").strip()
            or os.environ.get("LLM_API_KEY", "").strip()
            or os.environ.get("DEEPSEEK_API_KEY", "").strip()
        )
    return key


def get_base_url() -> str:
    url = os.environ.get("LLM_BASE_URL", "").strip()
    if url:
        return url.rstrip("/")
    if get_provider() == "groq" or os.environ.get("GROQ_API_KEY", "").strip():
        return "https://api.groq.com/openai"
    return os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com").strip().rstrip("/")


def get_model() -> str:
    model = os.environ.get("LLM_MODEL", "").strip()
    if model:
        return model
    if get_provider() == "groq" or os.environ.get("GROQ_API_KEY", "").strip():
        return os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b").strip()
    return os.environ.get("DEEPSEEK_MODEL", "deepseek-chat").strip()




def is_valid_api_key(key: str | None = None) -> bool:
    k = (key if key is not None else get_api_key()).strip()
    if not k:
        return False
    if k.lower() in ("your-api-key-here", "your_actual_deepseek_api_key", "sk-...", "dummy", "placeholder", "xxx"):
        return False
    return True


def is_ollama_mode() -> bool:
    provider = os.environ.get("LLM_PROVIDER", "").strip().lower()
    if provider in ("ollama", "local"):
        return True
    base = get_base_url().lower()
    return "11434" in base or "ollama" in base


def is_mock_mode() -> bool:
    return os.environ.get("MOCK_LLM", "0") in ("1", "true", "True")


def is_llm_available() -> bool:
    if is_mock_mode():
        return True
    if is_valid_api_key():
        return True
    if is_ollama_mode():
        return True
    return False


REQUEST_TIMEOUT = 60.0
STREAM_TIMEOUT = 120.0
MAX_RETRIES = 2
RETRY_DELAY = 1.0
DEFAULT_MAX_TOKENS = 1024
DEFAULT_TEMPERATURE = 0.7
DEFAULT_TOP_P = 0.9


def _headers() -> dict:
    headers = {"Content-Type": "application/json"}
    key = get_api_key()
    if is_valid_api_key(key):
        headers["Authorization"] = f"Bearer {key}"
    elif not is_ollama_mode() and not is_mock_mode():
        raise RuntimeError(
            "LLM API key is not configured or is a placeholder ('your-api-key-here'). "
            "Get your API key at https://platform.deepseek.com/api_keys and paste it into backend/.env"
        )
    return headers



def _mock_reply(messages: list[dict]) -> dict:
    user_msg = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
    mock_reply = (
        f"1. **What's happening**: Diagnosed condition observed. "
        f"Based on your inquiry: '{user_msg[:60]}...'\n"
        f"2. **Urgency**: 🟡 Soon (Take action within 48 hours)\n"
        f"3. **Steps to take**: \n"
        f"   1. Prune affected leaves.\n"
        f"   2. Ensure good air circulation.\n"
        f"   3. Avoid overhead watering.\n"
        f"4. **Prevention**: Rotate crops and inspect weekly.\n"
        f"5. **When to call an expert**: If symptoms spread to more than 20% of your plot."
    )
    return {
        "content": mock_reply,
        "finish_reason": "stop",
        "usage": {"prompt_tokens": 120, "completion_tokens": 85, "total_tokens": 205},
        "model": "mock-llm",
    }


async def chat_completion(
    messages: list[dict],
    *,
    model: str | None = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    temperature: float = DEFAULT_TEMPERATURE,
    top_p: float = DEFAULT_TOP_P,
) -> dict:
    if is_mock_mode():
        return _mock_reply(messages)

    if not is_valid_api_key() and not is_ollama_mode():
        raise RuntimeError(
            "LLM API key is not configured or is a placeholder. "
            "Set a valid DEEPSEEK_API_KEY in backend/.env or use LLM_PROVIDER=ollama"
        )

    base_url = get_base_url()
    active_model = model or get_model()
    payload = {
        "model": active_model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "stream": False,
    }

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                resp = await client.post(
                    f"{base_url}/v1/chat/completions",
                    headers=_headers(),
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()

            choice = data["choices"][0]
            usage = data.get("usage", {})
            logger.info("LLM completion model=%s tokens=%s", data.get("model"), usage.get("total_tokens"))
            return {
                "content": choice["message"]["content"],
                "finish_reason": choice.get("finish_reason", "stop"),
                "usage": usage,
                "model": data.get("model", active_model),
            }

        except httpx.HTTPStatusError as e:
            last_error = e
            if e.response.status_code in (401, 403):
                raise RuntimeError(
                    f"LLM API auth error ({e.response.status_code}): Invalid API key. "
                    f"Check your DEEPSEEK_API_KEY in backend/.env. Response: {e.response.text[:200]}"
                ) from e
            if e.response.status_code == 402:
                raise RuntimeError(
                    "DeepSeek API returned 402 Payment Required: Your DeepSeek account has an empty balance ($0.00). "
                    "To activate it, top up a small balance (e.g. $1-$2) at https://platform.deepseek.com/top_up, "
                    "or set LLM_PROVIDER=ollama in backend/.env to run locally for free."
                ) from e
            if attempt < MAX_RETRIES:
                await asyncio.sleep(RETRY_DELAY * attempt)
        except (httpx.ConnectError, httpx.ReadTimeout) as e:
            last_error = e
            if attempt < MAX_RETRIES:
                await asyncio.sleep(RETRY_DELAY * attempt)

    raise RuntimeError(f"LLM API failed after {MAX_RETRIES} attempts: {last_error}")



async def chat_completion_stream(
    messages: list[dict],
    *,
    model: str | None = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    temperature: float = DEFAULT_TEMPERATURE,
    top_p: float = DEFAULT_TOP_P,
) -> AsyncGenerator[str, None]:
    if is_mock_mode():
        mock_chunks = [
            "1. **What's happening**: Leaf spots detected.\n",
            "2. **Urgency**: 🟡 Soon.\n",
            "3. **Steps to take**: Remove infected leaves.\n",
            "4. **Prevention**: Inspect weekly.\n",
            "5. **When to call an expert**: If disease spreads rapidly.",
        ]
        for ch in mock_chunks:
            await asyncio.sleep(0.01)
            yield ch
        return

    if not is_valid_api_key() and not is_ollama_mode():
        raise RuntimeError(
            "LLM API key is not configured or is a placeholder. "
            "Set a valid DEEPSEEK_API_KEY in backend/.env or use LLM_PROVIDER=ollama"
        )


    base_url = get_base_url()
    active_model = model or get_model()
    payload = {
        "model": active_model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=STREAM_TIMEOUT) as client:
        async with client.stream(
            "POST",
            f"{base_url}/v1/chat/completions",
            headers=_headers(),
            json=payload,
        ) as response:
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 402:
                    raise RuntimeError(
                        "DeepSeek account balance is $0.00 (HTTP 402 Payment Required). "
                        "Top up at https://platform.deepseek.com/top_up or use LLM_PROVIDER=ollama for local free LLM."
                    ) from e
                if e.response.status_code in (401, 403):
                    raise RuntimeError(f"DeepSeek auth error ({e.response.status_code}). Check your DEEPSEEK_API_KEY.") from e
                raise

            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data_str = line[6:]
                if data_str.strip() == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_str)
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content")
                    if content:
                        yield content
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


def build_messages(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
) -> list[dict]:
    msgs = [{"role": "system", "content": system_prompt}]
    if history:
        for turn in history[-20:]:
            role = turn.get("role", "user")
            if role not in ("user", "assistant"):
                role = "user"
            msgs.append({"role": role, "content": turn.get("content", "")})
    msgs.append({"role": "user", "content": user_message})
    return msgs
