import os
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from app.config import settings

class MongoDBManager:
    """
    MongoDB Atlas Connection Manager.
    Manages client connection and collection references for strategy history,
    tamper-evident audit ledger, memory store, and user auth.
    """
    def __init__(self):
        self._client: Optional[MongoClient] = None
        self._db: Optional[Database] = None
        self._is_connected = False

    def connect(self) -> bool:
        if self._is_connected and self._db is not None:
            return True

        uri = settings.MONGODB_URI or os.getenv("MONGODB_URI", "")
        if not uri:
            print("MongoDBManager: No MONGODB_URI found. Falling back to local SQLite.")
            return False

        try:
            self._client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Test connection
            self._client.admin.command('ping')
            db_name = settings.MONGODB_DB_NAME or "fintech_agent_os"
            self._db = self._client[db_name]
            self._is_connected = True
            print(f"MongoDBManager: Successfully connected to MongoDB Atlas database '{db_name}'.")
            return True
        except Exception as e:
            print(f"MongoDBManager Connection Warning: {e}. Falling back to SQLite where applicable.")
            self._is_connected = False
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
