"""
Neo4j graph database connection
"""

from neo4j import GraphDatabase, AsyncGraphDatabase
from typing import Optional
from app.config import settings

# Sync Neo4j driver
neo4j_driver: Optional[GraphDatabase.driver] = None

# Async Neo4j driver
neo4j_async_driver: Optional[AsyncGraphDatabase.driver] = None


def connect_to_neo4j():
    """Connect to Neo4j (sync)"""
    global neo4j_driver
    try:
        neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        # Test connection
        with neo4j_driver.session() as session:
            session.run("RETURN 1")
        print(f"✓ Connected to Neo4j: {settings.NEO4J_URI}")
    except Exception as e:
        print(f"✗ Failed to connect to Neo4j: {e}")
        raise


async def connect_to_neo4j_async():
    """Connect to Neo4j (async)"""
    global neo4j_async_driver
    try:
        neo4j_async_driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        # Test connection
        async with neo4j_async_driver.session() as session:
            await session.run("RETURN 1")
        print(f"✓ Connected to Neo4j (async): {settings.NEO4J_URI}")
    except Exception as e:
        print(f"✗ Failed to connect to Neo4j (async): {e}")
        raise


def close_neo4j_connection():
    """Close Neo4j connection"""
    global neo4j_driver, neo4j_async_driver
    if neo4j_driver:
        neo4j_driver.close()
    if neo4j_async_driver:
        neo4j_async_driver.close()


def get_neo4j():
    """Get Neo4j driver instance (sync)"""
    if neo4j_driver is None:
        raise RuntimeError("Neo4j not connected. Call connect_to_neo4j() first.")
    return neo4j_driver


def get_neo4j_async():
    """Get Neo4j driver instance (async)"""
    if neo4j_async_driver is None:
        raise RuntimeError("Neo4j not connected. Call connect_to_neo4j_async() first.")
    return neo4j_async_driver
