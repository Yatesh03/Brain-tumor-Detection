@echo off
REM Starts backend (Flask) and frontend (React) in parallel on Windows.
REM Usage: from repo root run `start.bat`

set "REPO_ROOT=%~dp0"

echo Starting backend (Flask)...
start "backend" cmd /c "cd /d %REPO_ROOT% && python app.py"

echo Starting frontend (React)...
start "frontend" cmd /c "cd /d %REPO_ROOT%client && npm start"

echo.
echo Done. Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo If frontend fails to connect, ensure backend is running and that firewall allows port 5000.
pause

