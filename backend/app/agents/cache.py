import hashlib
import re
from typing import Optional, Dict, Any, List, Tuple
from app.memory.store import memory_store

class SimHashCache:
    """
    64-Bit SimHash Similarity Cache for Instant Query Matching.
    Computes 64-bit SimHash fingerprints of user queries.
    If incoming query fingerprint has Hamming Distance <= 3 to a cached fingerprint,
    it returns the cached assistant response instantly without hitting LLM.
    """
    def __init__(self, f_bits: int = 64, max_hamming_dist: int = 3):
        self.f_bits = f_bits
        self.max_hamming_dist = max_hamming_dist
        self.in_memory_index: List[Tuple[int, Dict[str, Any]]] = []

    def _tokenize(self, text: str) -> List[str]:
        """Normalizes text and extracts word tokens."""
        clean = re.sub(r'[^\w\s]', '', text.lower()).strip()
        words = [w for w in clean.split() if len(w) > 2]
        return words or [clean]

    def _hash_token(self, token: str) -> int:
        """Computes 64-bit MD5 hash of a single word token."""
        return int(hashlib.md5(token.encode('utf-8')).hexdigest()[:16], 16)

    def compute_simhash(self, text: str) -> int:
        """Computes 64-bit SimHash fingerprint for input text."""
        tokens = self._tokenize(text)
        v = [0] * self.f_bits

        for token in tokens:
            h = self._hash_token(token)
            for i in range(self.f_bits):
                bit = (h >> i) & 1
                v[i] += 1 if bit else -1

        fingerprint = 0
        for i in range(self.f_bits):
            if v[i] > 0:
                fingerprint |= (1 << i)
        return fingerprint

    def hamming_distance(self, hash1: int, hash2: int) -> int:
        """Computes XOR popcount Hamming distance between two 64-bit SimHashes."""
        x = hash1 ^ hash2
        return bin(x).count('1')

    async def get_similar(self, query: str) -> Optional[Tuple[Dict[str, Any], int]]:
        """
        Looks up similar query in cache index with Hamming distance <= 3.
        Returns: (cached_response_payload, hamming_distance) or None.
        """
        target_hash = self.compute_simhash(query)

        # 1. Search in-memory index
        for cached_hash, payload in self.in_memory_index:
            resp_str = payload.get("response", "")
            if "import pandas" in resp_str or "pd.read_csv" in resp_str:
                continue
            dist = self.hamming_distance(target_hash, cached_hash)
            if dist <= self.max_hamming_dist:
                return payload, dist

        # 2. Search persistent memory store
        stored_cache = await memory_store.get("simhash_cache_index")
        if stored_cache and isinstance(stored_cache, list):
            for item in stored_cache:
                c_hash = item.get("hash")
                payload = item.get("payload")
                if c_hash is not None and payload is not None:
                    resp_str = payload.get("response", "")
                    if "import pandas" in resp_str or "pd.read_csv" in resp_str:
                        continue
                    dist = self.hamming_distance(target_hash, c_hash)
                    if dist <= self.max_hamming_dist:
                        # Update in-memory index
                        self.in_memory_index.append((c_hash, payload))
                        return payload, dist

        return None

    async def store(self, query: str, response_payload: Dict[str, Any]) -> None:
        """Stores query SimHash and response payload in cache."""
        query_hash = self.compute_simhash(query)
        entry = (query_hash, response_payload)
        
        self.in_memory_index.append(entry)
        if len(self.in_memory_index) > 200:
            self.in_memory_index = self.in_memory_index[-200:]  # Keep max 200 items

        # Persist index
        serializable_list = [{"hash": h, "payload": p} for h, p in self.in_memory_index]
        await memory_store.set("simhash_cache_index", serializable_list)

# Global SimHash cache instance
simhash_cache = SimHashCache()
