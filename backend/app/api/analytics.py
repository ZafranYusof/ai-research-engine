from fastapi import APIRouter
from app.db.mongodb import mongodb
from datetime import datetime

router = APIRouter()


@router.get("/overview")
async def get_overview():
    """Aggregate stats across all completed projects."""
    total_projects = await mongodb.projects.count_documents({})
    
    completed_projects = []
    cursor = mongodb.projects.find({"status": "completed"}, {"_id": 0})
    async for doc in cursor:
        completed_projects.append(doc)

    total_papers = 0
    total_words = 0
    scores = []
    total_duration = 0
    papers_by_source = {"semantic_scholar": 0, "arxiv": 0, "google_scholar": 0}

    for proj in completed_projects:
        results = proj.get("results", {}) or {}
        papers = results.get("papers", [])
        total_papers += len(papers)

        # Count papers by source
        for paper in papers:
            source = paper.get("source", "").lower().replace(" ", "_")
            if source in papers_by_source:
                papers_by_source[source] += 1

        # Words from report/synthesis
        report = results.get("report", "") or results.get("synthesis", "")
        if isinstance(report, str):
            total_words += len(report.split())

        # Score
        score = results.get("quality_score") or results.get("score")
        if score is not None:
            scores.append(float(score))

        # Duration
        duration = results.get("duration_seconds") or results.get("duration")
        if duration is not None:
            total_duration += float(duration)

    avg_score = round(sum(scores) / len(scores), 2) if scores else 0
    total_hours = round(total_duration / 3600, 2)

    return {
        "total_projects": total_projects,
        "total_papers": total_papers,
        "total_words": total_words,
        "avg_score": avg_score,
        "total_hours": total_hours,
        "papers_by_source": papers_by_source,
    }


@router.get("/papers-by-year")
async def get_papers_by_year():
    """Count papers grouped by publication year across all completed projects."""
    year_counts = {}

    cursor = mongodb.projects.find({"status": "completed"}, {"_id": 0, "results.papers": 1})
    async for doc in cursor:
        results = doc.get("results", {}) or {}
        papers = results.get("papers", [])
        for paper in papers:
            year = paper.get("year") or paper.get("publication_year")
            if year is not None:
                year = int(year)
                year_counts[year] = year_counts.get(year, 0) + 1

    data = [{"year": y, "count": c} for y, c in sorted(year_counts.items())]
    return data


@router.get("/themes-distribution")
async def get_themes_distribution():
    """Count theme occurrences across all completed projects, top 15."""
    theme_counts = {}

    cursor = mongodb.projects.find({"status": "completed"}, {"_id": 0, "results.themes": 1})
    async for doc in cursor:
        results = doc.get("results", {}) or {}
        themes = results.get("themes", []) or []
        for theme in themes:
            name = theme if isinstance(theme, str) else theme.get("name", str(theme))
            name = name.strip()
            if name:
                theme_counts[name] = theme_counts.get(name, 0) + 1

    sorted_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:15]
    return [{"theme": t, "count": c} for t, c in sorted_themes]


@router.get("/quality-over-time")
async def get_quality_over_time():
    """Quality scores for each completed project sorted by date."""
    data = []

    cursor = mongodb.projects.find({"status": "completed"}, {"_id": 0})
    async for doc in cursor:
        results = doc.get("results", {}) or {}
        score = results.get("quality_score") or results.get("score")
        if score is None:
            continue

        # Try to get date from results or project
        date = results.get("completed_at") or results.get("date") or doc.get("created_at")
        if date and isinstance(date, datetime):
            date = date.isoformat()
        elif date is None:
            date = ""

        data.append({
            "project_topic": doc.get("topic", "Unknown"),
            "score": float(score),
            "date": str(date),
        })

    # Sort by date
    data.sort(key=lambda x: x["date"])
    return data


@router.get("/research-velocity")
async def get_research_velocity():
    """Papers analyzed per project over time with duration."""
    data = []

    cursor = mongodb.projects.find({"status": "completed"}, {"_id": 0})
    async for doc in cursor:
        results = doc.get("results", {}) or {}
        papers = results.get("papers", [])
        duration = results.get("duration_seconds") or results.get("duration")

        date = results.get("completed_at") or results.get("date") or doc.get("created_at")
        if date and isinstance(date, datetime):
            date = date.isoformat()
        elif date is None:
            date = ""

        data.append({
            "project_topic": doc.get("topic", "Unknown"),
            "papers_count": len(papers),
            "duration_seconds": float(duration) if duration else 0,
            "date": str(date),
        })

    data.sort(key=lambda x: x["date"])
    return data


@router.get("/source-breakdown")
async def get_source_breakdown():
    """Papers by source across all completed projects."""
    source_counts = {}

    cursor = mongodb.projects.find({"status": "completed"}, {"_id": 0, "results.papers": 1})
    async for doc in cursor:
        results = doc.get("results", {}) or {}
        papers = results.get("papers", [])
        for paper in papers:
            source = paper.get("source", "Unknown")
            source_counts[source] = source_counts.get(source, 0) + 1

    return [{"source": s, "count": c} for s, c in sorted(source_counts.items(), key=lambda x: x[1], reverse=True)]
