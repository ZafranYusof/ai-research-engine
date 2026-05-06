"""
PDF Parser Service
Extracts full text, metadata, sections, and references from academic PDFs.
Uses PyMuPDF (fitz) for text extraction and pdfplumber for table extraction.
"""

import fitz  # PyMuPDF
import re
import io
from typing import Optional
from pydantic import BaseModel


class PaperMetadata(BaseModel):
    title: Optional[str] = None
    authors: list[str] = []
    abstract: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    keywords: list[str] = []
    pages: int = 0


class PaperSection(BaseModel):
    heading: str
    content: str
    level: int = 1


class ParsedPaper(BaseModel):
    metadata: PaperMetadata
    sections: list[PaperSection] = []
    full_text: str = ""
    references: list[str] = []
    tables: list[dict] = []
    figures_count: int = 0


class PDFParserService:
    """Service for parsing academic PDF papers."""

    # Common section headings in academic papers
    SECTION_PATTERNS = [
        r"^(?:\d+\.?\s*)?(?:ABSTRACT|Abstract)\s*$",
        r"^(?:\d+\.?\s*)?(?:INTRODUCTION|Introduction)\s*$",
        r"^(?:\d+\.?\s*)?(?:RELATED\s+WORK|Related\s+Work|LITERATURE\s+REVIEW|Literature\s+Review)\s*$",
        r"^(?:\d+\.?\s*)?(?:BACKGROUND|Background)\s*$",
        r"^(?:\d+\.?\s*)?(?:METHOD(?:OLOGY)?|Method(?:ology)?|APPROACH|Approach)\s*$",
        r"^(?:\d+\.?\s*)?(?:EXPERIMENT(?:S)?|Experiment(?:s)?)\s*$",
        r"^(?:\d+\.?\s*)?(?:RESULTS?|Results?)\s*$",
        r"^(?:\d+\.?\s*)?(?:DISCUSSION|Discussion)\s*$",
        r"^(?:\d+\.?\s*)?(?:CONCLUSION(?:S)?|Conclusion(?:s)?)\s*$",
        r"^(?:\d+\.?\s*)?(?:REFERENCES?|References?|BIBLIOGRAPHY|Bibliography)\s*$",
        r"^(?:\d+\.?\s*)?(?:APPENDIX|Appendix|APPENDICES|Appendices)\s*$",
    ]

    # Pattern to detect numbered section headings (e.g., "1. Introduction", "2.1 Methods")
    NUMBERED_HEADING = re.compile(r"^(\d+(?:\.\d+)*)\s+(.+)$")

    # DOI pattern
    DOI_PATTERN = re.compile(r"10\.\d{4,}/[^\s]+")

    # Year pattern
    YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")

    # Reference patterns
    REF_PATTERNS = [
        # [1] Author et al. (2020). Title...
        re.compile(r"^\[\d+\]\s*.+"),
        # Author, A. B. (2020). Title...
        re.compile(r"^[A-Z][a-z]+,\s*[A-Z]\..*\(\d{4}\)"),
    ]

    async def parse_pdf(self, file_content: bytes, filename: str = "") -> ParsedPaper:
        """Parse a PDF file and extract structured content."""
        doc = fitz.open(stream=file_content, filetype="pdf")

        # Extract full text
        full_text = ""
        page_texts = []
        figures_count = 0

        for page in doc:
            text = page.get_text("text")
            page_texts.append(text)
            full_text += text + "\n\n"

            # Count images/figures
            figures_count += len(page.get_images())

        # Extract metadata
        metadata = self._extract_metadata(doc, full_text, page_texts)

        # Extract sections
        sections = self._extract_sections(full_text)

        # Extract references
        references = self._extract_references(full_text)

        doc.close()

        return ParsedPaper(
            metadata=metadata,
            sections=sections,
            full_text=full_text.strip(),
            references=references,
            figures_count=figures_count,
        )

    def _extract_metadata(
        self, doc: fitz.Document, full_text: str, page_texts: list[str]
    ) -> PaperMetadata:
        """Extract paper metadata from PDF."""
        # Get PDF metadata
        pdf_meta = doc.metadata or {}

        # Title: try PDF metadata first, then first large text on page 1
        title = pdf_meta.get("title", "").strip()
        if not title or title.lower() in ["untitled", ""]:
            title = self._extract_title_from_text(doc)

        # Authors
        authors = []
        author_str = pdf_meta.get("author", "")
        if author_str:
            # Split by common separators
            authors = [a.strip() for a in re.split(r"[,;]|\band\b", author_str) if a.strip()]

        if not authors:
            authors = self._extract_authors_from_text(page_texts[0] if page_texts else "")

        # Abstract
        abstract = self._extract_abstract(full_text)

        # DOI
        doi_match = self.DOI_PATTERN.search(full_text[:3000])
        doi = doi_match.group(0) if doi_match else None

        # Year
        year = None
        year_matches = self.YEAR_PATTERN.findall(full_text[:2000])
        if year_matches:
            # Pick the most likely year (usually appears early)
            years = [int(f"{m}") for m in year_matches]
            # Filter reasonable years
            years = [y for y in years if 1990 <= y <= 2030]
            if years:
                year = max(years)  # Most recent year is usually publication year

        # Keywords
        keywords = self._extract_keywords(full_text)

        return PaperMetadata(
            title=title,
            authors=authors,
            abstract=abstract,
            year=year,
            doi=doi,
            keywords=keywords,
            pages=doc.page_count,
        )

    def _extract_title_from_text(self, doc: fitz.Document) -> str:
        """Extract title by finding the largest text on page 1."""
        if doc.page_count == 0:
            return ""

        page = doc[0]
        blocks = page.get_text("dict")["blocks"]

        # Find text with largest font size
        max_size = 0
        title_text = ""

        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    if span["size"] > max_size and len(span["text"].strip()) > 5:
                        max_size = span["size"]
                        title_text = span["text"].strip()

        # Sometimes title spans multiple lines with same font size
        title_parts = []
        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    if abs(span["size"] - max_size) < 0.5 and span["text"].strip():
                        title_parts.append(span["text"].strip())

        if title_parts:
            return " ".join(title_parts[:3])  # Max 3 lines for title
        return title_text

    def _extract_authors_from_text(self, first_page: str) -> list[str]:
        """Try to extract authors from the first page text."""
        lines = first_page.split("\n")
        authors = []

        # Authors usually appear after title, before abstract
        # Look for lines with names (capitalized words, possibly with affiliations)
        in_author_zone = False
        for i, line in enumerate(lines[:20]):  # Check first 20 lines
            line = line.strip()
            if not line:
                if in_author_zone:
                    break
                continue

            # Skip if it looks like a section heading or abstract
            if re.match(r"^(Abstract|ABSTRACT|Introduction|Keywords)", line):
                break

            # Heuristic: author lines often have multiple capitalized names
            if i > 0 and re.match(r"^[A-Z][a-z]+ [A-Z]", line):
                in_author_zone = True
                # Split by comma or "and"
                parts = re.split(r",|\band\b", line)
                for part in parts:
                    part = part.strip()
                    # Remove affiliations (numbers, superscripts)
                    part = re.sub(r"\d+|\*|†|‡", "", part).strip()
                    if part and len(part) > 3:
                        authors.append(part)

        return authors[:10]  # Max 10 authors

    def _extract_abstract(self, full_text: str) -> Optional[str]:
        """Extract abstract from paper text."""
        # Look for "Abstract" heading
        patterns = [
            r"(?:^|\n)\s*(?:ABSTRACT|Abstract)\s*\n(.*?)(?=\n\s*(?:\d+\.?\s*)?(?:INTRODUCTION|Introduction|Keywords|KEYWORDS|1\s))",
            r"(?:^|\n)\s*(?:ABSTRACT|Abstract)\s*[-—:.]?\s*\n?(.*?)(?=\n\s*(?:\d+\.?\s*)?(?:INTRODUCTION|Introduction|Keywords|KEYWORDS|1\s))",
        ]

        for pattern in patterns:
            match = re.search(pattern, full_text, re.DOTALL)
            if match:
                abstract = match.group(1).strip()
                # Clean up
                abstract = re.sub(r"\s+", " ", abstract)
                if 50 < len(abstract) < 3000:
                    return abstract

        return None

    def _extract_keywords(self, full_text: str) -> list[str]:
        """Extract keywords from paper."""
        patterns = [
            r"(?:Keywords?|KEY\s*WORDS?)\s*[:—-]?\s*(.+?)(?:\n\n|\n\d|\n[A-Z]{2,})",
        ]

        for pattern in patterns:
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                kw_text = match.group(1).strip()
                # Split by common separators
                keywords = re.split(r"[;,·•]|\s{2,}", kw_text)
                keywords = [k.strip().strip(".") for k in keywords if k.strip() and len(k.strip()) > 2]
                return keywords[:15]

        return []

    def _extract_sections(self, full_text: str) -> list[PaperSection]:
        """Extract paper sections based on headings."""
        lines = full_text.split("\n")
        sections = []
        current_heading = None
        current_content = []
        current_level = 1

        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                if current_heading:
                    current_content.append("")
                continue

            # Check if this line is a section heading
            is_heading = False
            heading_level = 1

            # Check against known patterns
            for pattern in self.SECTION_PATTERNS:
                if re.match(pattern, line_stripped):
                    is_heading = True
                    break

            # Check numbered headings
            if not is_heading:
                num_match = self.NUMBERED_HEADING.match(line_stripped)
                if num_match:
                    num_part = num_match.group(1)
                    heading_text = num_match.group(2)
                    # Must be short enough to be a heading
                    if len(heading_text) < 100 and heading_text[0].isupper():
                        is_heading = True
                        heading_level = num_part.count(".") + 1

            # Check ALL CAPS short lines (common heading style)
            if not is_heading and line_stripped.isupper() and 3 < len(line_stripped) < 60:
                is_heading = True

            if is_heading:
                # Save previous section
                if current_heading:
                    content = "\n".join(current_content).strip()
                    if content:
                        sections.append(PaperSection(
                            heading=current_heading,
                            content=content,
                            level=current_level,
                        ))

                current_heading = line_stripped
                current_content = []
                current_level = heading_level
            else:
                current_content.append(line_stripped)

        # Save last section
        if current_heading:
            content = "\n".join(current_content).strip()
            if content:
                sections.append(PaperSection(
                    heading=current_heading,
                    content=content,
                    level=current_level,
                ))

        return sections

    def _extract_references(self, full_text: str) -> list[str]:
        """Extract reference list from paper."""
        # Find references section
        ref_start = None
        patterns = [
            r"\n\s*(?:REFERENCES?|References?|BIBLIOGRAPHY|Bibliography)\s*\n",
        ]

        for pattern in patterns:
            match = re.search(pattern, full_text)
            if match:
                ref_start = match.end()
                break

        if ref_start is None:
            return []

        ref_text = full_text[ref_start:]
        references = []

        # Try numbered references [1], [2], etc.
        numbered_refs = re.split(r"\n\s*\[\d+\]\s*", ref_text)
        if len(numbered_refs) > 2:
            for ref in numbered_refs[1:]:  # Skip first empty split
                ref = ref.strip()
                ref = re.sub(r"\s+", " ", ref)
                if ref and len(ref) > 20:
                    references.append(ref)
            return references[:200]

        # Try line-by-line (each reference starts with author name)
        lines = ref_text.split("\n")
        current_ref = ""

        for line in lines:
            line = line.strip()
            if not line:
                if current_ref:
                    references.append(current_ref.strip())
                    current_ref = ""
                continue

            # Check if this starts a new reference
            if re.match(r"^[A-Z][a-z]+,?\s", line) and current_ref:
                references.append(current_ref.strip())
                current_ref = line
            else:
                current_ref += " " + line

        if current_ref:
            references.append(current_ref.strip())

        # Filter out non-references (too short, etc.)
        references = [r for r in references if len(r) > 30]
        return references[:200]

    async def extract_text_only(self, file_content: bytes) -> str:
        """Quick extraction of just the full text."""
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n\n"
        doc.close()
        return text.strip()
