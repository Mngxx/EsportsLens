import functools
import time
from typing import Callable

# In-memory only — persists per warm Lambda container, not across cold starts.

# Registered here so tests can reset every store at once (see conftest.py).
_all_stores: list[dict] = []


def clear_all() -> None:
    for store in _all_stores:
        store.clear()


def ttl_cache(seconds: int) -> Callable:
    def decorator(func: Callable) -> Callable:
        store: dict[tuple, tuple[float, object]] = {}
        _all_stores.append(store)

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            now = time.monotonic()

            cached = store.get(key)
            if cached is not None:
                expires_at, value = cached
                if now < expires_at:
                    return value

            value = func(*args, **kwargs)
            store[key] = (now + seconds, value)
            return value

        wrapper.cache_clear = store.clear
        return wrapper

    return decorator
