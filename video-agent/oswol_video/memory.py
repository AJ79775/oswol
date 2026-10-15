"""Continuity memory: what earlier briefs said, so today's video can connect the dots.

Always keeps a local SQLite log. If OPENVIKING_URL is set, every brief is also
written to OpenViking (viking://resources/oswol-daily/YYYY-MM-DD.md) and
semantic search there adds related older briefs (e.g. the last time Nvidia led).
OpenViking is optional: any error is logged and the pipeline carries on.
"""
from __future__ import annotations

import json
import logging
import sqlite3
from pathlib import Path

import httpx

from .config import Settings
from .models import Newsletter, Storyboard

log = logging.getLogger(__name__)

OV_ROOT = "viking://resources/oswol-daily/"


class LocalMemory:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path))
        self.db.execute("""CREATE TABLE IF NOT EXISTS briefs (date TEXT PRIMARY KEY, title TEXT, summary TEXT,
                           regime TEXT, takeaways TEXT, video_url TEXT)""")

    def recent(self, before: str, n: int) -> list[dict]:
        rows = self.db.execute("SELECT date, title, summary, regime, takeaways FROM briefs WHERE date < ? "
                               "ORDER BY date DESC LIMIT ?", (before, n)).fetchall()
        return [{"date": r[0], "title": r[1], "summary": r[2], "regime": r[3], "takeaways": json.loads(r[4] or "[]")}
                for r in rows]

    def save(self, board: Storyboard, video_url: str = "") -> None:
        recap = next((s.bullets for s in board.scenes if s.type == "recap"), [])
        self.db.execute("INSERT OR REPLACE INTO briefs VALUES (?,?,?,?,?,?)",
                        (board.date, board.title, board.summary, board.regime or "", json.dumps(recap), video_url))
        self.db.commit()


class OpenVikingMemory:
    def __init__(self, settings: Settings):
        self.base = settings.openviking_url.rstrip("/")
        self.headers = {"Authorization": f"Bearer {settings.openviking_api_key}"} if settings.openviking_api_key else {}

    def _post(self, path: str, body: dict) -> dict:
        r = httpx.post(self.base + path, json=body, headers=self.headers, timeout=60)
        r.raise_for_status()
        return r.json() if r.content else {}

    def save(self, nl: Newsletter, board: Storyboard) -> None:
        recap = next((s.bullets for s in board.scenes if s.type == "recap"), [])
        doc = [f"# Oswol Daily Brief — {nl.date}", f"## {board.title}", "", board.summary, "",
               f"Regime: {board.regime or 'n/a'}", "", "## Takeaways", *[f"- {t}" for t in recap], "", "## Newsletter"]
        for s in nl.sections:
            doc += [f"### {s.title}", s.content, f"> {s.warning}" if s.warning else ""]
        try:
            self._post("/api/v1/fs/mkdir", {"uri": OV_ROOT})
        except httpx.HTTPError:
            pass  # usually "already exists"
        self._post("/api/v1/content/write", {"uri": f"{OV_ROOT}{nl.date}.md", "content": "\n".join(doc),
                                              "mode": "replace", "wait": False})

    def related(self, nl: Newsletter, limit: int = 4) -> list[str]:
        query = f"{nl.title}. {nl.summary}"[:500]
        data = self._post("/api/v1/search/find", {"query": query, "target_uri": OV_ROOT, "limit": limit})
        result = data.get("result") if isinstance(data, dict) else None
        hits = []
        if isinstance(result, dict):
            for key in ("resources", "memories", "results"):
                for item in result.get(key) or []:
                    uri = item.get("uri", "")
                    if nl.date in uri:
                        continue  # today's own brief
                    snippet = item.get("abstract") or item.get("snippet") or item.get("preview") or ""
                    if snippet:
                        hits.append(f"[{uri.rsplit('/', 1)[-1].removesuffix('.md')}] {snippet.strip()[:400]}")
        return hits[:limit]


class Memory:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.local = LocalMemory(settings.work_dir.parent / "memory.sqlite")
        self.ov = OpenVikingMemory(settings) if settings.openviking_url else None

    def context_for(self, nl: Newsletter) -> str:
        lines = []
        for b in self.local.recent(nl.date, self.settings.memory_days):
            take = "; ".join(b["takeaways"][:3])
            lines.append(f"[{b['date']}] {b['title']} (regime: {b['regime'] or 'n/a'}). {take}")
        if self.ov:
            try:
                lines += [f"related: {h}" for h in self.ov.related(nl)]
            except Exception as exc:  # noqa: BLE001
                log.warning("OpenViking recall skipped: %s", exc)
        return "\n".join(lines)

    def remember(self, nl: Newsletter, board: Storyboard, video_url: str) -> None:
        self.local.save(board, video_url)
        if self.ov:
            try:
                self.ov.save(nl, board)
                log.info("Stored brief in OpenViking")
            except Exception as exc:  # noqa: BLE001
                log.warning("OpenViking store skipped: %s", exc)
