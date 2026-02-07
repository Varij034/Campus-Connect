# PowerShell Commands Reference

## How to Run Batch Files in PowerShell

In PowerShell, you need to use `.\` prefix to run scripts in the current directory:

### Start Server
```powershell
.\start_server_safe.bat
```

### Stop Server
```powershell
.\stop_server.bat
```

### Restart Server
```powershell
.\restart_server.bat
```

## Alternative: Run Python Directly

You can also start the server directly with Python:

```powershell
python main.py
```

To run in background (PowerShell 7+):
```powershell
Start-Process python -ArgumentList "main.py" -NoNewWindow
```

## Quick Commands

### Check if server is running
```powershell
netstat -ano | findstr :8000
```

### Kill process on port 8000
```powershell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Start server in background (PowerShell 7+)
```powershell
Start-Job -ScriptBlock { Set-Location "C:\Users\Varij\Documents\Campus Connect Analyzer"; python main.py }
```

## Why `.\` is needed?

PowerShell doesn't automatically run scripts from the current directory for security. You must explicitly specify the path:
- ✅ `.\start_server.bat` - Correct
- ❌ `start_server.bat` - Won't work in PowerShell (but works in CMD)

## Access the Server

Once running, open in browser:
- **Web Interface:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

