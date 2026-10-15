"""Runtime settings, read from environment variables.

Values are loaded (in order, first wins) from the real environment, then
/etc/oswol-video/env, then a local .env file next to the package.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = PACKAGE_DIR.parent

for candidate in (Path("/etc/oswol-video/env"), PROJECT_DIR / ".env"):
    if candidate.is_file():
        load_dotenv(candidate, override=False)

# install.sh puts Chromium here; the systemd unit sets this too, but manual runs should just work.
if not os.environ.get("PLAYWRIGHT_BROWSERS_PATH") and Path("/opt/oswol-video/browsers").is_dir():
    os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "/opt/oswol-video/browsers"


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None or raw.strip() == "":
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    try:
        return int(_env(name, str(default)))
    except ValueError:
        return default


def _float(name: str, default: float) -> float:
    try:
        return float(_env(name, str(default)))
    except ValueError:
        return default


def _list(name: str, default: str) -> list[str]:
    return [p.strip() for p in _env(name, default).split(",") if p.strip()]


@dataclass
class Settings:
    # --- Newsletter source -------------------------------------------------
    # oswol_api : POST to the Oswol app's /api/ai/newsletter (JSON)
    # url       : any web page / JSON endpoint holding the day's newsletter
    # rss       : newest item of an RSS/Atom feed
    # file      : a local .json / .md / .html / .txt file
    # imap      : newest email from NEWSLETTER_IMAP_FROM in a mailbox
    source: str = field(default_factory=lambda: _env("NEWSLETTER_SOURCE", "oswol_api"))
    source_url: str = field(default_factory=lambda: _env("NEWSLETTER_URL", "http://127.0.0.1:3000/api/ai/newsletter"))
    source_file: str = field(default_factory=lambda: _env("NEWSLETTER_FILE"))
    source_headers: str = field(default_factory=lambda: _env("NEWSLETTER_HEADERS"))  # "K: V; K2: V2"
    oswol_api_key: str = field(default_factory=lambda: _env("OSWOL_API_KEY"))
    imap_host: str = field(default_factory=lambda: _env("NEWSLETTER_IMAP_HOST"))
    imap_user: str = field(default_factory=lambda: _env("NEWSLETTER_IMAP_USER"))
    imap_password: str = field(default_factory=lambda: _env("NEWSLETTER_IMAP_PASSWORD"))
    imap_from: str = field(default_factory=lambda: _env("NEWSLETTER_IMAP_FROM"))
    imap_folder: str = field(default_factory=lambda: _env("NEWSLETTER_IMAP_FOLDER", "INBOX"))
    require_today: bool = field(default_factory=lambda: _bool("NEWSLETTER_REQUIRE_TODAY", False))
    # Force the issue date (YYYY-MM-DD), e.g. when making a video for an older newsletter.
    date_override: str = field(default_factory=lambda: _env("BRIEF_DATE"))

    # --- LLM (FreeLLMAPI, optionally fronted by Switchyard) ------------------
    llm_base_url: str = field(default_factory=lambda: _env("LLM_BASE_URL", "http://127.0.0.1:3001/v1"))
    llm_api_key: str = field(default_factory=lambda: _env("LLM_API_KEY", "not-set"))
    llm_models: list[str] = field(default_factory=lambda: _list("LLM_MODELS", "auto:smart,auto"))
    llm_timeout: float = field(default_factory=lambda: _float("LLM_TIMEOUT", 180.0))
    llm_temperature: float = field(default_factory=lambda: _float("LLM_TEMPERATURE", 0.4))
    llm_enabled: bool = field(default_factory=lambda: _bool("LLM_ENABLED", True))

    # --- Script shape ----------------------------------------------------------
    target_minutes: float = field(default_factory=lambda: _float("TARGET_MINUTES", 5.0))
    words_per_minute: int = field(default_factory=lambda: _int("WORDS_PER_MINUTE", 150))
    language: str = field(default_factory=lambda: _env("BRIEF_LANGUAGE", "en"))
    timezone: str = field(default_factory=lambda: _env("BRIEF_TIMEZONE", ""))

    # --- Voice (one fixed narrator) ------------------------------------------
    tts_engine: str = field(default_factory=lambda: _env("TTS_ENGINE", "kokoro"))  # kokoro|voicestudio|edge|openai
    tts_voice: str = field(default_factory=lambda: _env("TTS_VOICE", "af_heart"))
    tts_speed: float = field(default_factory=lambda: _float("TTS_SPEED", 0.96))
    tts_fallback: str = field(default_factory=lambda: _env("TTS_FALLBACK", ""))  # empty = never switch voice
    kokoro_model_dir: str = field(default_factory=lambda: _env("KOKORO_MODEL_DIR", "/opt/oswol-video/models"))
    voicestudio_url: str = field(default_factory=lambda: _env("VOICESTUDIO_URL", "http://127.0.0.1:3900"))
    voicestudio_engine: str = field(default_factory=lambda: _env("VOICESTUDIO_ENGINE", "kokoro"))
    edge_voice: str = field(default_factory=lambda: _env("EDGE_VOICE", "en-US-AndrewNeural"))
    openai_tts_model: str = field(default_factory=lambda: _env("OPENAI_TTS_MODEL", "tts-1"))
    sentence_pause: float = field(default_factory=lambda: _float("SENTENCE_PAUSE", 0.32))

    # --- Memory (OpenViking) and live enrichment (public APIs) -----------------
    openviking_url: str = field(default_factory=lambda: _env("OPENVIKING_URL"))
    openviking_api_key: str = field(default_factory=lambda: _env("OPENVIKING_API_KEY"))
    memory_days: int = field(default_factory=lambda: _int("MEMORY_DAYS", 5))
    enrich_live_data: bool = field(default_factory=lambda: _bool("ENRICH_LIVE_DATA", True))

    # --- Video -----------------------------------------------------------------
    width: int = field(default_factory=lambda: _int("VIDEO_WIDTH", 1920))
    height: int = field(default_factory=lambda: _int("VIDEO_HEIGHT", 1080))
    fps: int = field(default_factory=lambda: _int("VIDEO_FPS", 30))
    crf: int = field(default_factory=lambda: _int("VIDEO_CRF", 20))
    render_workers: int = field(default_factory=lambda: _int("RENDER_WORKERS", max(1, (os.cpu_count() or 2) - 1)))
    burn_captions: bool = field(default_factory=lambda: _bool("BURN_CAPTIONS", True))
    chromium_path: str = field(default_factory=lambda: _env("CHROMIUM_PATH"))

    # --- Storage / publishing ----------------------------------------------------
    work_dir: Path = field(default_factory=lambda: Path(_env("WORK_DIR", "/var/lib/oswol-video/runs")))
    video_root: Path = field(default_factory=lambda: Path(_env("VIDEO_ROOT", "/var/www/oswol-videos")))
    public_base_url: str = field(default_factory=lambda: _env("PUBLIC_BASE_URL", "/videos").rstrip("/"))
    keep_days: int = field(default_factory=lambda: _int("KEEP_DAYS", 0))  # 0 = keep forever
    notify_webhook: str = field(default_factory=lambda: _env("NOTIFY_WEBHOOK_URL"))

    def ensure_dirs(self) -> None:
        self.work_dir.mkdir(parents=True, exist_ok=True)
        self.video_root.mkdir(parents=True, exist_ok=True)


def load_settings(**overrides) -> Settings:
    s = Settings()
    for key, value in overrides.items():
        if value is not None:
            setattr(s, key, value)
    return s
