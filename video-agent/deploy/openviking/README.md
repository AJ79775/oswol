# Optional: OpenViking memory

Without OpenViking the agent still remembers past briefs in a local SQLite file
(`/var/lib/oswol-video/memory.sqlite`) and mentions continuity when it helps.
OpenViking adds *semantic* recall ("the last time Nvidia led the movers") across
the whole archive.

```bash
uv tool install openviking            # or use the Docker image ghcr.io/volcengine/openviking:latest
mkdir -p ~/.openviking && cp ov.conf ~/.openviking/ov.conf   # edit model ids / keys first
openviking-server                     # listens on 127.0.0.1:1933
```

Then in `/etc/oswol-video/env`:

```
OPENVIKING_URL=http://127.0.0.1:1933
OPENVIKING_API_KEY=change-me-openviking-key
```

Each published brief is written to `viking://resources/oswol-daily/YYYY-MM-DD.md`.
OpenViking is AGPL-3.0; running it unmodified as a local service is fine. Every
OpenViking call is best-effort: if it is down, the video is still produced.
