@echo off
setlocal
set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process node -ArgumentList '"%SCRIPT_DIR%telegram-notifier.mjs"' -WorkingDirectory '%SCRIPT_DIR%' -WindowStyle Hidden"
