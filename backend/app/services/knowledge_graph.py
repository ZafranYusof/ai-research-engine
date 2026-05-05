from neo4j import AsyncGraphDatabase
from typing import Dict, List, Optional
from app.core.config import settings


class KnowledgeGraphService:
    """Service for managing the research knowledge graph in Neo4j."""

    def __init__(self):
        self.driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )

    async def close(self):
        await self.driver.close()

    async def add_paper(self, paper: Dict):
        """Add a paper node to the graph."""
        query = """
        MERGE (p:Paper {id: $id})
        SET p.title = $title,
            p.year = $year,
            p.venue = $venue,
            p.citation_count = $citation_count,
            p.abstract = $abstract
        WITH p
        UNWIND $authors AS author_name
        MERGE (a:Author {name: author_name})
        MERGE (a)-[:AUTHORED]->(p)
        """
        async with self.driver.session() as session:
            await session.run(query, **paper)

    async def add_citation(self, citing_id: str, cited_id: str):
        """Add a citation relationship between papers."""
        query = """
        MATCH (citing:Paper {id: $citing_id})
        MATCH (cited:Paper {id: $cited_id})
        MERGE (citing)-[:CITES]->(cited)
        """
        async with self.driver.session() as session:
            await session.run(query, citing_id=citing_id, cited_id=cited_id)

    async def add_theme(self, theme: str, paper_ids: List[str]):
        """Add a theme node connected to relevant papers."""
        query = """
        MERGE (t:Theme {name: $theme})
        WITH t
        UNWIND $paper_ids AS pid
        MATCH (p:Paper {id: pid})
        MERGE (p)-[:RELATES_TO]->(t)
        """
        async with self.driver.session() as session:
            await session.run(query, theme=theme, paper_ids=paper_ids)

    async def get_paper_network(self, paper_id: str, depth: int = 2) -> Dict:
        """Get citation network around a paper."""
        query = """
        MATCH path = (p:Paper {id: $paper_id})-[:CITES*1..$depth]-(related:Paper)
        RETURN p, related, relationships(path) as rels
        LIMIT 100
        """
        async with self.driver.session() as session:
            result = await session.run(query, paper_id=paper_id, depth=depth)
            records = await result.data()
            return self._format_network(records)

    async def get_theme_clusters(self) -> List[Dict]:
        """Get all themes with their connected papers."""
        query = """
        MATCH (t:Theme)<-[:RELATES_TO]-(p:Paper)
        RETURN t.name as theme, collect({id: p.id, title: p.title, year: p.year}) as papers
        ORDER BY size(collect(p)) DESC
        """
        async with self.driver.session() as session:
            result = await session.run(query)
            return await result.data()

    async def find_bridge_papers(self) -> List[Dict]:
        """Find papers that connect different theme clusters (high betweenness)."""
        query = """
        MATCH (p:Paper)-[:RELATES_TO]->(t:Theme)
        WITH p, collect(DISTINCT t.name) as themes
        WHERE size(themes) > 1
        RETURN p.id as id, p.title as title, themes
        ORDER BY size(themes) DESC
        LIMIT 20
        """
        async with self.driver.session() as session:
            result = await session.run(query)
            return await result.data()

    async def get_author_collaboration_network(self) -> Dict:
        """Get co-authorship network."""
        query = """
        MATCH (a1:Author)-[:AUTHORED]->(p:Paper)<-[:AUTHORED]-(a2:Author)
        WHERE a1.name < a2.name
        RETURN a1.name as author1, a2.name as author2, count(p) as collaborations
        ORDER BY collaborations DESC
        LIMIT 50
        """
        async with self.driver.session() as session:
            result = await session.run(query)
            return await result.data()

    def _format_network(self, records: List) -> Dict:
        """Format Neo4j records into graph visualization format."""
        nodes = {}
        edges = []

        for record in records:
            for key in ["p", "related"]:
                if key in record and record[key]:
                    node = record[key]
                    nodes[node.get("id")] = {
                        "id": node.get("id"),
                        "title": node.get("title"),
                        "year": node.get("year"),
                    }

        return {"nodes": list(nodes.values()), "edges": edges}
