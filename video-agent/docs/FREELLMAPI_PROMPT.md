# The FreeLLMAPI prompt for Oswol Daily Brief videos

FreeLLMAPI does one job in the pipeline: it writes the **storyboard**, meaning the scenes, what the
narrator says and the short text on screen. Everything visual is fixed by the renderer and never
depends on the model:

| Decided by the renderer (always the same) | Decided by FreeLLMAPI (every day) |
|---|---|
| Oswol logo, the "oswol · DAILY BRIEF" header, the date | Which scenes, in which order, under which chapters |
| Dark slate background, ivory/champagne/cyan palette, Sora · Geist · JetBrains Mono | Narration: every word the voice says |
| Ring-and-bars brand motif, captions, progress bar, transitions | Tile labels and values, diagram nodes and arrows, bullets |
| Fixed narrator voice (Kokoro `af_heart`), −16 LUFS audio | Explanations of jargon, why it matters, what to watch |
| No music, no faces, no people or living things, no stock footage | The recap and the one-line summary |

## Where the prompt lives

| File | What it is |
|---|---|
| `oswol_video/prompts/storyboard_system.md` | **The system prompt**: brand, what the screen shows, hard rules, voice-writing rules, on-screen limits, every scene type, the scene plan for the Oswol issue layout, output format and a self-check list |
| `oswol_video/prompts/example_storyboard.json` | A worked example (8 scenes from the 2026-10-14 issue) appended to the system prompt, so the model sees the expected depth and style |
| `storyboard.py → _user_prompt()` | The user message: target length, the video date, and the day's newsletter as JSON, plus earlier briefs and live data when available |

Edit the two files directly; the next run picks up the change, with no restart or reinstall. To try
a variant without touching the defaults, add this to `/etc/oswol-video/env`:

```
PROMPT_FILE=/var/lib/oswol-video/my-prompt.md
PROMPT_EXAMPLE_FILE=/var/lib/oswol-video/my-example.json
PROMPT_EXAMPLE=0        # drop the example for models with a small context window
```

Size: about 6,500 input tokens (instructions about 2,800, example about 1,400, newsletter about
2,300), plus about 3,000–4,500 output tokens.

## Test it in seconds (no rendering)

```bash
# 1. Ask FreeLLMAPI for a storyboard only and print a scene list
oswol-video script --file ~/oswol-2026-10-14.md --date 2026-10-14 --dump-prompt /tmp/prompt.txt

#    "script by: llm  model: …" means FreeLLMAPI wrote it. "fallback" means every attempt failed
#    (check LLM_API_KEY / LLM_BASE_URL). Fact-check removals appear as WARNING lines.

# 2. Read or edit the draft it saved, then render exactly that draft
oswol-video run --file ~/oswol-2026-10-14.md --storyboard /var/lib/oswol-video/runs/2026-10-14/storyboard-draft.json --force
```

`/tmp/prompt.txt` holds the exact system prompt and user message. You can paste them into the
FreeLLMAPI dashboard's Playground to compare models side by side.

## Every safety net around the prompt

1. JSON mode is requested; invalid or truncated JSON is retried up to 3 times, then the next model in
   `LLM_MODELS` is tried.
2. Every number in the storyboard is checked against the newsletter. Unsupported numbers are sent
   back to the model for a repair round (up to 2), and whatever is still unsupported is removed.
3. Oswol's forbidden-advice phrases are removed; the outro always ends with "This is not investment
   advice."
4. If FreeLLMAPI is unavailable, a built-in template script is used, so a video still ships every day.

## Tuning tips

* **Model choice.** `LLM_MODELS=auto:smart,auto` lets the router pick its strongest healthy free
  model. FreeLLMAPI's virtual `fusion` model sends the prompt to several models and has a judge merge
  the drafts. It is slower but often better: `LLM_MODELS=fusion,auto:smart`.
* **Length.** `TARGET_MINUTES=5` is about 750 words. Detailed issues with four stories naturally run 6–7
  minutes, and the prompt allows that.
* **Temperature.** `LLM_TEMPERATURE=0.4` (0.3–0.5 works best: lower is more literal, higher is livelier).
* **Model quality.** If a model keeps inventing numbers, the logs show many fact-check repairs. Move it
  down your FreeLLMAPI fallback chain.
* **House style.** To change the house style (for example, always open with the market regime, or
  always point out what a story means for GCC investors when the newsletter covers it), edit section 4
  or 7 of `storyboard_system.md`. The narrator voice is English-only, so keep the narration in English. Keep the JSON format in
  section 8 unchanged: the renderer depends on it.
