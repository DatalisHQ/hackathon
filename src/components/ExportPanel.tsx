import { Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react'
import type { Mission } from '../types'

interface Props {
  mission: Mission
}

function generateCSV(mission: Mission): string {
  const headers = ['Company', 'Contact', 'Title', 'Email', 'Website', 'Location', 'Score', 'Score Reason', 'Personalisation Hooks', 'Status']
  const rows = mission.leads
    .sort((a, b) => b.score - a.score)
    .map(l => [
      l.company,
      l.contact,
      l.title,
      l.email,
      l.website,
      l.location,
      l.score.toString(),
      l.scoreReason,
      l.personalisationHooks.join('; '),
      l.status,
    ].map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  
  return [headers.join(','), ...rows].join('\n')
}

function generateOutreachPack(mission: Mission): string {
  let md = `# Outreach Pack\n\n`
  md += `**Mission:** ${mission.config.niche} — ${mission.config.location}\n`
  md += `**Generated:** ${new Date(mission.createdAt).toLocaleString()}\n`
  md += `**Leads:** ${mission.leads.length} found, ${mission.leads.filter(l => l.score >= 60).length} qualified\n\n`
  md += `---\n\n`

  const byLead = new Map<string, typeof mission.messages>()
  for (const msg of mission.messages) {
    const existing = byLead.get(msg.leadId) || []
    existing.push(msg)
    byLead.set(msg.leadId, existing)
  }

  for (const [leadId, msgs] of byLead) {
    const lead = mission.leads.find(l => l.id === leadId)
    if (!lead) continue
    
    md += `## ${lead.company}\n`
    md += `**Contact:** ${lead.contact} (${lead.title})\n`
    md += `**Email:** ${lead.email}\n`
    md += `**Score:** ${lead.score}/100\n`
    md += `**Hooks:** ${lead.personalisationHooks.join(', ')}\n\n`
    
    for (const msg of msgs) {
      md += `### ${msg.followUpDay ? `Follow-up (Day ${msg.followUpDay})` : 'Initial Outreach'}\n`
      md += `**Subject:** ${msg.subject}\n\n`
      md += `${msg.body}\n\n`
    }
    md += `---\n\n`
  }

  return md
}

function generateReport(mission: Mission): string {
  const qualified = mission.leads.filter(l => l.score >= 60)
  const avgScore = mission.leads.length > 0 
    ? (mission.leads.reduce((s, l) => s + l.score, 0) / mission.leads.length).toFixed(1)
    : '0'
  
  let md = `# Mission Report\n\n`
  md += `## Overview\n`
  md += `- **Target:** ${mission.config.niche} in ${mission.config.location}\n`
  md += `- **Offer:** ${mission.config.offer}\n`
  md += `- **Autonomy:** ${mission.config.autonomy}\n`
  md += `- **Status:** ${mission.status}\n`
  md += `- **Created:** ${new Date(mission.createdAt).toLocaleString()}\n`
  if (mission.completedAt) {
    md += `- **Completed:** ${new Date(mission.completedAt).toLocaleString()}\n`
    md += `- **Duration:** ${((mission.completedAt - mission.createdAt) / 1000).toFixed(0)}s\n`
  }
  md += `\n## Results\n`
  md += `- **Leads found:** ${mission.leads.length}\n`
  md += `- **Qualified (60+):** ${qualified.length}\n`
  md += `- **Average score:** ${avgScore}\n`
  md += `- **Messages drafted:** ${mission.messages.length}\n`
  md += `- **Audit events:** ${mission.audit.length}\n`
  md += `\n## Execution Steps\n\n`
  
  for (const step of mission.steps) {
    const icon = step.status === 'completed' ? '✅' : step.status === 'failed' ? '❌' : step.status === 'approved' ? '✅' : '⏳'
    md += `${icon} **${step.title}** — ${step.detail}`
    if (step.duration) md += ` (${(step.duration / 1000).toFixed(1)}s)`
    md += `\n`
  }
  
  md += `\n## Audit Trail\n\n`
  md += `| Time | Actor | Action | Detail |\n|------|-------|--------|--------|\n`
  for (const entry of mission.audit) {
    md += `| ${new Date(entry.timestamp).toLocaleTimeString()} | ${entry.actor} | ${entry.action} | ${entry.detail} |\n`
  }

  return md
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportPanel({ mission }: Props) {
  const exports = [
    {
      icon: <FileSpreadsheet className="w-5 h-5" />,
      label: 'Lead List (CSV)',
      description: 'All discovered leads with scores, hooks, and contact details',
      filename: 'leads.csv',
      disabled: mission.leads.length === 0,
      onClick: () => downloadFile(generateCSV(mission), 'leads.csv', 'text/csv'),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Outreach Pack (Markdown)',
      description: 'All drafted messages organised by lead, ready to send',
      filename: 'outreach-pack.md',
      disabled: mission.messages.length === 0,
      onClick: () => downloadFile(generateOutreachPack(mission), 'outreach-pack.md', 'text/markdown'),
    },
    {
      icon: <FileCode className="w-5 h-5" />,
      label: 'Mission Report (Markdown)',
      description: 'Full execution report with steps, results, and audit trail',
      filename: 'mission-report.md',
      disabled: false,
      onClick: () => downloadFile(generateReport(mission), 'mission-report.md', 'text/markdown'),
    },
    {
      icon: <FileCode className="w-5 h-5" />,
      label: 'Raw Data (JSON)',
      description: 'Complete mission data — leads, messages, audit, config',
      filename: 'mission-data.json',
      disabled: false,
      onClick: () => downloadFile(JSON.stringify(mission, null, 2), 'mission-data.json', 'application/json'),
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
        Export Artefacts
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {exports.map(exp => (
          <button
            key={exp.filename}
            onClick={exp.onClick}
            disabled={exp.disabled}
            className={`flex items-start gap-3 p-4 rounded-lg border text-left transition ${
              exp.disabled
                ? 'border-border bg-surface opacity-50 cursor-not-allowed'
                : 'border-border bg-surface hover:border-accent/30 hover:bg-accent/5 cursor-pointer'
            }`}
          >
            <div className="text-accent flex-shrink-0 mt-0.5">{exp.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">{exp.label}</span>
                <Download className="w-3 h-3 text-text-dim" />
              </div>
              <p className="text-xs text-text-muted mt-0.5">{exp.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
