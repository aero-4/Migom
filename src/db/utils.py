import logging

from sqlalchemy import text

from src.db.base import Base
from src.db.engine import engine


async def drop_all_tables_cascade():
    async with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(text(f'DROP TABLE IF EXISTS "{table.name}" CASCADE'))


async def create_and_delete_tables_db():
    async with engine.begin() as conn:
        try:
            await conn.run_sync(Base.metadata.drop_all)
        except:
            await drop_all_tables_cascade()
        await conn.run_sync(Base.metadata.create_all)

        logging.info("Database tables recreated")
