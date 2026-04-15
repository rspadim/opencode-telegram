#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
nohup node "$SCRIPT_DIR/telegram-notifier.mjs" >/dev/null 2>&1 &
echo "telegram-notifier start requested"
