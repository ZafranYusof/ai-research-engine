"""
Knowledge Graph Service - Phase 3
Uses NetworkX for local graph (no Neo4j dependency needed for dev).
Can swap to Neo4j for production.
"""
import networkx as nx
from typing import Dict, List, Optional
import json
import os


# Singleton instance
_kg_instance = None


def get_kg_service() -> 'KnowledgeGraphService':
    """Get singleton KnowledgeGraphService instance."""
    global _kg_instance
    if _kg_instance is None:
        _kg_instance = KnowledgeGraphService()
    return _kg_instance


class KnowledgeGraphService:
    """Local knowledge graph using NetworkX. Persists to disk."""

    def __init__(self, persist_path: str = "./data/knowledge_graph.json"):
        self.persist_path = persist_path
        os.makedirs(os.path.dirname(persist_path), exist_ok=True)
        self.graph = nx.DiGraph()
        self._load()

    def add_paper(self, paper: Dict):
        """Add a paper node to the graph."""
        paper_id = paper.get("id", "")
        self.graph.add_node(
            paper_id,
            type="paper",
            title=paper.get("title", ""),
            year=paper.get("year"),
            venue=paper.get("venue", ""),
            citation_count=paper.get("citation_count", 0),
            abstract=paper.get("abstract", "")[:300],
        )

        # Add author nodes and edges
        for author in paper.get("authors", []):
            author_id = f"author:{author}"
            self.graph.add_node(author_id, type="author", name=author)
            self.graph.add_edge(author_id, paper_id, relation="authored")

        self._save()

    def add_papers_batch(self, papers: List[Dict]):
        """Add multiple papers at once."""
        for paper in papers:
            paper_id = paper.get("id", "")
            self.graph.add_node(
                paper_id,
                type="paper",
                title=paper.get("title", ""),
                year=paper.get("year"),
                venue=paper.get("venue", ""),
                citation_count=paper.get("citation_count", 0),
                abstract=paper.get("abstract", "")[:300],
            )
            for author in paper.get("authors", []):
                author_id = f"author:{author}"
                self.graph.add_node(author_id, type="author", name=author)
                self.graph.add_edge(author_id, paper_id, relation="authored")
        self._save()

    def add_citation(self, citing_id: str, cited_id: str):
        """Add a citation relationship between papers."""
        self.graph.add_edge(citing_id, cited_id, relation="cites")
        self._save()

    def add_theme(self, theme: str, paper_ids: List[str], description: str = ""):
        """Add a theme node connected to relevant papers."""
        theme_id = f"theme:{theme}"
        self.graph.add_node(theme_id, type="theme", name=theme, description=description)
        for pid in paper_ids:
            if self.graph.has_node(pid):
                self.graph.add_edge(pid, theme_id, relation="relates_to")
        self._save()

    def add_themes_batch(self, themes: List[Dict], papers: List[Dict]):
        """Add themes and connect to papers based on relevance."""
        paper_ids = [p.get("id", "") for p in papers]
        for theme_data in themes:
            theme_name = theme_data.get("theme", "")
            theme_id = f"theme:{theme_name}"
            self.graph.add_node(
                theme_id,
                type="theme",
                name=theme_name,
                description=theme_data.get("description", ""),
            )
            # Connect all papers to theme (simplified; could use relevance scoring)
            for pid in paper_ids:
                if self.graph.has_node(pid):
                    self.graph.add_edge(pid, theme_id, relation="relates_to")
        self._save()

    def get_paper_network(self, paper_id: str, depth: int = 2) -> Dict:
        """Get network around a paper node."""
        if not self.graph.has_node(paper_id):
            return {"nodes": [], "links": []}

        # BFS to get nearby nodes
        nodes = set()
        edges = []
        queue = [(paper_id, 0)]
        visited = {paper_id}

        while queue:
            current, d = queue.pop(0)
            nodes.add(current)

            if d < depth:
                # Get neighbors (both directions)
                for neighbor in list(self.graph.successors(current)) + list(self.graph.predecessors(current)):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, d + 1))
                        nodes.add(neighbor)

                    # Add edge
                    if self.graph.has_edge(current, neighbor):
                        edge_data = self.graph.edges[current, neighbor]
                        edges.append({
                            "source": current,
                            "target": neighbor,
                            "relation": edge_data.get("relation", "related"),
                        })
                    if self.graph.has_edge(neighbor, current):
                        edge_data = self.graph.edges[neighbor, current]
                        edges.append({
                            "source": neighbor,
                            "target": current,
                            "relation": edge_data.get("relation", "related"),
                        })

        # Format nodes
        formatted_nodes = []
        for nid in nodes:
            data = self.graph.nodes[nid]
            formatted_nodes.append({
                "id": nid,
                "type": data.get("type", "unknown"),
                "label": data.get("title") or data.get("name") or nid,
                **{k: v for k, v in data.items() if k not in ("type",)},
            })

        return {"nodes": formatted_nodes, "links": edges}

    def get_full_graph(self) -> Dict:
        """Get the entire graph for visualization."""
        nodes = []
        for nid, data in self.graph.nodes(data=True):
            nodes.append({
                "id": nid,
                "type": data.get("type", "unknown"),
                "label": data.get("title") or data.get("name") or nid,
                "year": data.get("year"),
                "citation_count": data.get("citation_count", 0),
            })

        links = []
        for source, target, data in self.graph.edges(data=True):
            links.append({
                "source": source,
                "target": target,
                "relation": data.get("relation", "related"),
            })

        return {"nodes": nodes, "links": links}

    def get_theme_clusters(self) -> List[Dict]:
        """Get all themes with their connected papers."""
        clusters = []
        for nid, data in self.graph.nodes(data=True):
            if data.get("type") == "theme":
                # Get papers connected to this theme
                papers = []
                for pred in self.graph.predecessors(nid):
                    pred_data = self.graph.nodes[pred]
                    if pred_data.get("type") == "paper":
                        papers.append({
                            "id": pred,
                            "title": pred_data.get("title", ""),
                            "year": pred_data.get("year"),
                        })
                clusters.append({
                    "theme": data.get("name", ""),
                    "description": data.get("description", ""),
                    "papers": papers,
                    "paper_count": len(papers),
                })
        return clusters

    def find_bridge_papers(self) -> List[Dict]:
        """Find papers that connect different theme clusters (high betweenness)."""
        paper_nodes = [n for n, d in self.graph.nodes(data=True) if d.get("type") == "paper"]

        if len(paper_nodes) < 2:
            return []

        # Calculate betweenness centrality for paper nodes only
        subgraph = self.graph.subgraph(paper_nodes)
        if subgraph.number_of_edges() == 0:
            # Use theme connections instead
            bridges = []
            for pid in paper_nodes:
                themes = [
                    self.graph.nodes[t].get("name", "")
                    for t in self.graph.successors(pid)
                    if self.graph.nodes[t].get("type") == "theme"
                ]
                if len(themes) > 1:
                    bridges.append({
                        "id": pid,
                        "title": self.graph.nodes[pid].get("title", ""),
                        "themes": themes,
                        "bridge_score": len(themes),
                    })
            return sorted(bridges, key=lambda x: x["bridge_score"], reverse=True)[:10]

        centrality = nx.betweenness_centrality(subgraph)
        bridges = []
        for pid, score in sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:10]:
            data = self.graph.nodes[pid]
            bridges.append({
                "id": pid,
                "title": data.get("title", ""),
                "betweenness_score": round(score, 4),
            })
        return bridges

    def get_author_collaboration_network(self) -> Dict:
        """Get co-authorship network."""
        author_nodes = [n for n, d in self.graph.nodes(data=True) if d.get("type") == "author"]

        collaborations = {}
        for author_id in author_nodes:
            # Find papers this author wrote
            papers = [t for t in self.graph.successors(author_id)
                     if self.graph.nodes[t].get("type") == "paper"]

            for paper_id in papers:
                # Find co-authors
                coauthors = [p for p in self.graph.predecessors(paper_id)
                           if self.graph.nodes[p].get("type") == "author" and p != author_id]

                for coauthor_id in coauthors:
                    pair = tuple(sorted([author_id, coauthor_id]))
                    collaborations[pair] = collaborations.get(pair, 0) + 1

        # Format
        collab_list = []
        for (a1, a2), count in sorted(collaborations.items(), key=lambda x: x[1], reverse=True)[:50]:
            collab_list.append({
                "author1": self.graph.nodes[a1].get("name", a1),
                "author2": self.graph.nodes[a2].get("name", a2),
                "collaborations": count,
            })

        return {"collaborations": collab_list}

    def get_pagerank(self, top_n: int = 20) -> List[Dict]:
        """Compute PageRank on paper subgraph and return top N papers."""
        paper_nodes = [n for n, d in self.graph.nodes(data=True) if d.get("type") == "paper"]

        if len(paper_nodes) < 2:
            # Return all papers with equal score if too few
            results = []
            for pid in paper_nodes:
                data = self.graph.nodes[pid]
                themes = [
                    self.graph.nodes[t].get("name", "")
                    for t in self.graph.successors(pid)
                    if self.graph.nodes[t].get("type") == "theme"
                ]
                results.append({
                    "id": pid,
                    "title": data.get("title", ""),
                    "score": 1.0,
                    "citation_count": data.get("citation_count", 0),
                    "year": data.get("year"),
                    "connected_themes": themes,
                })
            return results

        # Build subgraph of papers + citation edges
        subgraph = self.graph.subgraph(paper_nodes).copy()

        # If no edges between papers, use full graph for PageRank
        if subgraph.number_of_edges() == 0:
            pr = nx.pagerank(self.graph, alpha=0.85)
        else:
            pr = nx.pagerank(subgraph, alpha=0.85)

        # Sort papers by PageRank score
        paper_scores = [(pid, pr.get(pid, 0)) for pid in paper_nodes]
        paper_scores.sort(key=lambda x: x[1], reverse=True)

        results = []
        for pid, score in paper_scores[:top_n]:
            data = self.graph.nodes[pid]
            themes = [
                self.graph.nodes[t].get("name", "")
                for t in self.graph.successors(pid)
                if self.graph.nodes[t].get("type") == "theme"
            ]
            results.append({
                "id": pid,
                "title": data.get("title", ""),
                "score": round(score, 6),
                "citation_count": data.get("citation_count", 0),
                "year": data.get("year"),
                "connected_themes": themes,
            })

        return results

    def get_influential_papers(self, top_n: int = 10) -> List[Dict]:
        """Find most influential papers combining PageRank + betweenness + degree centrality."""
        paper_nodes = [n for n, d in self.graph.nodes(data=True) if d.get("type") == "paper"]

        if len(paper_nodes) < 2:
            return [{
                "id": pid,
                "title": self.graph.nodes[pid].get("title", ""),
                "combined_score": 1.0,
                "pagerank": 1.0,
                "betweenness": 0.0,
                "degree": 0.0,
                "reason": "Only paper in graph",
            } for pid in paper_nodes]

        # Compute centrality metrics on full graph (papers interact via themes/authors)
        pr = nx.pagerank(self.graph, alpha=0.85)
        betweenness = nx.betweenness_centrality(self.graph)
        degree = nx.degree_centrality(self.graph)

        # Normalize and combine scores for paper nodes only
        paper_metrics = []
        for pid in paper_nodes:
            paper_metrics.append({
                "id": pid,
                "pagerank": pr.get(pid, 0),
                "betweenness": betweenness.get(pid, 0),
                "degree": degree.get(pid, 0),
            })

        # Normalize each metric to [0, 1]
        if paper_metrics:
            max_pr = max(m["pagerank"] for m in paper_metrics) or 1
            max_bt = max(m["betweenness"] for m in paper_metrics) or 1
            max_dg = max(m["degree"] for m in paper_metrics) or 1

            for m in paper_metrics:
                m["norm_pr"] = m["pagerank"] / max_pr
                m["norm_bt"] = m["betweenness"] / max_bt
                m["norm_dg"] = m["degree"] / max_dg
                # Weighted combination: PageRank 40%, Betweenness 35%, Degree 25%
                m["combined_score"] = round(
                    0.4 * m["norm_pr"] + 0.35 * m["norm_bt"] + 0.25 * m["norm_dg"], 4
                )

        # Sort by combined score
        paper_metrics.sort(key=lambda x: x["combined_score"], reverse=True)

        results = []
        for m in paper_metrics[:top_n]:
            data = self.graph.nodes[m["id"]]
            # Generate reason
            reasons = []
            if m["norm_pr"] > 0.7:
                reasons.append("High PageRank (many papers reference it)")
            if m["norm_bt"] > 0.7:
                reasons.append("High betweenness (bridges different research clusters)")
            if m["norm_dg"] > 0.7:
                reasons.append("High connectivity (connected to many nodes)")
            if not reasons:
                reasons.append("Balanced influence across metrics")

            results.append({
                "id": m["id"],
                "title": data.get("title", ""),
                "combined_score": m["combined_score"],
                "pagerank": round(m["pagerank"], 6),
                "betweenness": round(m["betweenness"], 6),
                "degree": round(m["degree"], 6),
                "citation_count": data.get("citation_count", 0),
                "year": data.get("year"),
                "reason": "; ".join(reasons),
            })

        return results

    def get_stats(self) -> Dict:
        """Get graph statistics."""
        node_types = {}
        for _, data in self.graph.nodes(data=True):
            t = data.get("type", "unknown")
            node_types[t] = node_types.get(t, 0) + 1

        return {
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
            "node_types": node_types,
            "density": round(nx.density(self.graph), 4) if self.graph.number_of_nodes() > 1 else 0,
        }

    def _save(self):
        """Persist graph to disk."""
        data = nx.node_link_data(self.graph)
        with open(self.persist_path, "w") as f:
            json.dump(data, f)

    def _load(self):
        """Load graph from disk."""
        if os.path.exists(self.persist_path):
            with open(self.persist_path, "r") as f:
                data = json.load(f)
                self.graph = nx.node_link_graph(data, directed=True)

    def clear(self):
        """Clear the graph."""
        self.graph.clear()
        self._save()
