@echo off
setlocal
cd /d "%~dp0"
title Kodex.sbs Local Server
set COREPACK_ENABLE_DOWNLOAD_PROMPT=0

echo ========================================
echo          KODEX.SBS LOCAL START
echo ========================================

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Install Node.js 20.15.1 LTS, then run this file again.
  pause
  exit /b 1
)

node -e "const [a,b,c]=process.versions.node.split('.').map(Number); if(a!==20||b<15||(b===15&&c<1)){process.exit(1)}"
if errorlevel 1 (
  echo ERROR: Node.js 20.15.1 or newer in the Node 20 line is required.
  echo Do not use Node 22 or 24 for this project. Install Node.js 20.15.1 LTS.
  pause
  exit /b 1
)

where corepack >nul 2>nul
if errorlevel 1 (
  echo ERROR: Corepack is missing. Reinstall Node.js 20.15.1 LTS with Corepack enabled.
  pause
  exit /b 1
)

if not exist .env.local (
  copy .env.example .env.local >nul
  echo Created .env.local. Add your provider API keys there before using AI features.
)

echo Installing locked dependencies...
call corepack pnpm@9.4.0 install --frozen-lockfile
if errorlevel 1 (
  echo Dependency installation failed. Read the error above.
  pause
  exit /b 1
)

echo Starting Kodex.sbs...
call corepack pnpm run start
if errorlevel 1 (
  echo Kodex.sbs stopped with an error. Keep this window open and share the error text.
  pause
  exit /b 1
)

pause
