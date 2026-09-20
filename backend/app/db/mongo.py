import os
import time
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from app.config import settings

class MongoDBManager:
    """
    MongoDB Atlas Connection Manager.
    Manages client connection and collection references for strategy history,
    tamper-evident audit ledger, memory store, and user auth.
    Supports low-latency connection timeouts and cooldown tracking.
    """
    def __init__(self):
        self._client: Optional[MongoClient] = None
        self._db: Optional[Database] = None
        self._is_connected = False
        self._last_connect_attempt = 0.0
        self._cooldown_seconds = 30.0  # Avoid blocking repeated requests when offline

    def connect(self) -> bool:
        if self._is_connected and self._db is not None:
            return True

        uri = settings.MONGODB_URI or os.getenv("MONGODB_URI", "")
        if not uri:
            return False

        now = time.time()
        # Cooldown check: if failed recently, don't block request for seconds
        if now - self._last_connect_attempt < self._cooldown_seconds:
            return False

        try:
            self._client = MongoClient(
                uri,
                serverSelectionTimeoutMS=1500,
                connectTimeoutMS=1500,
                socketTimeoutMS=2000
            )
            # Test connection
            self._client.admin.command('ping')
            db_name = settings.MONGODB_DB_NAME or "fintech_agent_os"
            self._db = self._client[db_name]
            self._is_connected = True
            
            # Ensure unique index on email for users collection
            try:
                self._db["users"].create_index("email", unique=True, background=True)
            except Exception as idx_err:
                print(f"MongoDBManager index creation note: {idx_err}")

            print(f"MongoDBManager: Successfully connected to MongoDB Atlas database '{db_name}'.")
            return True
        except Exception as e:
            self._last_connect_attempt = time.time()
            self._is_connected = False
            print(f"MongoDBManager Connection Warning: {e}. Cooldown active for {self._cooldown_seconds}s. Falling back to SQLite.")
            return False

    @property
    def is_connected(self) -> bool:
        if not self._is_connected:
            return self.connect()
        return True

    @property
    def db(self) -> Optional[Database]:
        if not self._is_connected:
            self.connect()
        return self._db

    def get_collection(self, name: str):
        if self.is_connected and self._db is not None:
            return self._db[name]
        return None

mongo_db = MongoDBManager()

