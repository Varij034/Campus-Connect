@echo off
echo ========================================
echo Resume-JD Skill Analyzer Server
echo ========================================
echo.

REM Function to kill process on port 8000
:kill_port
echo Checking for processes using port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo Stopping process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Warning: Could not stop process %%a, trying again...
        timeout /t 1 /nobreak >nul 2>&1
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Wait for port to be released
echo Waiting for port to be released...
timeout /t 2 /nobreak >nul 2>&1

REM Verify port is free
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo Port 8000 is still in use by process %%a
    echo Trying to force kill...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak >nul 2>&1
    goto kill_port
)

echo Port 8000 is now free!
echo.
echo ========================================
echo Starting Server...
echo ========================================
echo.
echo Server will be available at:
echo   - Web Interface: http://localhost:8000
echo   - API Docs:      http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python main.py

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Server failed to start!
    echo ========================================
    echo.
    echo Possible causes:
    echo 1. Port 8000 is still in use
    echo 2. Python dependencies not installed
    echo 3. Error in the code
    echo.
    echo Try running: stop_server.bat
    echo Then run this script again
    echo.
    pause
)

