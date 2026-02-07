# 🚀 How to Start the Server (Fixed Port Issues)

## Quick Start (Recommended)

**Use the safe startup script that automatically handles port conflicts:**

1. **Double-click:** `start_server_safe.bat`

This script will:
- ✅ Automatically stop any existing server on port 8000
- ✅ Wait for the port to be released
- ✅ Start a fresh server
- ✅ Show clear error messages if something goes wrong

## Alternative Methods

### Method 1: Stop First, Then Start

1. **Stop existing server:**
   - Double-click `stop_server.bat`
   - Or run: `stop_server.bat`

2. **Start server:**
   - Double-click `start_server.bat`
   - Or run: `start_server.bat`

### Method 2: Restart Script

1. **Double-click:** `restart_server.bat`

This automatically stops and starts the server.

### Method 3: Manual (If scripts don't work)

1. **Find and kill the process:**
   ```bash
   netstat -ano | findstr :8000
   ```
   Note the PID (last number)

2. **Kill the process:**
   ```bash
   taskkill /F /PID <PID>
   ```
   Replace `<PID>` with the number from step 1

3. **Start server:**
   ```bash
   python main.py
   ```

## Verify Server is Running

After starting, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Then open in browser:
- **Web Interface:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## If You Still Get Port Errors

1. **Run the safe script:**
   ```
   start_server_safe.bat
   ```

2. **Or manually:**
   ```bash
   stop_server.bat
   wait 3 seconds
   start_server.bat
   ```

3. **If still failing:**
   - Restart your computer (this will clear all ports)
   - Or use a different port (edit `main.py` and change `port=8000` to `port=8001`)

## Troubleshooting

### "Port 8000 is still in use"
- Run `stop_server.bat` multiple times
- Wait 5 seconds between attempts
- Check Task Manager for Python processes and end them

### "Server failed to start"
- Check if Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check for errors in the terminal output

### "Connection refused" in browser
- Make sure server is actually running
- Look for "Uvicorn running" message
- Wait 5 seconds after starting before opening browser

