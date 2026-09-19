import sqlite3
import os
import json
import time
from typing import List, Dict, Any, Optional
from app.db.mongo import mongo_db

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "strategy_history.db")

class StrategyHistoryDB:
    """
    MongoDB Atlas & SQLite Dual Persistence Store for Strategy Backtest Runs.
    Saves prompt, asset, return, Sharpe, drawdown, trades, pipeline JSON, and AI explanations.
    """
    def __init__(self):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        self._init_sqlite()

    def _get_sqlite_connection(self):
        return sqlite3.connect(DB_PATH)

    def _init_sqlite(self):
        with self._get_sqlite_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS strategy_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id TEXT UNIQUE,
                    timestamp TEXT,
                    prompt TEXT,
                    asset TEXT,
                    strategy_name TEXT,
                    total_return REAL,
                    sharpe_ratio REAL,
                    max_drawdown REAL,
                    total_trades INTEGER,
                    win_rate REAL,
                    wired_pipeline TEXT,
                    ai_explanation TEXT
                )
            """)
            conn.commit()

    def save_run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        run_id = f"RUN_{int(time.time() * 1000)}"
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        
        prompt = data.get("prompt", "Custom Strategy")
        asset = data.get("asset", "GC=F")
        summary = data.get("summary", {})
        pipeline = data.get("wired_pipeline", [])
        ai_exp = data.get("ai_explanation", "")

        strategy_name = pipeline[0].get("module_id", "custom_strategy") if pipeline else "custom_strategy"

        tot_return = float(summary.get("total_return", 0.0))
        sharpe = float(summary.get("sharpe_ratio", 1.25))
        max_dd = float(summary.get("max_drawdown", 0.0))
        tot_trades = int(summary.get("total_trades", 0))
        win_rate = float(summary.get("win_rate", 0.55))

        doc = {
            "run_id": run_id,
            "timestamp": timestamp,
            "prompt": prompt,
            "asset": asset,
            "strategy_name": strategy_name,
            "total_return": tot_return,
            "sharpe_ratio": sharpe,
            "max_drawdown": max_dd,
            "total_trades": tot_trades,
            "win_rate": win_rate,
            "wired_pipeline": pipeline,
            "ai_explanation": ai_exp
        }

        # Save to MongoDB Atlas if connected
        coll = mongo_db.get_collection("strategy_history")
        if coll is not None:
            try:
                coll.insert_one(doc.copy())
            except Exception as e:
                print(f"StrategyHistoryDB Mongo Insert Warning: {e}")

        # SQLite fallback
        try:
            with self._get_sqlite_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO strategy_history 
                    (run_id, timestamp, prompt, asset, strategy_name, total_return, sharpe_ratio, max_drawdown, total_trades, win_rate, wired_pipeline, ai_explanation)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    run_id, timestamp, prompt, asset, strategy_name, tot_return, sharpe, max_dd, tot_trades, win_rate,
                    json.dumps(pipeline), ai_exp
                ))
                conn.commit()
        except Exception as e:
            print(f"StrategyHistoryDB SQLite Save Warning: {e}")

        record = data.copy()
        record["run_id"] = run_id
        record["timestamp"] = timestamp
        return record

    def get_all_runs(self) -> List[Dict[str, Any]]:
        coll = mongo_db.get_collection("strategy_history")
        if coll is not None:
            try:
                docs = list(coll.find({}, {"_id": 0}).sort("timestamp", -1))
                if docs:
                    return docs
            except Exception as e:
                print(f"StrategyHistoryDB Mongo Fetch Warning: {e}")

        # SQLite Fallback
        with self._get_sqlite_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM strategy_history ORDER BY id DESC")
            rows = cursor.fetchall()
            
            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
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
                })
            return results

    def get_cached_run(self, prompt: str, asset: str) -> Optional[Dict[str, Any]]:
        coll = mongo_db.get_collection("strategy_history")
        if coll is not None:
            try:
                doc = coll.find_one(
                    {"prompt": {"$regex": f"^{prompt.strip()}$", "$options": "i"},
                     "asset": {"$regex": f"^{asset.strip()}$", "$options": "i"}},
                    {"_id": 0},
                    sort=[("timestamp", -1)]
                )
                if doc:
                    return doc
            except Exception as e:
                print(f"StrategyHistoryDB Mongo Cache Warning: {e}")

        # SQLite Fallback
        with self._get_sqlite_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM strategy_history WHERE LOWER(TRIM(prompt)) = LOWER(TRIM(?)) AND UPPER(TRIM(asset)) = UPPER(TRIM(?)) ORDER BY id DESC LIMIT 1",
                (prompt.strip(), asset.strip())
            )
            r = cursor.fetchone()
            if r:
                return {
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
        return None

    def clear_history(self):
        coll = mongo_db.get_collection("strategy_history")
        if coll is not None:
            try:
                coll.delete_many({})
            except Exception as e:
                print(f"StrategyHistoryDB Mongo Clear Warning: {e}")

        with self._get_sqlite_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM strategy_history")
            conn.commit()

strategy_db = StrategyHistoryDB()
