import asyncio, sys
sys.path.insert(0, ".")
from app.database.pool import init_pool, get_pool
from app.config import load_settings

async def fix():
    s = load_settings()
    await init_pool(s.database)
    pool = await get_pool()
    async with pool.acquire() as conn:
        for tbl in ["policy_chunks", "claim_policy_chunks", "health_claims_policy_chunks"]:
            sql = (
                f"CREATE UNIQUE INDEX IF NOT EXISTS idx_{tbl}_uq "
                f"ON workbenchiq.{tbl} "
                f"(policy_id, chunk_type, COALESCE(criteria_id, ''), content_hash)"
            )
            await conn.execute(sql)
            print(f"  Unique index on workbenchiq.{tbl}")
    print("Done")

asyncio.run(fix())
