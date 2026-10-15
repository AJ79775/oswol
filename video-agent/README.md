# Oswol Daily Brief — video agent

Every morning this agent reads the day's Oswol newsletter and publishes a narrated, chaptered
explainer video in the Oswol look: calm slate background, ivory type, champagne and cyan accents,
the Oswol mark. **No music, no faces, no people, animals or other living things, no stock footage.**
Only typography, data tiles, charts, diagrams and the brand motif.

```
newsletter ──► storyboard ──► fact-check ──► voice ──► motion graphics ──► MP4 + captions ──► /var/www/oswol-videos
 (Oswol API,    (FreeLLMAPI,    (every number   (one fixed   (HTML/SVG scenes,     (chapters, SRT/VTT,    (gallery, feeds,
  URL, RSS,      auto:smart)     must exist in   Kokoro       rendered frame-by-     -16 LUFS voice,        latest.mp4)
  file, IMAP)                    the source)     voice)       frame in Chromium)     thumbnail)
```

## What a video contains

| Scene | What it shows | Driven by |
|---|---|---|
| Cold open | Headline revealed word by word, why it matters, regime chip, the ring-and-bars motif drawing in | newsletter title + summary |
| Today's brief | Numbered chapter list, estimated watch time | sections |
| Market overview | Index tiles with counting numbers, direction meters, an "AI READ" takeaway | overview section |
| Top movers | Diverging bar chart, gainers vs decliners, bars grow as each name is spoken | movers section |
| Why it moved | Cause → mechanism → effect diagram (diagram-design rules), each node lights up as it is explained | LLM, from the newsletter's own reasoning |
| Smart money | Disclosure rows with GOV/INS/FUND badges and **filing-delay** chips | smart-money section |
| Social narratives | Velocity bars, tone and hype-risk chips, **noise** warning | social section |
| Macro calendar | Timeline of events with impact dots and the backdrop beside it | macro section |
| The number to watch | One big figure with plain-language meaning | LLM |
| Live check (optional) | Live crypto / FX snapshot labelled with source and time | CoinGecko, Frankfurter, FRED |
| Keep in mind | Data delays, uncertainty | section warnings |
| Recap | Three takeaways | LLM / template |
| Outro | "Signal over noise.", oswol.com, full disclaimer | Oswol compliance text |

Captions are burned in (and also embedded as a soft subtitle track and written as SRT/VTT). Every
item on screen appears at the moment the narrator says it: each sentence is voiced separately,
and items are matched to the sentence that mentions them.

## Trust by design

* **Grounding.** Every number in the narration or on screen must appear in the newsletter (or the
  labelled live snapshot). Unverified figures go back to the model with a repair request. Anything
  still unverified is removed before rendering.
* **No advice.** Oswol's `FORBIDDEN_PHRASES` (from `src/lib/compliance/financialSafety.ts`) and
  spoken variants are stripped. Every video ends with "This is not investment advice" and the
  Oswol disclaimer.
* **Demo data** is announced by the narrator and badged on every frame.
* **Always ships.** If FreeLLMAPI is down, a deterministic template script is built from the
  sections, so the day still gets a (simpler) video.

## Install on the VPS

```bash
git clone https://github.com/AJ79775/oswol.git && cd oswol/video-agent
sudo ./install.sh --time 07:30 --tz Asia/Riyadh --nginx-snippet
sudo nano /etc/oswol-video/env        # set LLM_API_KEY (FreeLLMAPI unified key) and NEWSLETTER_*
sudo systemctl start oswol-video      # make today's video now
journalctl -u oswol-video -f          # watch it
```

`install.sh` creates its own `oswol-video` user and folders and touches nothing else:

| Path | Contents |
|---|---|
| `/opt/oswol-video` | code, Python venv, headless Chromium, Kokoro voice model |
| `/etc/oswol-video/env` | settings (see `.env.example`) |
| `/var/lib/oswol-video` | per-day working folders, `memory.sqlite` |
| `/var/www/oswol-videos` | the published library (below) |

Upgrade later with `git pull && sudo ./install.sh` (settings are kept).

### Where videos are stored

```
/var/www/oswol-videos/
├── index.html                 gallery (newest first, Oswol styling, phone friendly)
├── latest.mp4 / latest.jpg    always the newest video
├── feed.xml / feed.json       RSS + JSON Feed with video enclosures
└── 2026/10/15/
    ├── index.html             player, clickable chapters, full transcript, downloads
    ├── oswol-daily-2026-10-15.mp4   1080p H.264, AAC voice, soft subtitles, chapter markers
    ├── oswol-daily-2026-10-15.srt / .vtt
    ├── thumb.jpg  script.md  storyboard.json  newsletter.json  meta.json
```

Serve it at `https://oswol.com/videos/` by adding `include /etc/nginx/snippets/oswol-videos.conf;`
to the oswol.com server block, or use a subdomain with `sudo ./install.sh --nginx-site videos.oswol.com`.
Basic-auth lines are in both nginx files if the library should stay private.

## Everyday commands

`install.sh` adds an `oswol-video` command that runs as the service user (run it as root or with sudo):

