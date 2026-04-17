#!/usr/bin/env python3
"""
Secure logging utilities for redacting secrets and PII from logs.
Based on 2026 industry best practices from LangChain, OpenAI, and LangSmith.
"""

import os
import re
from typing import Dict, List, Optional


class SecretsFilter:
    """
    Filter that redacts secrets and PII from log messages.

    Implements LangSmith-style anonymization with regex-based detection.
    """

    def __init__(self, additional_patterns: Optional[Dict[str, str]] = None):
        """
        Initialize the secrets filter.

        Args:
            additional_patterns: Dict of {name: regex_pattern} for custom secrets
        """
        # Default patterns for common secrets
        self.patterns = {
            # Passwords (common formats)
            "PASSWORD": r"password[:\s=]+['\"]?([^\s'\"]+)['\"]?",

            # Email addresses
            "EMAIL": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",

            # API Keys (various formats)
            "API_KEY": r"(?:api[_-]?key|apikey|token)[:\s=]+['\"]?([a-zA-Z0-9_\-]{20,})['\"]?",

            # AWS Keys
            "AWS_ACCESS_KEY": r"(?:AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}",

            # Generic secrets (sk_, secret_)
            "SECRET_KEY": r"(?:sk|secret)[_-]?[a-zA-Z0-9]{20,}",

            # Phone numbers (US format)
            "PHONE": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",

            # SSN
            "SSN": r"\b\d{3}-\d{2}-\d{4}\b",

            # Credit card numbers
            "CREDIT_CARD": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
        }

        # Add custom patterns
        if additional_patterns:
            self.patterns.update(additional_patterns)

        # Environment variable values to redact
        self.env_secrets = self._load_env_secrets()

    def _load_env_secrets(self) -> List[str]:
        """
        Load secret values from environment variables for redaction.

        Returns:
            List of secret values to redact
        """
        secret_vars = [
            "LIGHTCONE_PASSWORD",
            "LIGHTCONE_EMAIL",
            "TZAFON_API_KEY",
            "OPENAI_API_KEY",
            "ANTHROPIC_API_KEY",
            # Add more as needed
        ]

        secrets = []
        for var in secret_vars:
            value = os.getenv(var)
            if value and len(value) > 3:  # Only redact non-trivial values
                secrets.append(value)

        return secrets

    def redact(self, text: str, placeholder: str = "***REDACTED***") -> str:
        """
        Redact secrets from text using pattern matching and env var replacement.

        Args:
            text: Text to redact
            placeholder: Replacement text for secrets

        Returns:
            Text with secrets redacted
        """
        if not text:
            return text

        redacted = text

        # First, redact known environment variable values
        for secret in self.env_secrets:
            if secret in redacted:
                redacted = redacted.replace(secret, placeholder)

        # Then apply regex patterns
        for name, pattern in self.patterns.items():
            redacted = re.sub(
                pattern,
                f"[{name}_{placeholder}]",
                redacted,
                flags=re.IGNORECASE
            )

        return redacted

    def redact_dict(self, data: dict, placeholder: str = "***REDACTED***") -> dict:
        """
        Recursively redact secrets from dictionary values.

        Args:
            data: Dictionary to redact
            placeholder: Replacement text for secrets

        Returns:
            Dictionary with secrets redacted
        """
        redacted = {}
        for key, value in data.items():
            if isinstance(value, str):
                redacted[key] = self.redact(value, placeholder)
            elif isinstance(value, dict):
                redacted[key] = self.redact_dict(value, placeholder)
            elif isinstance(value, list):
                redacted[key] = [
                    self.redact(item, placeholder) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                redacted[key] = value
        return redacted


def create_safe_preview(text: str, max_length: int = 200, secrets_filter: Optional[SecretsFilter] = None) -> str:
    """
    Create a safe preview of text with secrets redacted.

    Args:
        text: Text to preview
        max_length: Maximum length of preview
        secrets_filter: Optional SecretsFilter instance (creates new if None)

    Returns:
        Safe preview text with secrets redacted
    """
    if secrets_filter is None:
        secrets_filter = SecretsFilter()

    # Redact secrets first
    safe_text = secrets_filter.redact(text)

    # Then truncate
    if len(safe_text) > max_length:
        safe_text = safe_text[:max_length] + "..."

    return safe_text
