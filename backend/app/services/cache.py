"""TTL cache for expensive operations."""
import hashlib
import json
from cachetools import TTLCache
from threading import Lock

# Paper search cache: key = query+sources+years, TTL = 30 min
_paper_cache = TTLCache(maxsize=256, ttl=1800)
_paper_lock = Lock()

# Graph stats cache: TTL = 5 min
_stats_cache = TTLCache(maxsize=32, ttl=300)
_stats_lock = Lock()


def _make_paper_key(query: str, sources: list, year_from: int = None, year_to: int = None) -> str:
    """Generate cache key from search params."""
    raw = json.dumps({
        "q": query.lower().strip(),
        "src": sorted(sources),
        "yf": year_from,
        "yt": year_to,
    }, sort_keys=True)
    return hashlib.md5(raw.encode()).hexdigest()


def get_paper_cache(query: str, sources: list, year_from: int = None, year_to: int = None):
    """Get cached paper search results. Returns None if miss."""
    key = _make_paper_key(query, sources, year_from, year_to)
    with _paper_lock:
        return _paper_cache.get(key)


def set_paper_cache(query: str, sources: list, year_from: int = None, year_to: int = None, results=None):
    """Cache paper search results."""
    key = _make_paper_key(query, sources, year_from, year_to)
    with _paper_lock:
        _paper_cache[key] = results


def get_stats_cache(key: str = "graph_stats"):
    """Get cached graph stats."""
    with _stats_lock:
        return _stats_cache.get(key)


def set_stats_cache(stats, key: str = "graph_stats"):
    """Cache graph stats."""
    with _stats_lock:
        _stats_cache[key] = stats
