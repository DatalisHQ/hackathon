import { Bot, User, Clock } from 'lucide-react'
import type { AuditEntry } from '../types'

interface Props {
  entries: AuditEntry[]
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function AuditTrail({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-text-dim">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Audit trail records every decision and action</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
        Audit Trail ({entries.length} events)
      </h2>

      <div className="space-y-1 font-mono text-xs">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-surface transition"
          >
            <span className="text-text-dim w-[72px] flex-shrink-0">
              {formatTimestamp(entry.timestamp)}
            </span>
            <span className={`flex-shrink-0 ${
              entry.actor === 'human' ? 'text-info' : 'text-accent'
            }`}>
              {entry.actor === 'human' ? (
                <User className="w-3.5 h-3.5 mt-0.5" />
              ) : (
                <Bot className="w-3.5 h-3.5 mt-0.5" />
              )}
            </span>
            <span className={`flex-shrink-0 w-[140px] ${
              entry.actor === 'human' ? 'text-info' : 'text-accent'
            }`}>
              {entry.action}
            </span>
            <span className="text-text-muted">{entry.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
