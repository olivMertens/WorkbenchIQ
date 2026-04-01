"""Check PG version and table status."""
import asyncio
import asyncpg
import ssl

async def check():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    conn = await asyncpg.connect(
        host='pg-groupaiq-prod.postgres.database.azure.com',
        port=5432, user='groupaiqadmin',
        password='vw4FC9OfzBQit5603mcL2aSV',
        database='groupaiq', ssl=ctx
    )
    ver = await conn.fetchval('SELECT version()')
    print(f'PostgreSQL version: {ver}')

    exists = await conn.fetchval(
        "SELECT EXISTS(SELECT 1 FROM information_schema.tables "
        "WHERE table_schema='workbenchiq' AND table_name='claim_policy_chunks')"
    )
    print(f'claim_policy_chunks exists: {exists}')

    if exists:
        # Check the table structure
        cols = await conn.fetch(
            "SELECT column_name, data_type FROM information_schema.columns "
            "WHERE table_schema='workbenchiq' AND table_name='claim_policy_chunks' "
            "ORDER BY ordinal_position"
        )
        print('Columns:')
        for c in cols:
            print(f'  {c["column_name"]}: {c["data_type"]}')

    await conn.close()

asyncio.run(check())
