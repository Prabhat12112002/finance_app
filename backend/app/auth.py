import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt

from app.config import settings

# ── Password hashing via PBKDF2-HMAC-SHA256 (stdlib, no C extensions needed) ──

def hash_password(password: str) -> str:
    """Return a salted PBKDF2-HMAC-SHA256 hash string: 'salt$hash'."""
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260_000)
    return f"{salt}${hashed.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify a plain password against a stored 'salt$hash' string."""
    try:
        salt, hash_hex = stored_hash.split("$", 1)
    except ValueError:
        return False
    expected = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), salt.encode(), 260_000)
    return hmac.compare_digest(expected.hex(), hash_hex)


# ── JWT via PyJWT ────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError:
        return None
