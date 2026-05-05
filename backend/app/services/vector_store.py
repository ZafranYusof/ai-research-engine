from sentence_transformers import SentenceTransformer
from typing import Dict, List, Optional
import numpy as np
from app.core.config import settings


class VectorStore:
    """Local vector store using sentence-transformers + numpy.
    Can be swapped for Pinecone/Qdrant in production."""

    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.vectors: Dict[str, np.ndarray] = {}
        self.metadata: Dict[str, Dict] = {}

    def embed(self, text: str) -> np.ndarray:
        """Generate embedding for text."""
        return self.model.encode(text, normalize_embeddings=True)

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for multiple texts."""
        return self.model.encode(texts, normalize_embeddings=True, batch_size=32)

    def upsert(self, id: str, text: str, metadata: Optional[Dict] = None):
        """Store a vector with metadata."""
        embedding = self.embed(text)
        self.vectors[id] = embedding
        self.metadata[id] = metadata or {}

    def upsert_batch(self, items: List[Dict]):
        """Store multiple vectors. Each item: {id, text, metadata}."""
        texts = [item["text"] for item in items]
        embeddings = self.embed_batch(texts)

        for i, item in enumerate(items):
            self.vectors[item["id"]] = embeddings[i]
            self.metadata[item["id"]] = item.get("metadata", {})

    def search(self, query: str, top_k: int = 10, filter_fn=None) -> List[Dict]:
        """Search for similar vectors."""
        if not self.vectors:
            return []

        query_vec = self.embed(query)

        # Calculate cosine similarity
        scores = []
        for id, vec in self.vectors.items():
            if filter_fn and not filter_fn(self.metadata.get(id, {})):
                continue
            score = float(np.dot(query_vec, vec))
            scores.append({"id": id, "score": score, "metadata": self.metadata.get(id, {})})

        # Sort by score descending
        scores.sort(key=lambda x: x["score"], reverse=True)
        return scores[:top_k]

    def delete(self, id: str):
        """Remove a vector."""
        self.vectors.pop(id, None)
        self.metadata.pop(id, None)

    @property
    def count(self) -> int:
        return len(self.vectors)
