@echo off
echo ========================================
echo Stopping Resume-JD Skill Analyzer Server
echo ========================================
echo.

set FOUND=0

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    set FOUND=1
    echo Found process %%a using port 8000
    echo Stopping process %%a...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Warning: Could not stop process %%a, trying again...
        timeout /t 1 /nobreak >nul 2>&1
        taskkill /F /PID %%a >nul 2>&1
        if errorlevel 1 (
            echo ERROR: Failed to stop process %%a
            echo You may need to stop it manually or restart your computer
        ) else (
            echo Successfully stopped process %%a
        )
    ) else (
        echo Successfully stopped process %%a
    )
)

if %FOUND%==0 (
    echo No server found running on port 8000
    echo Port is already free!
)

echo.
echo Waiting for port to be released...
timeout /t 2 /nobreak >nul 2>&1

REM Verify
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo WARNING: Port 8000 is still in use by process %%a
    echo You may need to restart your computer or manually kill the process
)

echo.
echo ========================================
echo Server stopped successfully!
echo ========================================
echo.
echo You can now start it again with:
echo   - start_server.bat
echo   - start_server_safe.bat (recommended)
echo.
pause

