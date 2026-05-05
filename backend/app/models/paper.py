from sqlalchemy import Column, String, Text, DateTime, Integer, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Paper(Base):
    __tablename__ = "papers"

    id = Column(String, primary_key=True)  # DOI or arxiv ID
    title = Column(String(500), nullable=False)
    abstract = Column(Text)
    authors = Column(JSON)  # List of author names
    year = Column(Integer)
    venue = Column(String(300))  # Journal/Conference
    doi = Column(String(100), unique=True, nullable=True)
    arxiv_id = Column(String(50), unique=True, nullable=True)
    url = Column(String(500))
    pdf_url = Column(String(500))
    citation_count = Column(Integer, default=0)
    reference_count = Column(Integer, default=0)
    fields_of_study = Column(JSON)
    tldr = Column(Text)  # AI-generated summary

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    embedding_id = Column(String(100))  # Vector store reference

    # Relationships
    sections = relationship("PaperSection", back_populates="paper")


class PaperSection(Base):
    __tablename__ = "paper_sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(String, ForeignKey("papers.id"))
    section_type = Column(String(50))  # intro, methodology, results, etc
    content = Column(Text)
    embedding_id = Column(String(100))

    paper = relationship("Paper", back_populates="sections")


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(300))
    topic = Column(Text)
    status = Column(String(50), default="active")  # active, completed, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    config = Column(JSON)  # search params, filters, etc


class GeneratedSection(Base):
    __tablename__ = "generated_sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id"))
    section_type = Column(String(50))
    content = Column(Text)
    citations = Column(JSON)  # List of paper IDs used
    version = Column(Integer, default=1)
    score = Column(Float)  # Quality score from critic agent
    created_at = Column(DateTime, default=datetime.utcnow)