```bash
oswol-video doctor                                   # check LLM, voice, Chromium, storage, source
oswol-video run                                      # make today's video now
oswol-video run --force                              # rebuild today's video
oswol-video run --file ~/oswol-2026-10-14.md --date 2026-10-14 --force   # a saved issue (any older date)
oswol-video run --file ~/issue.md --storyboard ~/script.json             # render a hand-edited script (still fact-checked)
oswol-video preview --file ~/issue.md                # one PNG per scene, no video (fast review)
oswol-video voices --sample /tmp/voice.wav --voice am_michael
```

`--file` accepts the newsletter as plain text pasted from the email (ALL-CAPS section labels such as
EARNINGS or QUICK HITS are recognised), Markdown, HTML or JSON. The issue date comes from `--date`,
then a date in the file name, then a date in the text, and otherwise today. The live crypto/FX
snapshot is only added for today's issue.

## Choosing the newsletter source

The default posts to the Oswol app (`/api/ai/newsletter`, the same shape as `mcp/newsletter_server.py`).
If the published newsletter lives elsewhere, set one of these:

* `NEWSLETTER_SOURCE=url` with `NEWSLETTER_URL=https://oswol.com/newsletter/today` (HTML or JSON; HTML is cleaned up automatically)
* `NEWSLETTER_SOURCE=rss` with a feed URL
* `NEWSLETTER_SOURCE=imap` to read the newest newsletter email from a mailbox
* `NEWSLETTER_SOURCE=file` for a file your newsletter job drops on disk

`NEWSLETTER_REQUIRE_TODAY=1` plus `NEWSLETTER_WAIT_MINUTES=120` makes the agent wait for today's issue.

## The voice

One fixed narrator every day: **Kokoro-82M `af_heart`**, a warm, natural female voice. It runs
locally on the CPU (about 2× real time), costs nothing, and is deterministic, so the voice is
identical day to day. Change it with `TTS_VOICE` (`am_michael`, `bf_emma`, `bm_george` …) and preview
first with `voices --sample`. Other engines: `voicestudio` (VoiceStudio server, fixed profile and seed),
`edge` (Microsoft neural voices, needs internet), `openai` (any `/v1/audio/speech`, e.g. FreeLLMAPI).
`TTS_FALLBACK` is empty on purpose, so the voice never silently changes.

## How the provided repositories are used

| Repository | Role here | Status |
|---|---|---|
| **FreeLLMAPI** (already on the VPS) | Writes the storyboard and narration through its OpenAI-compatible `/v1` (`auto:smart`, then `auto`) and repairs fact-check failures. The routed provider is logged from `X-Routed-Via`. | Core |
| **debpalash/VoiceStudio** | Optional narrator engine (`TTS_ENGINE=voicestudio`, `deploy/voicestudio/docker-compose.yml`). The default Kokoro voice needs no extra service. | Optional |
| **latent-spaces/brag** | Its craft rules shaped the renderer: every frame a pure function of time; durations driven by the voice; fast-in then hold, with readable dwell; dip-through-background transitions instead of muddy crossfades; a settled poster frame as the thumbnail; every name and number grounded in the source. Its music and SFX are deliberately not used. | Ideas |
| **cathrynlavery/diagram-design** | Rules for "Why it moved" diagrams: at most 6 nodes, a left-to-right causal chain, orthogonal connectors with r=8 elbows, short uppercase edge labels on an opaque mask, borders instead of shadows, arrows drawn under boxes, 1–2 focal nodes. Oswol's own palette and fonts take precedence over its defaults. | Rules |
| **harry0703/MoneyPrinterTurbo** | Pattern reference for TTS, subtitle timing and assembly. Its stock-footage step conflicts with "no life on screen", so it is replaced by brand motion graphics. | Ideas |
| **public-apis/public-apis** | Source list for the optional live snapshot: CoinGecko and Frankfurter (no key), FRED (free key). | Optional |
| **volcengine/OpenViking** | Optional semantic memory of past briefs (`OPENVIKING_URL`, `deploy/openviking/`). SQLite memory is always on. | Optional |
| **NVIDIA-NeMo/Switchyard** | Optional router in front of FreeLLMAPI (`deploy/switchyard/routes.toml`). Off by default because FreeLLMAPI's `auto:*` routing already covers this pipeline. | Optional |
| **storytold/photocraft** | Optional thumbnail sharpen via `photocraft-cli run … filter.sharpen.unsharpMask` when `PHOTOCRAFT_BIN` is set. Pillow does the same by default. | Optional |

Also used: Kokoro-82M (Apache-2.0) for the voice, Playwright + Chromium for frame capture, ffmpeg for
encoding and loudness, and the Sora, Geist and JetBrains Mono fonts (SIL OFL), bundled locally.

## Performance (4 vCPU reference)

Voice takes about 0.5 s per spoken second. Rendering runs at about 6 frames/s per worker, so a
5-minute video takes about 10–15 minutes with `RENDER_WORKERS=2`. It runs at low priority
(`Nice=10`, `CPUWeight=40`) so the Oswol app and FreeLLMAPI stay responsive. Each video is about
25–40 MB.

## Development

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt pytest
.venv/bin/python -m pytest -q tests
KOKORO_MODEL_DIR=./models WORK_DIR=./runs VIDEO_ROOT=./out .venv/bin/python -m oswol_video run --file samples/oswol-demo-newsletter.json --no-llm
```

Scene templates live in `oswol_video/render/static/` (`scenes.js`, `oswol.css`). The page is a pure
function of time: `OSV.mount(i)` builds scene *i*, and `OSV.seek(t)` poses it.
