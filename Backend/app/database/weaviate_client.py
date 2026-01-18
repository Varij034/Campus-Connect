"""
Weaviate vector database connection
"""

import weaviate
from typing import Optional
from app.config import settings

weaviate_client: Optional[weaviate.Client] = None


def connect_to_weaviate():
    """Connect to Weaviate"""
    global weaviate_client
    try:
        auth_config = None
        if settings.WEAVIATE_API_KEY:
            auth_config = weaviate.AuthApiKey(api_key=settings.WEAVIATE_API_KEY)
        
        weaviate_client = weaviate.Client(
            url=settings.WEAVIATE_URL,
            auth_client_secret=auth_config,
            timeout_config=(5, 30)  # (connect timeout, read timeout)
        )
        
        # Test connection
        if weaviate_client.is_ready():
            print(f"✓ Connected to Weaviate: {settings.WEAVIATE_URL}")
        else:
            raise ConnectionError("Weaviate is not ready")
    except Exception as e:
        print(f"✗ Failed to connect to Weaviate: {e}")
        raise


def get_weaviate() -> weaviate.Client:
    """Get Weaviate client instance"""
    if weaviate_client is None:
        raise RuntimeError("Weaviate not connected. Call connect_to_weaviate() first.")
    return weaviate_client
