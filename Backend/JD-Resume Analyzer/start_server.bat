@echo off
echo Starting Resume-JD Skill Analyzer Server...
echo.

REM Stop any existing server on port 8000
echo Checking for existing server on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Found existing server (PID: %%a), stopping it...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Warning: Could not stop process %%a
    ) else (
        echo Successfully stopped existing server
    )
)

REM Wait a moment for port to be released
timeout /t 2 /nobreak >nul 2>&1

echo.
echo Starting new server...
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo Web Interface: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
python main.py
pause

