import re
from typing import Tuple, List, Dict, Any

class PIIAnonymizer:
    """
    Enterprise PII (Personally Identifiable Information) Anonymizer.
    Detects and redacts emails, phone numbers, credit card numbers, SSNs, IP addresses,
    and API secrets before passing queries to external LLMs or caches.
    """
    def __init__(self):
        self.patterns = [
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[REDACTED_EMAIL]'),
            (r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', '[REDACTED_PHONE]'),
            (r'\b(?:\d[ -]*?){13,16}\b', '[REDACTED_CARD]'),
            (r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED_SSN]'),
            (r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', '[REDACTED_IP]'),
            (r'(?i)(api[_-]?key|secret|password|bearer|auth[_-]?token)\s*[:=]\s*["\']?([A-Za-z0-9_\-]{16,})["\']?', r'\1: [REDACTED_SECRET]')
        ]

    def anonymize(self, text: str) -> Tuple[str, List[str]]:
        """Replaces PII patterns with redacted placeholders, returning anonymized text and audit list."""
        anonymized_text = text
        redactions = []
        for pattern, replacement in self.patterns:
            matches = re.findall(pattern, anonymized_text)
            if matches:
                redactions.extend([str(m) for m in matches])
                anonymized_text = re.sub(pattern, replacement, anonymized_text)
        return anonymized_text, redactions

class GuardrailEngine:
    """
    Strict Guardrails & Jailbreak Protection Engine.
    Detects prompt injection attempts, system prompt overrides, DAN mode,
    and out-of-domain requests (medical, legal advice, gaming, non-fintech topics).
    """
    JAILBREAK_PATTERNS = [
        r'(?i)ignore\s+(all\s+)?(previous|above|system)\s+instructions',
        r'(?i)you\s+are\s+now\s+in\s+dan\s+mode',
        r'(?i)do\s+anything\s+now',
        r'(?i)reveal\s+(your\s+)?system\s+prompt',
        r'(?i)bypass\s+(safety|guardrails|security)',
        r'(?i)act\s+as\s+an\s+(unrestricted|unfiltered|jailbroken)',
        r'(?i)disregard\s+all\s+(rules|constraints|system)',
        r'(?i)jailbreak',
        r'(?i)prompt\s+injection',
        r'(?i)<\|im_start\|>',
        r'(?i)\[system\s+prompt\]'
    ]

    OUT_OF_DOMAIN_PATTERNS = [
        r'(?i)\b(medical|doctor|diagnosis|prescription|cancer|treatment)\b',
        r'(?i)\b(legal\s+advice|sue|lawsuit|court\s+case|divorce)\b',
        r'(?i)\b(gaming|minecraft|fortnite|playstation|xbox|cheat\s+code)\b',
        r'(?i)\b(how\s+to\s+make\s+a\s+bomb|illegal|hack|malware)\b'
    ]

    def validate_request(self, text: str) -> Tuple[bool, str]:
        """
        Validates input query against security rules.
        Returns: (is_valid, violation_reason)
        """
        # Check for jailbreak / prompt injection
        for pattern in self.JAILBREAK_PATTERNS:
            if re.search(pattern, text):
                return False, "Prompt injection or system instruction override attempt detected."

        # Check for out-of-domain topics
        for pattern in self.OUT_OF_DOMAIN_PATTERNS:
            if re.search(pattern, text):
                return False, "FinTech Agent OS Assistant is restricted strictly to quantitative finance, trading strategies, overfitting audits, and platform navigation."

        return True, "OK"

# Global instances
pii_anonymizer = PIIAnonymizer()
guardrail_engine = GuardrailEngine()
