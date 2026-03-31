import asyncio, sys
sys.path.insert(0, ".")
from app.database.pool import init_pool, get_pool
from app.config import load_settings

async def stats():
    s = load_settings()
    await init_pool(s.database)
    pool = await get_pool()
    async with pool.acquire() as conn:
        for tbl in ["policy_chunks", "claim_policy_chunks", "health_claims_policy_chunks"]:
            count = await conn.fetchval(f"SELECT COUNT(*) FROM workbenchiq.{tbl}")
            policies = await conn.fetch(f"SELECT DISTINCT policy_id, category FROM workbenchiq.{tbl} ORDER BY category, policy_id")
            print(f"\n{tbl}: {count} chunks")
            for p in policies:
                print(f"  {p['policy_id']:30s} ({p['category']})")

asyncio.run(stats())
