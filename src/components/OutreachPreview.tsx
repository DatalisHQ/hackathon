import { Mail, Clock, CheckCircle2, Send } from 'lucide-react'
import type { OutreachMessage, Lead } from '../types'

interface Props {
  messages: OutreachMessage[]
  leads: Lead[]
  selectedLeadId?: string
}

function StatusBadge({ status }: { status: OutreachMessage['status'] }) {
  const styles: Record<OutreachMessage['status'], { color: string; icon: React.ReactNode; label: string }> = {
    draft: { color: 'text-text-dim bg-surface-2', icon: <Clock className="w-3 h-3" />, label: 'Draft' },
    approved: { color: 'text-success bg-success/10', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Approved' },
    queued: { color: 'text-info bg-info/10', icon: <Send className="w-3 h-3" />, label: 'Queued' },
    sent: { color: 'text-success bg-success/10', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Sent' },
  }
  const s = styles[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${s.color}`}>
      {s.icon} {s.label}
    </span>
  )
}

export function OutreachPreview({ messages, leads, selectedLeadId }: Props) {
  const filteredMessages = selectedLeadId
    ? messages.filter(m => m.leadId === selectedLeadId)
    : messages

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    return lead ? `${lead.contact} @ ${lead.company}` : 'Unknown'
  }

  if (filteredMessages.length === 0) {
    return (
      <div className="text-center py-12 text-text-dim">
        <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {selectedLeadId 
            ? 'No messages drafted for this lead yet' 
            : 'Messages will appear here as the agent drafts them'
          }
        </p>
      </div>
    )
  }

  // Group by lead
  const byLead = new Map<string, OutreachMessage[]>()
  for (const msg of filteredMessages) {
    const existing = byLead.get(msg.leadId) || []
    existing.push(msg)
    byLead.set(msg.leadId, existing)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
        Outreach ({filteredMessages.length} messages)
      </h2>

      <div className="space-y-4">
        {Array.from(byLead.entries()).map(([leadId, msgs]) => (
          <div key={leadId} className="border border-border rounded-lg overflow-hidden">
            {/* Lead header */}
            <div className="bg-surface-2 px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-text">{getLeadName(leadId)}</span>
              <span className="text-xs text-text-dim">{msgs.length} messages</span>
            </div>
            
            {/* Messages */}
            <div className="divide-y divide-border">
              {msgs.map(msg => (
                <div key={msg.id} className="p-4 bg-surface">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-text-dim" />
                      <span className="text-xs font-medium text-text-muted">
                        {msg.followUpDay ? `Follow-up (Day ${msg.followUpDay})` : 'Initial outreach'}
                      </span>
                    </div>
                    <StatusBadge status={msg.status} />
                  </div>
                  
                  <div className="bg-surface-2 rounded-lg p-3 border border-border">
                    <div className="text-xs text-text-muted mb-1">
                      Subject: <span className="text-text">{msg.subject}</span>
                    </div>
                    <div className="text-sm text-text whitespace-pre-wrap leading-relaxed mt-2">
                      {msg.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
