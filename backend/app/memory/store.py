import json
import os
import aiosqlite
import redis.asyncio as redis
from typing import Optional, Dict, Any
from app.config import settings

class DualMemoryStore:
    """
    Production dual-layer memory store:
    Attempts connection to Redis. If Redis is unavailable, automatically
    falls back to SQLite3 file database.
    """
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.use_redis = False
        self.sqlite_db_path = settings.SQLITE_DB_PATH
        os.makedirs(os.path.dirname(self.sqlite_db_path), exist_ok=True)

    async def init_store(self):
        # Try connecting to Redis
        try:
            r = redis.from_url(settings.REDIS_URL, socket_timeout=1.0)
            await r.ping()
            self.redis_client = r
            self.use_redis = True
            print("Memory Store: Successfully connected to Redis.")
        except Exception:
            self.use_redis = False
            print(f"Memory Store: Redis unavailable. Using SQLite fallback at {self.sqlite_db_path}")
            async with aiosqlite.connect(self.sqlite_db_path) as db:
                await db.execute("""
                    CREATE TABLE IF NOT EXISTS memory_store (
                        key TEXT PRIMARY KEY,
                        value TEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await db.commit()

    async def set(self, key: str, value: Dict[str, Any]) -> None:
        json_val = json.dumps(value)
        if self.use_redis and self.redis_client:
            try:
                await self.redis_client.set(key, json_val)
                return
            except Exception:
                self.use_redis = False

        # SQLite fallback
        async with aiosqlite.connect(self.sqlite_db_path) as db:
            await db.execute(
                "INSERT OR REPLACE INTO memory_store (key, value) VALUES (?, ?)",
                (key, json_val)
            )
            await db.commit()

    async def get(self, key: str) -> Optional[Dict[str, Any]]:
        if self.use_redis and self.redis_client:
            try:
                val = await self.redis_client.get(key)
                if val:
                    return json.loads(val.decode("utf-8"))
            except Exception:
                self.use_redis = False

        # SQLite fallback
        async with aiosqlite.connect(self.sqlite_db_path) as db:
            async with db.execute("SELECT value FROM memory_store WHERE key = ?", (key,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row[0])
        return None

memory_store = DualMemoryStore()
