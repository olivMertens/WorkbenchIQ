"""Quick script to check indexes on workbenchiq schema tables."""
import asyncio
import asyncpg


async def main():
    conn = await asyncpg.connect(
        host="pg-groupaiq-prod.postgres.database.azure.com",
        database="groupaiq",
        user="groupaiqadmin",
        password="vw4FC9OfzBQit5603mcL2aSV",
        port=5432,
        ssl="require",
    )
    rows = await conn.fetch(
        "SELECT indexname, indexdef FROM pg_indexes "
        "WHERE schemaname = 'workbenchiq' ORDER BY tablename, indexname"
    )
    for r in rows:
        print(f"{r['indexname']}: {r['indexdef']}")

    print("\n--- Table existence ---")
    tables = await conn.fetch(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema = 'workbenchiq'"
    )
    for t in tables:
        print(t["table_name"])
    await conn.close()


asyncio.run(main())
