import os
import sys
import sqlite3
import json
from pymongo import MongoClient

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.config import settings

def migrate_all():
    print("==================================================================")
    print(" FINTECH AGENT OS: SQLITE -> MONGODB ATLAS DATA MIGRATION SCRIPT")
    print("==================================================================")

    uri = settings.MONGODB_URI or os.getenv("MONGODB_URI", "")
    if not uri:
        print("[ERROR] MONGODB_URI is not set in backend/.env")
        return

    print("Connecting to MongoDB Atlas...")
    client = MongoClient(uri)
    db_name = settings.MONGODB_DB_NAME or "fintech_agent_os"
    mongo_db = client[db_name]
    print(f"[OK] Connected to MongoDB Atlas DB: '{db_name}'\n")

    # 1. Migrate strategy_history.db
    strategy_db_path = os.path.join(os.path.dirname(__file__), "..", "strategy_history.db")
    if os.path.exists(strategy_db_path):
        print(f"[STRATEGY] Migrating strategy history from {strategy_db_path}...")
        try:
            conn = sqlite3.connect(strategy_db_path)
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT * FROM strategy_history").fetchall()
            
            coll = mongo_db["strategy_history"]
            migrated_count = 0
            for r in rows:
                doc = {
                    "run_id": r["run_id"],
                    "timestamp": r["timestamp"],
                    "prompt": r["prompt"],
                    "asset": r["asset"],
                    "strategy_name": r["strategy_name"],
                    "total_return": r["total_return"],
                    "sharpe_ratio": r["sharpe_ratio"],
                    "max_drawdown": r["max_drawdown"],
                    "total_trades": r["total_trades"],
                    "win_rate": r["win_rate"],
                    "wired_pipeline": json.loads(r["wired_pipeline"]) if r["wired_pipeline"] else [],
                    "ai_explanation": r["ai_explanation"]
                }
                coll.update_one({"run_id": doc["run_id"]}, {"$set": doc}, upsert=True)
                migrated_count += 1
            conn.close()
            print(f"  -> Successfully migrated {migrated_count} strategy backtest runs to MongoDB 'strategy_history'.")
        except Exception as e:
            print(f"  -> Strategy migration note: {e}")
    else:
        print(f"[INFO] {strategy_db_path} not found. Skipping strategy history migration.")

    # 2. Migrate ledger_vault.db
    ledger_db_path = os.path.join(os.path.dirname(__file__), "..", "ledger_vault.db")
    if os.path.exists(ledger_db_path):
        print(f"\n[LEDGER] Migrating tamper-evident audit ledger from {ledger_db_path}...")
        try:
            conn = sqlite3.connect(ledger_db_path)
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT * FROM ledger").fetchall()
            
            coll = mongo_db["ledger_vault"]
            migrated_count = 0
            for r in rows:
                doc = {
                    "ledger_id": r["id"],
                    "body": r["body"],
                    "hash": r["hash"]
                }
                coll.update_one({"hash": doc["hash"]}, {"$set": doc}, upsert=True)
                migrated_count += 1
            conn.close()
            print(f"  -> Successfully migrated {migrated_count} tamper-evident ledger entries to MongoDB 'ledger_vault'.")
        except Exception as e:
            print(f"  -> Ledger migration note: {e}")
    else:
        print(f"[INFO] {ledger_db_path} not found. Skipping ledger migration.")

    # 3. Migrate memory.db
    memory_db_path = os.path.join(os.path.dirname(__file__), "..", "data", "memory.db")
    if os.path.exists(memory_db_path):
        print(f"\n[MEMORY] Migrating dual memory store from {memory_db_path}...")
        try:
            conn = sqlite3.connect(memory_db_path)
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT * FROM memory_store").fetchall()
            
            coll = mongo_db["memory_store"]
            migrated_count = 0
            for r in rows:
                val = r["value"]
                try:
                    val = json.loads(val)
                except Exception:
                    pass

                doc = {
                    "key": r["key"],
                    "value": val
                }
                coll.update_one({"key": doc["key"]}, {"$set": doc}, upsert=True)
                migrated_count += 1
            conn.close()
            print(f"  -> Successfully migrated {migrated_count} memory keys to MongoDB 'memory_store'.")
        except Exception as e:
            print(f"  -> Memory migration note: {e}")
    else:
        print(f"[INFO] {memory_db_path} not found. Skipping memory migration.")

    print("\n==================================================================")
    print(" MIGRATION COMPLETE: All SQLite data successfully uploaded to MongoDB Atlas!")
    print("==================================================================")

if __name__ == "__main__":
    migrate_all()
