# Container Restart Fix

## Issues Fixed

### 1. SQLAlchemy Reserved Word Error
**Problem**: Column named `metadata` is reserved in SQLAlchemy Declarative API.

**Fix**: Renamed to `log_metadata` in:
- `app/models/postgres_models.py`
- `app/core/middleware.py`
- `migrations/versions/0001_initial_migration.py`

### 2. Module Import Errors at Startup
**Problem**: Heavy ML libraries (student_engine, ATS components) were being imported and initialized at module level, causing startup failures.

**Fix**: Implemented lazy loading:
- Components are only loaded when endpoints are called
- Graceful error handling if dependencies are missing
- App starts successfully even if optional components fail

### 3. MongoDB Connection Errors
**Problem**: Chat service would fail if MongoDB wasn't connected at startup.

**Fix**: Added error handling in chat service functions with proper HTTP 503 responses.

## Changes Made

### Lazy Loading Pattern

**Before**:
```python
from student_engine import CampusConnectStudentEngine
student_engine = CampusConnectStudentEngine()  # Fails at import time
```

**After**:
```python
_student_engine = None

def get_student_engine():
    global _student_engine
    if _student_engine is None:
        try:
            from student_engine import CampusConnectStudentEngine
            _student_engine = CampusConnectStudentEngine()
        except ImportError as e:
            raise HTTPException(status_code=503, detail=f"Not available: {e}")
    return _student_engine
```

### Error Handling

- All database connections are now non-blocking at startup
- Missing dependencies return 503 errors instead of crashing
- Startup checks log which components are available

## Testing

After these fixes, the container should:
1. Start successfully even if some databases aren't connected
2. Start successfully even if ML dependencies are missing
3. Return proper error messages when unavailable features are accessed
4. Log startup status of all components

## Next Steps

If container still restarts:

1. **Check logs**:
   ```powershell
   docker-compose logs backend
   ```

2. **Check specific error**:
   ```powershell
   docker-compose logs backend | Select-String -Pattern "Error|Exception|Traceback" -Context 5
   ```

3. **Common remaining issues**:
   - Database connection timeouts (increase startup wait time)
   - Missing environment variables
   - Port conflicts
   - Disk space issues

4. **Test health endpoint**:
   ```powershell
   curl http://localhost:8000/health
   ```

## Verification

The container should now:
- ✅ Start without crashing
- ✅ Respond to `/health` endpoint
- ✅ Show startup logs indicating component status
- ✅ Handle missing dependencies gracefully
