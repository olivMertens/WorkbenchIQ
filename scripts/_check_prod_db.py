"""Quick check of production PostgreSQL policy indexing."""
import asyncio
import asyncpg
import ssl

async def check():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    conn = await asyncpg.connect(
        host='pg-groupaiq-prod.postgres.database.azure.com',
        port=5432,
        user='groupaiqadmin',
        password='vw4FC9OfzBQit5603mcL2aSV',
        database='groupaiq',
        ssl=ctx
    )
    # List tables
    tables = await conn.fetch(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema = 'workbenchiq' ORDER BY table_name"
    )
    print('Tables in workbenchiq schema:')
    for t in tables:
        print(f'  - {t["table_name"]}')

    # Check each table
    for tname in ['policy_chunks', 'claim_policy_chunks', 'health_claims_policy_chunks']:
        try:
            count = await conn.fetchval(f'SELECT COUNT(*) FROM workbenchiq.{tname}')
            print(f'\n{tname}: {count} rows')
            row = await conn.fetchrow(f'SELECT * FROM workbenchiq.{tname} LIMIT 1')
            if row:
                print(f'  Columns: {list(row.keys())}')
                if 'category' in row.keys():
                    cats = await conn.fetch(
                        f"SELECT category, COUNT(*) as cnt FROM workbenchiq.{tname} GROUP BY category"
                    )
                    for c in cats:
                        print(f'  Category {c["category"]}: {c["cnt"]} chunks')
                if 'claim_type' in row.keys():
                    types = await conn.fetch(
                        f"SELECT claim_type, COUNT(*) as cnt FROM workbenchiq.{tname} GROUP BY claim_type"
                    )
                    for ct in types:
                        print(f'  Claim type {ct["claim_type"]}: {ct["cnt"]} chunks')
        except Exception as e:
            print(f'\n{tname}: ERROR - {e}')

    await conn.close()

asyncio.run(check())
