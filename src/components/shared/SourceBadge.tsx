'use client'

import { ExternalLink } from 'lucide-react'

interface SourceBadgeProps {
  name: string
  verified?: boolean
  url?: string
}

export default function SourceBadge({ name, verified = false, url }: SourceBadgeProps) {
  const content = (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors"
      style={{
        borderColor: verified ? 'rgba(8,145,178,0.3)' : 'var(--border-md)',
        background: verified ? 'rgba(8,145,178,0.06)' : 'var(--bg-2)',
        color: verified ? 'var(--ai)' : 'var(--ink-lo)',
      }}
    >
      {verified && (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--ai)', flexShrink: 0 }}>
          <path d="M5 0L6.12 3.38H9.51L6.69 5.47L7.94 9L5 6.91L2.06 9L3.31 5.47L0.49 3.38H3.88L5 0Z" fill="currentColor" />
        </svg>
      )}
      {name}
      {url && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
    </span>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}
