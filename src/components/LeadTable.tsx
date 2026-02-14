import { ExternalLink, TrendingUp } from 'lucide-react'
import type { Lead } from '../types'

interface Props {
  leads: Lead[]
  selectedLeadId?: string
  onSelect?: (leadId: string) => void
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-success bg-success/10 border-success/30'
    : score >= 60 ? 'text-warning bg-warning/10 border-warning/30'
    : 'text-text-dim bg-surface-2 border-border'
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${color}`}>
      {score}
    </span>
  )
}

function StatusDot({ status }: { status: Lead['status'] }) {
  const colors: Record<Lead['status'], string> = {
    found: 'bg-text-dim',
    scored: 'bg-info',
    enriched: 'bg-accent',
    drafted: 'bg-warning',
    queued: 'bg-success',
    sent: 'bg-success',
    replied: 'bg-emerald-400',
    rejected: 'bg-danger',
  }
  return <div className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
}

export function LeadTable({ leads, selectedLeadId, onSelect }: Props) {
  const sorted = [...leads].sort((a, b) => b.score - a.score)

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-text-dim">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Leads will appear here as the agent discovers them</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
          Leads ({leads.length})
        </h2>
        <div className="flex items-center gap-3 text-xs text-text-dim">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> 80+</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" /> 60-79</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-text-dim inline-block" /> &lt;60</span>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2 text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2 font-medium">Company</th>
                <th className="text-left px-3 py-2 font-medium">Contact</th>
                <th className="text-left px-3 py-2 font-medium">Location</th>
                <th className="text-center px-3 py-2 font-medium">Score</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                <th className="text-left px-3 py-2 font-medium">Key Hook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => onSelect?.(lead.id)}
                  className={`transition cursor-pointer ${
                    selectedLeadId === lead.id 
                      ? 'bg-accent/5' 
                      : 'hover:bg-surface-2'
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{lead.company}</span>
                      {lead.website && (
                        <ExternalLink className="w-3 h-3 text-text-dim" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div>
                      <span className="text-text">{lead.contact}</span>
                      <span className="text-text-dim text-xs block">{lead.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-text-muted">{lead.location}</td>
                  <td className="px-3 py-2.5 text-center">
                    {lead.score > 0 ? <ScoreBadge score={lead.score} /> : <span className="text-text-dim">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={lead.status} />
                      <span className="text-text-muted text-xs capitalize">{lead.status}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-text-muted text-xs max-w-[200px] truncate">
                    {lead.personalisationHooks[0] || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
