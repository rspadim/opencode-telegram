# TODO

## Roadmap

1. Harden the foundation
   - [done] Real i18n via `config.local.json`
   - [next] Better error handling
   - [next] Clearer logs
   - [partial] More consistent command behavior

2. Improve Telegram UX
   - [partial] Richer status messages
   - [partial] Better inline feedback
   - [next] Simple pagination for `/projects` and `/sessions`
   - [next] More guided command flows

3. Increase technical maturity
   - [partial] Move to TypeScript
   - [done] Add tests
   - [next] Add lint/format
   - [done] Restructure into `src/`

4. Expand remote control
   - [next] Start/stop/restart OpenCode server
   - [next] Easier project and session selection
   - [later] Possibly switch model and agent from Telegram

5. Preserve the product differentiators
   - [done] `1 topic = 1 session`
   - [done] Automatic topic creation
   - [done] General-chat fallback
   - [done] Windows tray controller

## Delivered recently

- Localized Telegram session commands: `/rename`, `/children`, `/delete`, `/download`
- Shared notifier helpers extracted for command parsing, topic naming and thread lookup
- Localized help and status strings aligned across `en`, `pt-BR`, `es`, `fr`, `ru`, `zh`, `de`
- Basic test coverage for translator and notifier helpers

## Current Focus

- Add simple pagination for `/projects` and `/sessions`
- Improve error handling and logs around Telegram/OpenCode operations
- Add lint/format to tighten the TypeScript migration
