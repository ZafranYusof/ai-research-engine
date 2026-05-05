from sentence_transformers import SentenceTransformer
from typing import Dict, List, Optional
import numpy as np
import json
import os
from app.core.config import settings


class VectorStore:
    """Local vector store using sentence-transformers + numpy.
    Persists to disk for durability between restarts."""

    def __init__(self, persist_dir: str = "./data/vectors"):
        self.persist_dir = persist_dir
        os.makedirs(persist_dir, exist_ok=True)
        
        self._model = None  # Lazy load
        self.vectors: Dict[str, np.ndarray] = {}
        self.metadata: Dict[str, Dict] = {}
        
        # Load from disk if exists
        self._load()

    @property
    def model(self):
        """Lazy load the embedding model."""
        if self._model is None:
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return self._model

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
        self._save()

    def upsert_batch(self, items: List[Dict]):
        """Store multiple vectors. Each item: {id, text, metadata}."""
        if not items:
            return
            
        texts = [item["text"] for item in items]
        embeddings = self.embed_batch(texts)

        for i, item in enumerate(items):
            self.vectors[item["id"]] = embeddings[i]
            self.metadata[item["id"]] = item.get("metadata", {})
        
        self._save()

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
        self._save()

    @property
    def count(self) -> int:
        return len(self.vectors)

    def _save(self):
        """Persist vectors to disk."""
        if self.vectors:
            np.savez(
                os.path.join(self.persist_dir, "vectors.npz"),
                **{k: v for k, v in self.vectors.items()}
            )
        
        with open(os.path.join(self.persist_dir, "metadata.json"), "w") as f:
            json.dump(self.metadata, f)

    def _load(self):
        """Load vectors from disk."""
        vectors_path = os.path.join(self.persist_dir, "vectors.npz")
        metadata_path = os.path.join(self.persist_dir, "metadata.json")
        
        if os.path.exists(vectors_path):
            data = np.load(vectors_path)
            self.vectors = {k: data[k] for k in data.files}
        
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                self.metadata = json.load(f)
