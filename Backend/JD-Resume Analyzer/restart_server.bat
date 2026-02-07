@echo off
echo Restarting Resume-JD Skill Analyzer Server...
echo.

REM Stop existing server
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Stopping existing server (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul 2>&1

REM Start new server
echo Starting new server...
echo.
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo Web Interface: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
python main.py

