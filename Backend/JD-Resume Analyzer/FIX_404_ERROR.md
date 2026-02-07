# Fix for 404 Error on /analyze Endpoint

## Issue
You're seeing 404 errors when trying to use the `/analyze` endpoint. This usually means:
1. The server is running old code
2. The server needs to be restarted

## Solution

### Step 1: Stop the Server
```powershell
.\stop_server.bat
```

Or manually:
```powershell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Step 2: Start the Server
```powershell
.\start_server_safe.bat
```

Or:
```powershell
python main.py
```

### Step 3: Verify Server is Running
You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4: Test the Endpoint
Open browser: http://localhost:8000/docs

You should see the `/analyze` endpoint listed there.

## Quick Restart
```powershell
.\restart_server.bat
```

## If Still Getting 404

1. **Check the endpoint exists:**
   - Go to http://localhost:8000/docs
   - Look for POST /analyze in the list

2. **Verify code is correct:**
   - Make sure `main.py` has `@app.post("/analyze")`

3. **Clear browser cache:**
   - Press Ctrl+F5 to hard refresh
   - Or use Incognito mode

4. **Check server logs:**
   - Look at the terminal where server is running
   - Check for any error messages

## Current Status
The server should now be running with all the latest code including:
- Improved PDF extraction with pdfplumber
- Better error messages
- Fixed /analyze endpoint

Try accessing http://localhost:8000 again!

