# telegram-opencode

Local OpenCode <-> Telegram bridge.

## Requirements

- Node.js 24+
- `opencode` installed and available on `PATH`
- Local config in `config.local.json` or user environment variables

Optional:

- `OPENCODE_DESKTOP_NOTIFY=1` for local desktop notifications
- `OPENCODE_ATTACHMENT_SIZE_LIMIT=10000000` to cap Telegram attachment downloads
- Disable Telegram bot privacy mode if you want the bot to read normal group/topic messages

## Config

- Copy `config.example.json` to `config.local.json`
- `config.local.json` is ignored by git and meant for local secrets
- Environment variables still override the local config when present
- Set `locale` in `config.local.json` to one of: `en`, `pt-BR`, `es`, `fr`, `ru`, `zh`, `de`
- Set `runtime.replayPastMessages` to `true` if you want Telegram to repopulate recent completed OpenCode history on startup (default: `false`)

## Languages

- Supported locales: `en`, `pt-BR`, `es`, `fr`, `ru`, `zh`, `de`
- Select the active locale with `locale` in `config.local.json`

## Scripts

- Start: `npm run start`
- Check syntax: `npm run check`
- Type check: `npm run typecheck`
- Test: `npm run test`
- Stop: `npm run stop`
- Status: `npm run status`
- Windows tray: `npm run tray:windows`

## Platform Wrappers

- Windows: `start-telegram-notifier.cmd`, `stop-telegram-notifier.ps1`, `status-telegram-notifier.ps1`
- Windows tray: `start-tray.cmd`, `tray-telegram-notifier.ps1`
- Linux: `start-telegram-notifier.sh`, `stop-telegram-notifier.sh`, `status-telegram-notifier.sh`
- macOS: `start-telegram-notifier.sh`, `stop-telegram-notifier.sh`, `status-telegram-notifier.sh`

## Linux

- Works headlessly on Ubuntu-like distros, KDE and GNOME as long as `node` and `opencode` are on `PATH`
- For local desktop notifications, use `notify-send` when the desktop session supports it
- System tray is intentionally not the default runtime model because support varies a lot across GNOME, KDE, Ubuntu variants and Wayland/X11

## Windows Tray

- A lightweight tray controller is included for Windows only
- It can start, stop and restart the bridge, open the log/topic map/README, and show current status
- Launch it with `start-tray.cmd` or `npm run tray:windows`

## macOS

- Works with the same shell wrappers when `node` and `opencode` are on `PATH`
- Optional desktop notifications use `osascript`
- No tray integration is included by default

## Runtime

Generated at runtime:

- `data/telegram-notifier.pid`
- `data/telegram-notifier.lock`
- `data/telegram-notifier.state.json`
- `data/telegram-topic-map.json`
- `data/telegram-notifier.log`

## Structure

- `src/` contains the runtime application code
- Root wrapper files keep the CLI scripts and local launchers stable
- `data/` contains runtime state only
- TypeScript migration is in progress for `src/` modules

## Telegram Commands

- In the general chat, send `/newtopic Your session title`
- The bot creates a new OpenCode session and a matching Telegram forum topic
- If no title is provided, it falls back to `New session - <timestamp>`
- In the general chat, `/listtopics` shows the current topic/session mappings
- In the general chat, `/status` shows bridge runtime status
- In the general chat, `/sessions`, `/session`, `/project`, `/projects` and `/providers` expose OpenCode management info
- In any linked topic, plain messages are forwarded into the mapped OpenCode session
- In any linked topic, `/link <session-id>` rebinds the topic to an existing session
- In any linked topic, `/todo`, `/diff`, `/abort`, `/fork`, `/share`, `/archive` and `/download` act on the linked OpenCode session
- In any linked topic, `/unlink` removes the mapping
- In any chat, `/help` shows the available commands

## Attachments

- Telegram photos, documents, audio, voice notes and videos are forwarded to OpenCode as file parts
- Oversized attachments are skipped and replaced with a note in the OpenCode prompt
