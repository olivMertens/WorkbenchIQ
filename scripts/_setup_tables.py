"""Create RAG tables and index all policies."""
import asyncio
import sys
sys.path.insert(0, ".")
from app.database.pool import init_pool, get_pool
from app.config import load_settings

POLICY_CHUNKS_SQL = """
CREATE TABLE IF NOT EXISTS workbenchiq.policy_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id VARCHAR(50) NOT NULL,
    policy_version VARCHAR(20),
    policy_name VARCHAR(255) NOT NULL,
    chunk_type VARCHAR(50) NOT NULL,
    chunk_sequence INT NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    criteria_id VARCHAR(50),
    risk_level VARCHAR(50),
    action_recommendation TEXT,
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    token_count INT NOT NULL DEFAULT 0,
    embedding vector(1536),
    embedding_model VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
"""

CLAIMS_CHUNKS_SQL = """
CREATE TABLE IF NOT EXISTS workbenchiq.{table} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id VARCHAR(50) NOT NULL,
    policy_version VARCHAR(20),
    policy_name VARCHAR(255) NOT NULL,
    chunk_type VARCHAR(50) NOT NULL,
    chunk_sequence INT NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    criteria_id VARCHAR(50),
    severity VARCHAR(50),
    risk_level VARCHAR(50),
    liability_determination TEXT,
    action_recommendation TEXT,
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    token_count INT NOT NULL DEFAULT 0,
    embedding vector(1536),
    embedding_model VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
"""

async def main():
    s = load_settings()
    await init_pool(s.database)
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
        await conn.execute("CREATE SCHEMA IF NOT EXISTS workbenchiq")
        await conn.execute(POLICY_CHUNKS_SQL)
        print("  Created: workbenchiq.policy_chunks")
        for tbl in ["claim_policy_chunks", "health_claims_policy_chunks"]:
            sql = CLAIMS_CHUNKS_SQL.replace("{table}", tbl)
            await conn.execute(sql)
            print(f"  Created: workbenchiq.{tbl}")
        rows = await conn.fetch("SELECT tablename FROM pg_tables WHERE schemaname='workbenchiq'")
        print(f"Tables: {[r['tablename'] for r in rows]}")

asyncio.run(main())
