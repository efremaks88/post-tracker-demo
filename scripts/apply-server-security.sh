#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/postprod-tracker"
ENV_DIR="/etc/postprod-tracker"
ENV_TARGET="$ENV_DIR/postprod-tracker.env"
SYSTEMD_UNIT="/etc/systemd/system/postprod-tracker.service"
NGINX_SITE="/etc/nginx/sites-available/tracker"
NGINX_CONF="/etc/nginx/nginx.conf"
SERVICE="postprod-tracker.service"
CSP="default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App dir not found: $APP_DIR" >&2
  exit 1
fi
if [[ ! -f "$SYSTEMD_UNIT" ]]; then
  echo "Systemd unit not found: $SYSTEMD_UNIT" >&2
  exit 1
fi
if [[ ! -f "$NGINX_SITE" ]]; then
  echo "Nginx site not found: $NGINX_SITE" >&2
  exit 1
fi

sudo install -d -o root -g tracker -m 0750 "$ENV_DIR"
if [[ -f "$APP_DIR/.env" ]]; then
  sudo install -o root -g tracker -m 0640 "$APP_DIR/.env" "$ENV_TARGET"
fi

sudo sed -i "s|^EnvironmentFile=.*|EnvironmentFile=$ENV_TARGET|" "$SYSTEMD_UNIT"

nginx_tmp="$(mktemp)"
awk -v csp="$CSP" '
  /add_header Content-Security-Policy/ {
    sub(/^[[:space:]]*/, "", $0)
    indent="    "
    print indent "add_header Content-Security-Policy \"" csp "\" always;"
    next
  }
  { print }
' "$NGINX_SITE" > "$nginx_tmp"
sudo install -o root -g root -m 0644 "$nginx_tmp" "$NGINX_SITE"
rm -f "$nginx_tmp"

# Harden global nginx TLS/version disclosure settings.
if [[ -f "$NGINX_CONF" ]]; then
  if grep -qE "^[[:space:]]*ssl_protocols" "$NGINX_CONF"; then
    sudo sed -i -E "s/^[[:space:]]*ssl_protocols .*/    ssl_protocols TLSv1.2 TLSv1.3;/" "$NGINX_CONF"
  else
    sudo sed -i "/http[[:space:]]*{/a\    ssl_protocols TLSv1.2 TLSv1.3;" "$NGINX_CONF"
  fi
  if grep -qE "^[[:space:]]*server_tokens" "$NGINX_CONF"; then
    sudo sed -i -E "s/^[[:space:]]*server_tokens .*/    server_tokens off;/" "$NGINX_CONF"
  else
    sudo sed -i "/http[[:space:]]*{/a\    server_tokens off;" "$NGINX_CONF"
  fi
fi

# Block accidental publication of text notes and backup-like files at nginx level.
if ! grep -q "location ~\\* \\.(txt|bak|backup|old|orig|tmp)" "$NGINX_SITE"; then
  sudo sed -i "/server_name/a\    location ~* \\.(txt|bak|backup|old|orig|tmp)$ { return 404; }" "$NGINX_SITE"
fi
sudo nginx -t

if [[ -f "$APP_DIR/.env" ]]; then
  sudo rm -f "$APP_DIR/.env"
fi
sudo rm -f "$APP_DIR/test_ldap.js"
sudo chown -R tracker:tracker "$APP_DIR"

cd "$APP_DIR"
npm install
npm run check
npm run security:smoke

sudo systemctl daemon-reload
sudo systemctl restart "$SERVICE"
sudo systemctl reload nginx
sudo systemctl is-active --quiet "$SERVICE"

check_url() {
  local path="$1"
  local url="https://127.0.0.1${path}"
  echo "Checking https://tracker.example.local${path}"
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl -k -fsSI -H "Host: tracker.example.local" "$url" >/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "Health check failed after restart: https://tracker.example.local${path}" >&2
  return 1
}

check_url "/"
check_url "/app.css"
check_url "/vendor/react.production.min.js"

echo "Server security apply OK"