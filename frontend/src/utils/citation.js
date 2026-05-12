// Citation formatting utilities — APA, MLA, Chicago, IEEE
// Best-effort formatting given partial paper metadata.

export const CITATION_STYLES = ['APA', 'MLA', 'Chicago', 'IEEE']

const normalizeAuthors = (authors) => {
  if (!authors) return []
  if (Array.isArray(authors)) return authors.filter(Boolean)
  if (typeof authors === 'string') return authors.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

const splitName = (name) => {
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return { first: '', last: parts[0] }
  const last = parts.pop()
  return { first: parts.join(' '), last }
}

const initials = (first) =>
  first
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(p => p[0].toUpperCase() + '.')
    .join(' ')

// "Last, F. M."
const apaAuthor = (name) => {
  const { first, last } = splitName(name)
  return first ? `${last}, ${initials(first)}` : last
}

// "Last, First Middle"
const mlaChicagoAuthor = (name, invert = true) => {
  const { first, last } = splitName(name)
  if (!first) return last
  return invert ? `${last}, ${first}` : `${first} ${last}`
}

// "F. M. Last"
const ieeeAuthor = (name) => {
  const { first, last } = splitName(name)
  return first ? `${initials(first)} ${last}` : last
}

const joinAuthorsAPA = (authors) => {
  const list = authors.map(apaAuthor)
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]}, & ${list[1]}`
  if (list.length <= 20) return `${list.slice(0, -1).join(', ')}, & ${list[list.length - 1]}`
  return `${list.slice(0, 19).join(', ')}, ... ${list[list.length - 1]}`
}

const joinAuthorsMLA = (authors) => {
  if (authors.length === 0) return ''
  if (authors.length === 1) return mlaChicagoAuthor(authors[0])
  if (authors.length === 2) return `${mlaChicagoAuthor(authors[0])}, and ${mlaChicagoAuthor(authors[1], false)}`
  return `${mlaChicagoAuthor(authors[0])}, et al`
}

const joinAuthorsChicago = (authors) => {
  if (authors.length === 0) return ''
  if (authors.length === 1) return mlaChicagoAuthor(authors[0])
  if (authors.length <= 3) {
    const rest = authors.slice(1).map(a => mlaChicagoAuthor(a, false))
    return `${mlaChicagoAuthor(authors[0])}, ${rest.slice(0, -1).concat(`and ${rest[rest.length - 1]}`).join(', ')}`
  }
  return `${mlaChicagoAuthor(authors[0])}, et al.`
}

const joinAuthorsIEEE = (authors) => {
  const list = authors.map(ieeeAuthor)
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]
  if (list.length <= 6) return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`
  return `${list.slice(0, 3).join(', ')}, et al.`
}

const doiUrl = (doi) => {
  if (!doi) return ''
  const clean = String(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
  return `https://doi.org/${clean}`
}

const volIssuePages = (paper) => {
  const v = paper.volume || ''
  const i = paper.issue || ''
  const p = paper.pages || ''
  return { v, i, p }
}

export function formatCitation(paper = {}, style = 'APA') {
  const authors = normalizeAuthors(paper.authors)
  const year = paper.year || 'n.d.'
  const title = (paper.title || 'Untitled').replace(/\s*\.?$/, '')
  const journal = paper.journal || paper.venue || ''
  const { v, i, p } = volIssuePages(paper)
  const doi = paper.doi ? doiUrl(paper.doi) : ''

  switch ((style || 'APA').toUpperCase()) {
    case 'MLA': {
      const a = joinAuthorsMLA(authors)
      const parts = []
      if (a) parts.push(`${a}.`)
      parts.push(`"${title}."`)
      if (journal) {
        let j = `*${journal}*`
        if (v) j += `, vol. ${v}`
        if (i) j += `, no. ${i}`
        if (year && year !== 'n.d.') j += `, ${year}`
        if (p) j += `, pp. ${p}`
        parts.push(`${j}.`)
      } else if (year && year !== 'n.d.') {
        parts.push(`${year}.`)
      }
      if (doi) parts.push(doi)
      return parts.join(' ').trim()
    }

    case 'CHICAGO': {
      const a = joinAuthorsChicago(authors)
      const parts = []
      if (a) parts.push(`${a}.`)
      if (year) parts.push(`${year}.`)
      parts.push(`"${title}."`)
      if (journal) {
        let j = `*${journal}*`
        if (v) j += ` ${v}`
        if (i) j += `, no. ${i}`
        if (p) j += `: ${p}`
        parts.push(`${j}.`)
      }
      if (doi) parts.push(doi)
      return parts.join(' ').trim()
    }

    case 'IEEE': {
      const a = joinAuthorsIEEE(authors)
      const parts = []
      if (a) parts.push(`${a},`)
      parts.push(`"${title},"`)
      if (journal) {
        let j = `*${journal}*`
        if (v) j += `, vol. ${v}`
        if (i) j += `, no. ${i}`
        if (p) j += `, pp. ${p}`
        if (year && year !== 'n.d.') j += `, ${year}`
        parts.push(`${j}.`)
      } else if (year && year !== 'n.d.') {
        parts.push(`${year}.`)
      }
      if (doi) parts.push(doi)
      return parts.join(' ').trim()
    }

    case 'APA':
    default: {
      const a = joinAuthorsAPA(authors)
      const parts = []
      if (a) parts.push(`${a}`)
      parts.push(`(${year}).`)
      parts.push(`${title}.`)
      if (journal) {
        let j = `*${journal}*`
        if (v) j += `, ${v}`
        if (i) j += `(${i})`
        if (p) j += `, ${p}`
        parts.push(`${j}.`)
      }
      if (doi) parts.push(doi)
      // APA convention: author followed by year in parens, no comma
      return parts.join(' ').replace(/ +/g, ' ').trim()
    }
  }
}

const STORAGE_KEY = 'are_cite_style'

export function getPreferredStyle() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && CITATION_STYLES.includes(v)) return v
  } catch {
    /* ignore */
  }
  return 'APA'
}

export function setPreferredStyle(style) {
  try {
    if (CITATION_STYLES.includes(style)) {
      localStorage.setItem(STORAGE_KEY, style)
    }
  } catch {
    /* ignore */
  }
}
