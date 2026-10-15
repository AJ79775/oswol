#!/usr/bin/env bash
# Oswol Daily Brief video agent — installer for Ubuntu 22.04 / 24.04 (Hostinger KVM VPS).
#
#   sudo ./install.sh                         # install / upgrade, daily run at 07:30 server time
#   sudo ./install.sh --time 06:45 --tz Asia/Riyadh
#   sudo ./install.sh --nginx-snippet         # also install the /videos/ nginx snippet (you include it)
#   sudo ./install.sh --nginx-site videos.oswol.com   # or a standalone nginx site for a subdomain
#
# Everything lives in its own user and folders; the Oswol app and FreeLLMAPI are not touched.
#   code+venv : /opt/oswol-video        settings : /etc/oswol-video/env
#   work/runs : /var/lib/oswol-video    videos   : /var/www/oswol-videos
set -euo pipefail

RUN_TIME="07:30"; RUN_TZ=""; NGINX_SNIPPET=0; NGINX_SITE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --time) RUN_TIME="$2"; shift 2 ;;
    --tz) RUN_TZ="$2"; shift 2 ;;
    --nginx-snippet) NGINX_SNIPPET=1; shift ;;
    --nginx-site) NGINX_SITE="$2"; shift 2 ;;
    -h|--help) sed -n 2,12p "$0"; exit 0 ;;
    *) echo "Unknown option $1"; exit 1 ;;
  esac
done
[ "$(id -u)" -eq 0 ] || { echo "Run as root (sudo ./install.sh)"; exit 1; }
SRC="$(cd "$(dirname "$0")" && pwd)"
APP=/opt/oswol-video; ETC=/etc/oswol-video; VAR=/var/lib/oswol-video; WWW=/var/www/oswol-videos
say() { printf "\n\033[1;33m▸ %s\033[0m\n" "$*"; }

say "System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip ffmpeg curl rsync ca-certificates >/dev/null

say "Service user and folders"
id oswol-video >/dev/null 2>&1 || useradd --system --home "$VAR" --shell /usr/sbin/nologin oswol-video
mkdir -p "$APP" "$ETC" "$VAR/runs" "$WWW"
chown -R oswol-video:oswol-video "$VAR" "$WWW"
chmod 755 "$WWW"

say "Application code"
rsync -a --delete --exclude .venv --exclude __pycache__ --exclude tests "$SRC/" "$APP/app/"
python3 -m venv "$APP/venv"
"$APP/venv/bin/pip" install -q --upgrade pip
"$APP/venv/bin/pip" install -q -r "$APP/app/requirements.txt"

say "Headless Chromium for rendering"
PLAYWRIGHT_BROWSERS_PATH="$APP/browsers" "$APP/venv/bin/python" -m playwright install --with-deps chromium >/dev/null

say "Narrator voice model (Kokoro-82M, ~330 MB)"
"$APP/app/scripts/get-models.sh" "$APP/models"

say "Settings"
if [ ! -f "$ETC/env" ]; then
  cp "$APP/app/.env.example" "$ETC/env"
  echo "  Created $ETC/env — set LLM_API_KEY (FreeLLMAPI unified key) and NEWSLETTER_* there."
else
  echo "  Keeping existing $ETC/env"
fi
chown root:oswol-video "$ETC/env"; chmod 640 "$ETC/env"
chmod -R a+rX "$APP"

say "oswol-video command"
mkdir -p "$VAR/inbox" && chown oswol-video:oswol-video "$VAR/inbox"
cat > /usr/local/bin/oswol-video <<'WRAP'
#!/usr/bin/env bash
# Run the Oswol video agent as its service user, for example:
#   oswol-video doctor
#   oswol-video run --file ~/oswol-2026-10-14.md --date 2026-10-14 --force
[ "$(id -u)" -eq 0 ] || exec sudo "$0" "$@"
INBOX=/var/lib/oswol-video/inbox
args=()
while [ $# -gt 0 ]; do
  case "$1" in
    --file|--storyboard)
      src="$2"
      if [ -f "$src" ]; then  # copy so the service user can read it (files in /root are private)
        dst="$INBOX/$(basename "$src")"
        [ "$(realpath "$src")" = "$(realpath -m "$dst")" ] || install -m 644 -o oswol-video -g oswol-video "$src" "$dst"
        src="$dst"
      fi
      args+=("$1" "$src"); shift 2 ;;
    *) args+=("$1"); shift ;;
  esac
done
cd /opt/oswol-video/app && exec runuser -u oswol-video -- env PLAYWRIGHT_BROWSERS_PATH=/opt/oswol-video/browsers \
  /opt/oswol-video/venv/bin/python -m oswol_video "${args[@]}"
WRAP
chmod 755 /usr/local/bin/oswol-video

say "Daily schedule (systemd timer)"
install -m 644 "$APP/app/deploy/systemd/oswol-video.service" /etc/systemd/system/oswol-video.service
CAL="*-*-* ${RUN_TIME}:00${RUN_TZ:+ $RUN_TZ}"
sed "s|^OnCalendar=.*|OnCalendar=${CAL}|" "$APP/app/deploy/systemd/oswol-video.timer" > /etc/systemd/system/oswol-video.timer
systemctl daemon-reload
systemctl enable --now oswol-video.timer >/dev/null
systemctl list-timers oswol-video.timer --no-pager | head -3

if [ "$NGINX_SNIPPET" = 1 ] || [ -n "$NGINX_SITE" ]; then
  say "nginx"
  command -v nginx >/dev/null || apt-get install -y -qq nginx >/dev/null
  if [ "$NGINX_SNIPPET" = 1 ]; then
    install -m 644 "$APP/app/deploy/nginx/oswol-videos-location.conf" /etc/nginx/snippets/oswol-videos.conf
    echo "  Installed /etc/nginx/snippets/oswol-videos.conf."
    echo "  Add 'include /etc/nginx/snippets/oswol-videos.conf;' inside your oswol.com server { } block, then:"
    echo "  sudo nginx -t && sudo systemctl reload nginx"
  fi
  if [ -n "$NGINX_SITE" ]; then
    sed "s/videos.oswol.com/${NGINX_SITE}/g" "$APP/app/deploy/nginx/oswol-videos-subdomain.conf" > "/etc/nginx/sites-available/oswol-videos"
    ln -sf /etc/nginx/sites-available/oswol-videos /etc/nginx/sites-enabled/oswol-videos
    nginx -t && systemctl reload nginx
    sed -i 's|^PUBLIC_BASE_URL=.*|PUBLIC_BASE_URL=|' "$ETC/env"
    echo "  Site ${NGINX_SITE} enabled. For HTTPS: sudo certbot --nginx -d ${NGINX_SITE}"
  fi
fi

say "Self-check"
# The app reads /etc/oswol-video/env itself; just run it as the service user from the app folder.
/usr/local/bin/oswol-video doctor || echo "  (fix the ✘ items in $ETC/env, then run: oswol-video doctor)"
/usr/local/bin/oswol-video gallery >/dev/null || true

cat <<EOF

Done.
  Edit settings ........ sudo nano $ETC/env
  Check everything ..... oswol-video doctor
  Make a video now ..... oswol-video run            (or: sudo systemctl start oswol-video)
  From a saved issue ... oswol-video run --file ~/oswol-2026-10-14.md --date 2026-10-14 --force
  Logs of daily runs ... journalctl -u oswol-video -f
  Next scheduled run ... systemctl list-timers oswol-video.timer
  Videos ............... $WWW   (gallery: index.html, newest: latest.mp4)
EOF
