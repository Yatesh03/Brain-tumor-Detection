@echo off
REM Starts backend (Flask) and frontend (React) in parallel on Windows.
REM Usage from PowerShell: .\start.bat

set "REPO_ROOT=%~dp0"

echo Starting backend (Flask) on 127.0.0.1:5000...
start "backend" cmd /k "cd /d %REPO_ROOT% && python app.py"

echo Starting frontend (React)...
start "frontend" cmd /k "cd /d %REPO_ROOT%client && npm start"

echo.
echo Started in two new terminals:
echo Backend  : http://127.0.0.1:5000
echo Frontend : http://localhost:3000

