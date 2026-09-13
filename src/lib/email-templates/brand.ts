// Shared Totland brand styling for transactional + auth emails.
// Email clients need plain hex, so these mirror the app's warm felt palette.

export const brand = {
  cream: '#faf2e4',
  card: '#fffaf0',
  ink: '#4a3a30',
  inkSoft: '#7e6a5c',
  clay: '#d2683c',
  amber: '#f0b24a',
  border: '#e5d5bf',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Nunito', 'Avenir Next', 'Segoe UI', Arial, sans-serif",
  margin: '0',
  padding: '24px 0',
}

export const container = {
  backgroundColor: brand.card,
  border: `1px solid ${brand.border}`,
  borderRadius: '18px',
  padding: '32px 28px',
  maxWidth: '520px',
  margin: '0 auto',
}

export const brandMark = {
  fontSize: '13px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: brand.clay,
  fontWeight: 'bold' as const,
  margin: '0 0 6px',
}

export const tagline = {
  fontSize: '13px',
  color: brand.inkSoft,
  margin: '0 0 24px',
}

export const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: brand.ink,
  margin: '0 0 18px',
}

export const text = {
  fontSize: '15px',
  color: brand.inkSoft,
  lineHeight: '1.6',
  margin: '0 0 22px',
}

export const link = { color: brand.clay, textDecoration: 'underline' }

export const button = {
  backgroundColor: brand.clay,
  color: '#fffaf0',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  border: `1px solid ${brand.clay}`,
  borderRadius: '12px',
  padding: '14px 26px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const code = {
  fontSize: '30px',
  letterSpacing: '8px',
  fontWeight: 'bold' as const,
  color: brand.ink,
  backgroundColor: brand.cream,
  border: `1px solid ${brand.border}`,
  borderRadius: '12px',
  padding: '16px 20px',
  textAlign: 'center' as const,
  margin: '0 0 22px',
}

export const footer = {
  fontSize: '12px',
  color: '#a2907f',
  lineHeight: '1.6',
  margin: '28px 0 0',
  borderTop: `1px solid ${brand.border}`,
  paddingTop: '16px',
}

// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
export const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-card { background-color: #2b2119 !important; border-color: #4a3a30 !important; }
    .dm-head { color: #faf2e4 !important; }
    .dm-text { color: #d8c7b5 !important; }
    .dm-code { background-color: #241b15 !important; color: #faf2e4 !important; border-color: #4a3a30 !important; }
  }
  [data-ogsc] .dm-card { background-color: #2b2119 !important; }
  [data-ogsc] .dm-head { color: #faf2e4 !important; }
  [data-ogsc] .dm-text { color: #d8c7b5 !important; }
`
