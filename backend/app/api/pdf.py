"""
PDF Upload & Parsing API
Handles PDF file uploads, text extraction, and integration with research pipeline.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from app.services.pdf_parser import PDFParserService, ParsedPaper
from app.services.activity import activity_service

router = APIRouter()
pdf_service = PDFParserService()

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


class PDFUploadResponse(BaseModel):
    success: bool
    filename: str
    metadata: dict
    sections_count: int
    references_count: int
    word_count: int
    pages: int


@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and parse a PDF research paper."""
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Read file content
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        parsed = await pdf_service.parse_pdf(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse PDF: {str(e)}")

    word_count = len(parsed.full_text.split())

    # Log activity
    await activity_service.log_activity(
        user_email="",
        action="pdf_uploaded",
        details=f"Uploaded PDF: {file.filename}",
    )

    return PDFUploadResponse(
        success=True,
        filename=file.filename,
        metadata={
            "title": parsed.metadata.title,
            "authors": parsed.metadata.authors,
            "abstract": parsed.metadata.abstract,
            "year": parsed.metadata.year,
            "doi": parsed.metadata.doi,
            "keywords": parsed.metadata.keywords,
        },
        sections_count=len(parsed.sections),
        references_count=len(parsed.references),
        word_count=word_count,
        pages=parsed.metadata.pages,
    )


@router.post("/parse-full")
async def parse_pdf_full(file: UploadFile = File(...)):
    """Upload and get full parsed content including sections and references."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    try:
        parsed = await pdf_service.parse_pdf(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse PDF: {str(e)}")

    return {
        "metadata": parsed.metadata.model_dump(),
        "sections": [s.model_dump() for s in parsed.sections],
        "references": parsed.references,
        "full_text": parsed.full_text,
        "figures_count": parsed.figures_count,
        "word_count": len(parsed.full_text.split()),
    }


@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Quick text extraction from PDF (no structured parsing)."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    try:
        text = await pdf_service.extract_text_only(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text: {str(e)}")

    return {
        "text": text,
        "word_count": len(text.split()),
        "char_count": len(text),
    }


@router.post("/batch-upload")
async def batch_upload(files: list[UploadFile] = File(...)):
    """Upload multiple PDFs and parse them all."""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files per batch")

    results = []
    errors = []

    for file in files:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            errors.append({"filename": file.filename or "unknown", "error": "Not a PDF"})
            continue

        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            errors.append({"filename": file.filename, "error": "File too large"})
            continue

        try:
            parsed = await pdf_service.parse_pdf(content, file.filename)
            results.append({
                "filename": file.filename,
                "title": parsed.metadata.title,
                "authors": parsed.metadata.authors,
                "abstract": parsed.metadata.abstract,
                "year": parsed.metadata.year,
                "sections_count": len(parsed.sections),
                "references_count": len(parsed.references),
                "word_count": len(parsed.full_text.split()),
            })
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})

    return {
        "parsed": results,
        "errors": errors,
        "total_parsed": len(results),
        "total_errors": len(errors),
    }
