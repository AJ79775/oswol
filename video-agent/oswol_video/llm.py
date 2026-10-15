"""OpenAI-compatible chat client for FreeLLMAPI (or Switchyard in front of it).

FreeLLMAPI already fails over across free providers; on top of that we walk a
short list of model aliases (e.g. "auto:smart,auto") and retry on bad JSON.
"""
from __future__ import annotations

import json
import logging
import re
import time
from dataclasses import dataclass

from openai import OpenAI

from .config import Settings

log = logging.getLogger(__name__)


@dataclass
class LLMReply:
    text: str
    model: str
    routed_via: str = ""


class LLMClient:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = OpenAI(base_url=settings.llm_base_url, api_key=settings.llm_api_key or "not-set",
                             timeout=settings.llm_timeout, max_retries=1)

    def chat(self, system: str, user: str, *, json_mode: bool = True, temperature: float | None = None,
             max_tokens: int = 6000) -> LLMReply:
        last_error: Exception | None = None
        temp = self.settings.llm_temperature if temperature is None else temperature
        for model in self.settings.llm_models:
            for attempt in range(2):
                kwargs = dict(model=model, temperature=temp, max_tokens=max_tokens,
                              messages=[{"role": "system", "content": system}, {"role": "user", "content": user}])
                if json_mode and attempt == 0:
                    kwargs["response_format"] = {"type": "json_object"}
                try:
                    raw = self.client.chat.completions.with_raw_response.create(**kwargs)
                    resp = raw.parse()
                    text = (resp.choices[0].message.content or "").strip()
                    if not text:
                        raise RuntimeError("empty completion")
                    routed = raw.headers.get("x-routed-via", "")
                    log.info("LLM reply from %s%s (%d chars)", resp.model or model,
                             f" via {routed}" if routed else "", len(text))
                    return LLMReply(text=text, model=resp.model or model, routed_via=routed)
                except Exception as exc:  # noqa: BLE001 - provider errors vary widely
                    last_error = exc
                    log.warning("LLM call failed (model=%s, attempt=%d): %s", model, attempt + 1, exc)
                    time.sleep(2 + attempt * 3)
        raise RuntimeError(f"All LLM attempts failed: {last_error}")

    def ping(self) -> str:
        models = self.client.models.list()
        return ", ".join(m.id for m in list(models)[:8])


def extract_json(text: str) -> dict:
    """Pull the first JSON object out of an LLM reply, tolerating fences and trailing commas."""
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.M)
    start = cleaned.find("{")
    if start < 0:
        raise ValueError("no JSON object in reply")
    depth, in_str, esc = 0, False, False
    end = -1
    for i, ch in enumerate(cleaned[start:], start=start):
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    blob = cleaned[start:end + 1] if end > 0 else cleaned[start:]
    try:
        return json.loads(blob)
    except json.JSONDecodeError:
        repaired = re.sub(r",\s*([}\]])", r"\1", blob)
        repaired = repaired.replace("“", '"').replace("”", '"')
        return json.loads(repaired)
