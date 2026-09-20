import json
import re
import time
import httpx
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings
from app.audit.strategy_store import strategy_db
from app.memory.store import memory_store
from app.agents.security import pii_anonymizer, guardrail_engine
from app.agents.cache import simhash_cache
from app.agents.system_knowledge import system_knowledge_store

class PersonalFinTechAssistant:
    """
    Context-Aware Personal AI Assistant for FinTech Agent OS.
    Features:
    - System Knowledge Memory: Authoritative operational manual stored in Redis/SQLite.
    - User Activity Integration: Pulls recent strategy backtest runs & audit verdicts from strategy_history.db.
    - Sliding Window Memory: Remembers last 5 chat turns per session in Redis/SQLite.
    - PII Anonymizer: Redacts emails, phones, secrets, and cards before inference.
    - SimHash Cache: Returns instant cached answers for semantically similar queries.
    - Strict Security Guardrails: Blocks prompt injection, jailbreaks, and out-of-domain requests.
    - Pure System Action Guides: Explains EXACTLY how to perform tasks on FinTech Agent OS screens (NO generic Python scripts).
    """
    def __init__(self):
        self.system_prompt_template = """
You are the FinTech Agent OS Personal Assistant, an expert quantitative financial intelligence AI.
Your sole job is to guide the user on how to use FinTech Agent OS, explain platform features, analyze backtest results, and clarify audit metrics.

[AUTHORITATIVE PLATFORM KNOWLEDGE BASE & OPERATIONAL MANUAL]
{system_knowledge_base}

[CURRENT USER CONTEXT & RECENT ACTIVITY]
{user_activity_context}

[CONVERSATION HISTORY (Last 5 Turns)]
{conversation_history}

[CRITICAL INSTRUCTION & BOUNDARIES]
1. NEVER output generic standalone Python scripts (e.g., 'import pandas', 'pd.read_csv', 'data.rolling()').
2. ALWAYS explain how the user can execute the task directly inside FinTech Agent OS using our actual screens, prompt input console, preset strategy chips, Wired Pipeline drawer, 3x3 Robustness Heatmap, SHA-256 Hash Ledger, and Holdout Vault.
3. ALWAYS reference our exact ticker symbols (e.g., 'GC=F' for Gold, 'BTC-USD', 'NVDA', 'SPY').
4. Keep responses structured, concise, and formatted in GitHub-style Markdown.
"""

    async def get_user_activity_summary(self) -> str:
        """Retrieves and formats recent strategy backtest runs from SQLite persistence database."""
        try:
            runs = strategy_db.get_all_runs()
            if not runs:
                return "No recent backtest runs recorded yet. User is currently exploring the platform."

            recent_runs = runs[:3]
            summary_lines = []
            for idx, r in enumerate(recent_runs, 1):
                summary_lines.append(
                    f"- Run #{idx} ({r.get('timestamp', 'N/A')}): Asset={r.get('asset')}, Strategy='{r.get('strategy_name')}', "
                    f"Prompt='{r.get('prompt')}', Sharpe={r.get('sharpe_ratio')}, Return={r.get('total_return')*100:.1f}%, "
                    f"MaxDD={r.get('max_drawdown')*100:.1f}%, WinRate={r.get('win_rate')*100:.1f}%"
                )
            return "User's Recent Activity Log:\n" + "\n".join(summary_lines)
        except Exception as e:
            return f"Activity context unavailable: {str(e)}"

    async def get_session_history(self, session_id: str) -> List[Dict[str, str]]:
        """Retrieves last 5 chat turns (max 10 messages) for the given session ID."""
        key = f"chat_history:{session_id}"
        data = await memory_store.get(key)
        if data and isinstance(data, list):
            return data[-10:]
        return []

    async def save_session_history(self, session_id: str, history: List[Dict[str, str]]) -> None:
        """Saves updated chat history (keeping max 10 messages) to memory store."""
        key = f"chat_history:{session_id}"
        trimmed = history[-10:]
        await memory_store.set(key, trimmed)

    async def generate_response(self, user_message: str, session_id: str = "default_user") -> Dict[str, Any]:
        """
        Executes end-to-end assistant pipeline:
        1. Validates query against GuardrailEngine (blocks jailbreaks/out-of-domain).
        2. Anonymizes PII in user message.
        3. Checks 64-bit SimHash Similarity Cache.
        4. Fetches system knowledge memory, user activity & 5-turn session memory.
        5. Invocates Featherless LLM (or fallback engine).
        6. Updates chat memory and returns response payload.
        """
        start_time = time.time()

        # Step 1: Guardrail Validation
        is_valid, violation_msg = guardrail_engine.validate_request(user_message)
        if not is_valid:
            return {
                "response": f"🔒 **Security Guardrail Active**: {violation_msg}\n\nAs the FinTech Agent OS Quantitative Assistant, I am strictly bounded to quantitative finance, trading strategies, overfitting audits, and platform navigation. How can I assist you with your strategy backtests or portfolio optimization today?",
                "cache_hit": False,
                "anonymized_query": user_message,
                "latency_ms": round((time.time() - start_time) * 1000, 2),
                "guardrail_status": "REJECTED"
            }

        # Step 2: PII Anonymization
        anonymized_query, redactions = pii_anonymizer.anonymize(user_message)

        # Step 3: Check SimHash Cache
        cached_result = await simhash_cache.get_similar(anonymized_query)
        if cached_result:
            payload, dist = cached_result
            return {
                "response": payload.get("response", ""),
                "cache_hit": True,
                "hamming_distance": dist,
                "anonymized_query": anonymized_query,
                "latency_ms": round((time.time() - start_time) * 1000, 2),
                "guardrail_status": "PASSED"
            }

        # Step 4: Retrieve Context & Memory
        system_knowledge = await system_knowledge_store.get_system_knowledge()
        user_activity = await self.get_user_activity_summary()
        history = await self.get_session_history(session_id)

        history_formatted = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in history]) if history else "No previous conversation history."

        system_prompt = self.system_prompt_template.format(
            system_knowledge_base=system_knowledge,
            user_activity_context=user_activity,
            conversation_history=history_formatted
        )

        # Step 5: Featherless LLM Execution
        llm_response = await self._call_featherless_llm(system_prompt, anonymized_query)

        # Post-Processing Filter: Eliminate generic python scripts ONLY if user wasn't asking for code/python/simhash/algorithms
        is_code_request = any(k in anonymized_query.lower() for k in ["code", "python", "script", "simhash", "algorithm", "prime"])
        if ("import pandas" in llm_response or "pd.read_csv" in llm_response or "data['close']" in llm_response) and not is_code_request:
            llm_response = self._generate_system_knowledge_fallback(anonymized_query)

        # Step 6: Update Memory & SimHash Cache
        history.append({"role": "user", "content": anonymized_query})
        history.append({"role": "assistant", "content": llm_response})
        try:
            await self.save_session_history(session_id, history)
        except Exception as e:
            print(f"[Assistant] Warning: Failed to save session history: {e}")

        response_payload = {
            "response": llm_response,
            "cache_hit": False,
            "anonymized_query": anonymized_query,
            "redactions_count": len(redactions),
            "latency_ms": round((time.time() - start_time) * 1000, 2),
            "guardrail_status": "PASSED"
        }

        # Cache response for future similar queries
        try:
            await simhash_cache.store(anonymized_query, response_payload)
        except Exception as e:
            print(f"[Assistant] Warning: Failed to store simhash cache: {e}")

        return response_payload


    async def _call_featherless_llm(self, system_prompt: str, user_query: str) -> str:
        """Submits prompt to Featherless LLM endpoint or uses system fallback generator."""
        if settings.FEATHERLESS_API_KEY:
            try:
                # Sanitize query against prompt injection control tokens
                clean_query = re.sub(r'(?i)<\|im_start\|>|<\|im_end\|>|\[SYSTEM\]|System:', '', user_query).strip()
                url = f"{settings.FEATHERLESS_BASE_URL.rstrip('/')}/chat/completions"
                headers = {
                    "Authorization": f"Bearer {settings.FEATHERLESS_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": settings.FEATHERLESS_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": clean_query}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 900,
                    "presence_penalty": 0.1,
                    "repetition_penalty": 1.1,
                    "stop": ["<|eot_id|>", "<|im_end|>", "</s>"]
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        res_json = resp.json()
                        raw_text = res_json["choices"][0]["message"]["content"].strip()
                        # Post-process to eliminate token repetition loops (e.g., false!!!!!!!!)
                        clean_text = re.sub(r'(!|\.|\?|-|=){3,}', r'\1\1', raw_text)
                        return clean_text
            except Exception as e:
                print(f"Featherless API call exception: {e}. Switching to system knowledge fallback.")

        # System knowledge fallback generator
        return self._generate_system_knowledge_fallback(user_query)

    def _generate_system_knowledge_fallback(self, query: str) -> str:
        """System operational manual action guide and technical knowledge engine for FinTech Agent OS."""
        q = query.lower()
        if "simhash" in q or "cache" in q or "hamming" in q:
            return r"""### ⚡ 64-Bit SimHash Similarity Cache Engine

**SimHash** is a locality-sensitive hashing (LSH) algorithm used in **FinTech Agent OS** to achieve **sub-millisecond (<1ms) response times** for semantically similar user queries.

#### 🛠️ How SimHash Works in FinTech Agent OS:
1. **Tokenization & Hash Vectoring**: Incoming text is normalized and split into 64-bit MD5 hashed word vectors.
2. **Fingerprint Summation**: Bits are weighted (`+1` for bit 1, `-1` for bit 0) across a 64-element array. If the final vector position is $> 0$, the corresponding bit is set to `1`.
3. **Hamming Distance Lookup**: When a new query arrives, its 64-bit fingerprint is XOR-matched against our cache index. If the **Hamming Distance ≤ 3** (meaning ≥ 95% semantic similarity), the cached response is served instantly!

```python
import hashlib
import re
from typing import List

class SimHashCache:
    def __init__(self, f_bits: int = 64, max_hamming_dist: int = 3):
        self.f_bits = f_bits
        self.max_hamming_dist = max_hamming_dist
        self.cache_index = []

    def compute_simhash(self, text: str) -> int:
        words = [w for w in re.sub(r'[^\w\s]', '', text.lower()).split() if len(w) > 2]
        v = [0] * self.f_bits
        for word in words:
            h = int(hashlib.md5(word.encode('utf-8')).hexdigest()[:16], 16)
            for i in range(self.f_bits):
                v[i] += 1 if ((h >> i) & 1) else -1
        
        fingerprint = 0
        for i in range(self.f_bits):
            if v[i] > 0:
                fingerprint |= (1 << i)
        return fingerprint

    def hamming_distance(self, hash1: int, hash2: int) -> int:
        return bin(hash1 ^ hash2).count('1')

    def get_similar(self, query: str):
        target_hash = self.compute_simhash(query)
        for cached_hash, payload in self.cache_index:
            if self.hamming_distance(target_hash, cached_hash) <= self.max_hamming_dist:
                return payload  # Instant Cache Hit!
        return None
```
"""
        elif "prime" in q:
            return """### 🔢 Prime Number Generation & Algorithmic Optimization

Here is an optimized Python implementation of the **Sieve of Eratosthenes** ($O(N \\log \\log N)$ complexity) for generating prime numbers to optimize performance profiling:

```python
def generate_primes(n: int) -> list[int]:
    \"\"\"Generates all prime numbers up to n using Sieve of Eratosthenes.\"\"\"
    if n < 2:
        return []
    sieve = [True] * (n + 1)
    sieve[0] = sieve[1] = False
    
    for p in range(2, int(n**0.5) + 1):
        if sieve[p]:
            for i in range(p * p, n + 1, p):
                sieve[i] = False
                
    return [p for p in range(2, n + 1) if sieve[p]]

# Example usage: Generate first primes up to 100
primes = generate_primes(100)
print(f"Generated {len(primes)} primes: {primes}")
```

#### 🚀 Applications in Quantitative Finance:
* **Null Universe Phase-Scrambling**: Prime period lengths prevent cyclical resonance in synthetic backtest data generators.
* **Hash Bucket Distribution**: Prime table sizing prevents collisions in high-frequency order book dictionaries.
"""
        elif "gold" in q or "bollinger" in q:
            return """### 🏆 How to Run a Bollinger Strategy on Gold (GC=F) in FinTech Agent OS

Here is the exact step-by-step guide to executing this strategy inside our system:

#### Step 1: Submit Strategy Prompt on Home Page (`/`)
1. Go to the **Home Page (`/`)**.
2. Locate the **Natural Language Strategy Console** at the top.
3. Type the following exact prompt into the input box:
   ```text
   Build a 20-period Bollinger Bands mean-reversion strategy on Gold (GC=F) with ATR position sizing
   ```
   *(Or simply click the `Bollinger Bands` preset prompt chip).*
4. Click **`⚡ Synthesize & Run Backtest`**.

#### Step 2: Observe Automated Pipeline Execution
1. The **NLP Synthesizer Agent** parses your prompt into an executable module DAG.
2. The **Wired Pipeline Drawer** lights up showing:
   `BollingerBandsModule (period=20, std_dev=2.0)` ➔ `ATRSizingModule (risk_pct=0.02)`.
3. The **Vectorized Engine** executes orders at **t+1 Open price** on historical Gold data (`GC=F`), deducting 5.0 bps transaction fees and 2.0 bps slippage.

#### Step 3: Analyze Recharts Interactive Performance Canvas
* **Performance Cards**: Review Total Return, Annualized Sharpe Ratio, Sortino Ratio, Max Drawdown, and Win Rate.
* **Equity Curve Chart**: Compare Portfolio Equity (Gold Line) vs Gold Buy & Hold Benchmark (Gray Line).
* **Drawdown Depth Chart**: Check percentage underwater drops over time.

#### Step 4: Audit Overfitting & Parameter Stability
1. Open **Robustness (`/robustness`)**: Inspect the **3x3 Parameter Sensitivity Heatmap** to confirm your 20-period lookback resides on a green parameter plateau.
2. Open **Audit (`/audit`)**: Inspect the **SHA-256 Write-Ahead Hash Ledger** and click **`🔓 REVEAL HOLDOUT DATA`** to run a one-time test on the 30% sealed out-of-sample vault.
"""
        elif "sharpe" in q or "dsr" in q:
            return """### 📊 Analyzing Sharpe Ratio & Deflated Sharpe Ratio (DSR) in FinTech Agent OS

1. **Annualized Sharpe Ratio**: Calculated on the Recharts Canvas as `Sharpe = (Excess Return) / Annualized Volatility`.
2. **Deflated Sharpe Ratio (DSR)**: Open the **Audit Center (`/audit`)**. The system reads your logged trial count (`N_eff`) from the **SHA-256 Ledger** to discount observed Sharpe ratio for trial variance.
3. **95% Confidence Intervals**: Derived from 500-iteration **Stationary Block Bootstrap** (Politis & Romano 1994).
"""
        elif "holdout" in q or "vault" in q:
            return """### 🔒 Using the 30% Atomic Cryptographic Holdout Vault

1. The system locks the final 24 months of market data in a sealed vault (`dev_end = 2023-12-31`).
2. Run your strategy iterations freely on the 70% In-Sample Dev partition.
3. When ready for final verification, go to **Audit (`/audit`)** or **Robustness (`/robustness`)** and click **`🔓 REVEAL HOLDOUT DATA`**.
4. The vault executes a one-time test on the frozen candidate and awards a final **`🛡️ VERIFIED` / `SURVIVES_HOLDOUT`** status if holdout performance degrades by `< 35%`.
"""
        else:
            return f"""### 🤖 FinTech Agent OS Personal Assistant

I have analyzed your query regarding **'{query}'**.

Here is how you can use FinTech Agent OS:
1. **Home (`/`)**: Enter natural language strategy prompts or click preset chips to run instant backtests.
2. **Markets (`/markets`)**: View live Bloomberg candlestick charts, technical indicators, and market boards.
3. **Research (`/research`)**: Build multi-module DAG strategy pipelines with custom signal and risk logic.
4. **Robustness (`/robustness`)**: Evaluate 3x3 parameter sensitivity heatmaps, transaction fee ladders, and ML market regimes.
5. **Audit (`/audit`)**: Inspect the SHA-256 cryptographic trial ledger and trigger 30% Holdout Vault reveals.
"""

# Global assistant instance
assistant = PersonalFinTechAssistant()
