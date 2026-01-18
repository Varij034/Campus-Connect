"""
Startup checks and validation
"""

import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)


def check_imports() -> List[Tuple[str, bool, str]]:
    """Check if optional imports are available"""
    results = []
    
    # Check student engine
    try:
        import sys
        import os
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        from student_engine import CampusConnectStudentEngine
        results.append(("student_engine", True, "Available"))
    except ImportError as e:
        results.append(("student_engine", False, f"Not available: {str(e)}"))
    except Exception as e:
        results.append(("student_engine", False, f"Error: {str(e)}"))
    
    # Check ATS components
    try:
        from resume_parser import ResumeParser
        results.append(("resume_parser", True, "Available"))
    except ImportError as e:
        results.append(("resume_parser", False, f"Not available: {str(e)}"))
    
    try:
        from ats_engine import ATSEngine
        results.append(("ats_engine", True, "Available"))
    except ImportError as e:
        results.append(("ats_engine", False, f"Not available: {str(e)}"))
    
    try:
        from feedback_generator import FeedbackGenerator
        results.append(("feedback_generator", True, "Available"))
    except ImportError as e:
        results.append(("feedback_generator", False, f"Not available: {str(e)}"))
    
    return results


def log_startup_status():
    """Log startup status of optional components"""
    logger.info("Checking optional component availability...")
    results = check_imports()
    
    for component, available, message in results:
        status = "✓" if available else "✗"
        logger.info(f"{status} {component}: {message}")
    
    missing = [name for name, available, _ in results if not available]
    if missing:
        logger.warning(f"Some components are not available: {', '.join(missing)}")
        logger.warning("Related API endpoints may return 503 errors until dependencies are installed.")
