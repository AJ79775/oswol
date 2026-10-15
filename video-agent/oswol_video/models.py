"""Data models shared by every pipeline stage."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Section(BaseModel):
    id: str = ""
    title: str
    content: str
    warning: Optional[str] = None


class Newsletter(BaseModel):
    """A normalized daily newsletter, whatever source it came from."""

    title: str
    date: str  # ISO yyyy-mm-dd
    summary: str = ""
    sections: list[Section] = Field(default_factory=list)
    disclaimer: str = ""
    source_url: str = ""
    is_demo: bool = False
    raw_text: str = ""

    def full_text(self) -> str:
        parts = [self.title, self.summary]
        for s in self.sections:
            parts += [s.title, s.content, s.warning or ""]
        parts.append(self.raw_text)
        return "\n".join(p for p in parts if p)


# ---------------------------------------------------------------------------
# Storyboard: what the LLM writes and the renderer draws.
# ---------------------------------------------------------------------------

SceneType = Literal[
    "cold_open", "agenda", "overview", "movers", "flow", "bullets", "disclosures",
    "narratives", "calendar", "stat", "caution", "recap", "live_data", "outro",
]


class _Lenient(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)


class Tile(_Lenient):
    label: str
    value: str = ""
    change_pct: Optional[float] = None
    note: str = ""


class Mover(_Lenient):
    symbol: str
    name: str = ""
    change_pct: float


class FlowNode(_Lenient):
    id: str
    label: str
    kind: Literal["cause", "mechanism", "effect", "risk", "neutral"] = "neutral"
    detail: str = ""

    @field_validator("kind", mode="before")
    @classmethod
    def _kind(cls, v):
        v = str(v or "neutral").lower()
        return v if v in {"cause", "mechanism", "effect", "risk", "neutral"} else "neutral"


class FlowEdge(_Lenient):
    source: str = Field(alias="from")
    target: str = Field(alias="to")
    label: str = ""


class Disclosure(_Lenient):
    who: str
    role: str = ""
    action: str = ""
    asset: str = ""
    size: str = ""
    delay_days: Optional[int] = None


class Narrative(_Lenient):
    name: str
    velocity: Optional[float] = None
    mentions: str = ""
    tone: str = "neutral"
    hype_risk: str = ""


class CalEvent(_Lenient):
    when: str
    event: str
    detail: str = ""
    impact: str = "med"


class Stat(_Lenient):
    value: str
    label: str = ""
    context: str = ""


class Scene(_Lenient):
    type: SceneType
    narration: str = ""
    chapter: str = ""
    title: str = ""
    kicker: str = ""
    headline: str = ""
    subtitle: str = ""
    regime: Optional[str] = None
    tiles: list[Tile] = Field(default_factory=list)
    gainers: list[Mover] = Field(default_factory=list)
    losers: list[Mover] = Field(default_factory=list)
    nodes: list[FlowNode] = Field(default_factory=list)
    edges: list[FlowEdge] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)
    disclosures: list[Disclosure] = Field(default_factory=list)
    narratives: list[Narrative] = Field(default_factory=list)
    events: list[CalEvent] = Field(default_factory=list)
    stat: Optional[Stat] = None
    warning: str = ""
    sources: list[str] = Field(default_factory=list)


class Storyboard(_Lenient):
    title: str
    date: str
    regime: Optional[str] = None
    summary: str = ""
    scenes: list[Scene]
    generated_by: str = "llm"  # llm | fallback
    model: str = ""


# ---------------------------------------------------------------------------
# Timing produced by the voice stage, consumed by the renderer.
# ---------------------------------------------------------------------------


class Cue(BaseModel):
    start: float  # seconds, relative to the scene start
    end: float
    text: str  # sentence as displayed (not the speech-normalized form)


class SceneTiming(BaseModel):
    index: int
    duration: float
    audio_path: str
    cues: list[Cue]
