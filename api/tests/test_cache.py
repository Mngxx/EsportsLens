from unittest.mock import patch

from cache import ttl_cache


def test_ttl_cache_returns_cached_value_within_ttl():
    calls = []

    @ttl_cache(seconds=300)
    def fn(x):
        calls.append(x)
        return x * 2

    assert fn(5) == 10
    assert fn(5) == 10
    assert calls == [5]  # second call served from cache, fn body never re-ran


def test_ttl_cache_distinguishes_different_args():
    calls = []

    @ttl_cache(seconds=300)
    def fn(x):
        calls.append(x)
        return x * 2

    fn(1)
    fn(2)
    assert calls == [1, 2]


def test_ttl_cache_recomputes_after_expiry():
    calls = []

    @ttl_cache(seconds=300)
    def fn(x):
        calls.append(x)
        return x * 2

    with patch("cache.time.monotonic", return_value=1000.0):
        fn(5)
    with patch("cache.time.monotonic", return_value=1000.0 + 301):
        fn(5)

    assert calls == [5, 5]


def test_ttl_cache_clear_forces_recompute():
    calls = []

    @ttl_cache(seconds=300)
    def fn(x):
        calls.append(x)
        return x * 2

    fn(5)
    fn.cache_clear()
    fn(5)

    assert calls == [5, 5]
