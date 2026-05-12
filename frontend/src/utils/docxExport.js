import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
} from 'docx'
import { saveAs } from 'file-saver'
import { formatCitation } from './citation'

/**
 * Split markdown-ish text into paragraphs.
 * Strips basic markdown syntax (#, *, _) so the DOCX reads cleanly.
 */
function splitParagraphs(text = '') {
  return String(text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(Boolean)
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true })],
  })
}

function body(text) {
  return new Paragraph({
    spacing: { after: 160, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text })],
  })
}

/**
 * Build and download a .docx for a research draft.
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.abstract]
 * @param {string} opts.body  main draft text (can be markdown-ish)
 * @param {Array<object>} [opts.citations] paper objects
 * @param {string} [opts.citationStyle] APA | MLA | Chicago | IEEE
 * @param {string} [opts.filename]
 */
export async function exportDraftToDocx({
  title = 'Research Draft',
  abstract = '',
  body: content = '',
  citations = [],
  citationStyle = 'APA',
  filename,
} = {}) {
  const children = []

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({ text: title, bold: true, size: 40 }),
      ],
    }),
  )

  // Abstract
  if (abstract) {
    children.push(heading('Abstract', HeadingLevel.HEADING_2))
    splitParagraphs(abstract).forEach(p => children.push(body(p)))
  }

  // Body
  children.push(heading('Body', HeadingLevel.HEADING_2))
  const paragraphs = splitParagraphs(content)
  if (paragraphs.length === 0) {
    children.push(body('(No content yet.)'))
  } else {
    paragraphs.forEach(p => children.push(body(p)))
  }

  // References
  if (Array.isArray(citations) && citations.length > 0) {
    children.push(heading('References', HeadingLevel.HEADING_2))
    citations.forEach((c) => {
      const line = formatCitation(c, citationStyle)
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          indent: { left: 360, hanging: 360 },
          children: [new TextRun({ text: line })],
        }),
      )
    })
  }

  const doc = new Document({
    creator: 'AI Research Engine',
    title,
    styles: {
      default: {
        document: { run: { font: 'Georgia', size: 24 } },
      },
    },
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  const safeTitle = (filename || title || 'research').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 60) || 'research'
  const dateTag = new Date().toISOString().slice(0, 10)
  saveAs(blob, filename ? filename : `${safeTitle}-${dateTag}.docx`)
}
