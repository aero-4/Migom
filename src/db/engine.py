import asyncio

from src.core.config import settings

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

DATABASE_URL = settings.DATABASE_URI
engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)



