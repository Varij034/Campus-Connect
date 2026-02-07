# Troubleshooting Guide

## Port 8000 Already in Use

**Error:** `[Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)`

**Solution 1: Stop existing server**
```bash
stop_server.bat
```
Then start again with `start_server.bat`

**Solution 2: Find and kill the process manually**
```bash
# Find the process
netstat -ano | findstr :8000

# Kill it (replace <PID> with the actual process ID)
taskkill /F /PID <PID>
```

**Solution 3: Use a different port**
Edit `main.py` and change:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Change 8000 to 8001
```
Then access at `http://localhost:8001`

## Connection Refused Error

**Error:** `ConnectionRefusedError: [WinError 10061]`

**Solution:** The server is not running!
1. Start the server: `python main.py` or `start_server.bat`
2. Wait until you see: `INFO:     Uvicorn running on http://0.0.0.0:8000`
3. Then try accessing `http://localhost:8000`

## File Not Found Error

**Error:** `FileNotFoundError` or `404: Resume file not found`

**Solution:**
- Use **absolute paths**, not relative paths
- ✅ Correct: `C:\Users\Varij\Documents\resume.pdf`
- ❌ Wrong: `resume.pdf` or `.\resume.pdf`
- Make sure the file exists at that location
- Check file permissions

## Import Errors

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
pip install -r requirements.txt
```

If that doesn't work:
```bash
pip install --upgrade pip
pip install fastapi uvicorn python-multipart PyPDF2 python-docx pydantic requests
```

## PDF/DOCX Parsing Errors

**Error:** `Error extracting text from PDF` or similar

**Solution:**
- Make sure the file is not corrupted
- Try converting to a different format (PDF → DOCX or TXT)
- Check if the file is password protected
- Ensure PyPDF2 and python-docx are installed:
  ```bash
  pip install PyPDF2 python-docx
  ```

## Web Interface Not Loading

**Error:** Can't see the web interface at `http://localhost:8000`

**Solution:**
1. Make sure `static/index.html` exists
2. Try accessing directly: `http://localhost:8000/static/index.html`
3. Use the API docs instead: `http://localhost:8000/docs`
4. Check browser console for errors (F12)

## Server Starts But Immediately Stops

**Possible causes:**
1. Port conflict (see "Port 8000 Already in Use")
2. Import errors (see "Import Errors")
3. Syntax errors in code

**Solution:**
- Check the error message in the terminal
- Run `python main.py` directly (not in background) to see full error
- Check all files are in the same directory

## Still Having Issues?

1. Check that all files are present:
   - `main.py`
   - `resume_parser.py`
   - `skill_analyzer.py`
   - `job_descriptions.py`
   - `static/index.html`

2. Verify Python version:
   ```bash
   python --version
   ```
   Should be 3.8 or higher

3. Check dependencies:
   ```bash
   pip list | findstr fastapi
   pip list | findstr uvicorn
   ```

4. Try running in a fresh terminal/command prompt

