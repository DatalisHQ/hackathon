import { useState } from 'react'
import { Play, Pause, RotateCcw, Download, Activity, Users, Mail, ScrollText, Shield, Zap, Loader2 } from 'lucide-react'
import { useMissionStore } from '../store/mission'
import { RunFeed } from './RunFeed'
import { LeadTable } from './LeadTable'
import { OutreachPreview } from './OutreachPreview'
import { AuditTrail } from './AuditTrail'
import { ExportPanel } from './ExportPanel'

type Tab = 'feed' | 'leads' | 'outreach' | 'audit' | 'export'

const AUTONOMY_LABELS = {
  suggest: { label: 'Suggest', color: 'text-blue-400', icon: <Shield className="w-3.5 h-3.5" /> },
  copilot: { label: 'Co-pilot', color: 'text-amber-400', icon: <Users className="w-3.5 h-3.5" /> },
  autopilot: { label: 'Autopilot', color: 'text-emerald-400', icon: <Zap className="w-3.5 h-3.5" /> },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  configuring: { label: 'Configuring', color: 'text-text-muted' },
  running: { label: 'Running', color: 'text-accent-bright' },
  paused: { label: 'Paused', color: 'text-warning' },
  awaiting_approval: { label: 'Awaiting Approval', color: 'text-warning' },
  completed: { label: 'Completed', color: 'text-success' },
  failed: { label: 'Failed', color: 'text-danger' },
}

export function MissionDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [selectedLeadId, setSelectedLeadId] = useState<string>()
  const { mission, isRunning, startMission, pauseMission, resumeMission, approveStep, rejectStep } = useMissionStore()

  if (!mission) return null

  const status = STATUS_LABELS[mission.status]
  const autonomy = AUTONOMY_LABELS[mission.config.autonomy]
  const qualifiedLeads = mission.leads.filter(l => l.score >= 60)
  const pendingApprovals = mission.steps.filter(s => s.status === 'awaiting_approval')

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'feed', label: 'Live Feed', icon: <Activity className="w-4 h-4" />, count: mission.steps.filter(s => s.status === 'running').length },
    { id: 'leads', label: 'Leads', icon: <Users className="w-4 h-4" />, count: mission.leads.length },
    { id: 'outreach', label: 'Outreach', icon: <Mail className="w-4 h-4" />, count: mission.messages.length },
    { id: 'audit', label: 'Audit', icon: <ScrollText className="w-4 h-4" />, count: mission.audit.length },
    { id: 'export', label: 'Export', icon: <Download className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text flex items-center gap-3">
            {mission.config.niche} — {mission.config.location}
            {mission.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm">
            <span className={`flex items-center gap-1.5 ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                mission.status === 'running' ? 'bg-accent pulse-dot' : 
                mission.status === 'completed' ? 'bg-success' :
                mission.status === 'awaiting_approval' ? 'bg-warning pulse-dot' : 'bg-text-dim'
              }`} />
              {status.label}
            </span>
            <span className={`flex items-center gap-1 ${autonomy.color}`}>
              {autonomy.icon} {autonomy.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mission.status === 'running' || mission.status === 'awaiting_approval' ? (
            <button
              onClick={pauseMission}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-muted hover:text-text hover:border-border-bright transition cursor-pointer"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : mission.status === 'paused' ? (
            <button
              onClick={resumeMission}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent-bright hover:bg-accent/20 transition cursor-pointer"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
          ) : mission.status === 'configuring' ? (
            <button
              onClick={startMission}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-bright text-white rounded-lg text-sm font-medium transition cursor-pointer"
            >
              <Play className="w-4 h-4" /> Start Mission
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Leads Found" value={mission.leads.length} max={mission.config.leadCount} />
        <StatCard label="Qualified (60+)" value={qualifiedLeads.length} color="text-success" />
        <StatCard label="Messages Drafted" value={mission.messages.length} />
        <StatCard 
          label="Pending Approvals" 
          value={pendingApprovals.length} 
          color={pendingApprovals.length > 0 ? 'text-warning' : undefined}
          pulse={pendingApprovals.length > 0}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-accent text-accent-bright'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs bg-surface-2 px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'feed' && (
          <RunFeed steps={mission.steps} onApprove={approveStep} onReject={rejectStep} />
        )}
        {activeTab === 'leads' && (
          <LeadTable leads={mission.leads} selectedLeadId={selectedLeadId} onSelect={setSelectedLeadId} />
        )}
        {activeTab === 'outreach' && (
          <OutreachPreview messages={mission.messages} leads={mission.leads} selectedLeadId={selectedLeadId} />
        )}
        {activeTab === 'audit' && (
          <AuditTrail entries={mission.audit} />
        )}
        {activeTab === 'export' && (
          <ExportPanel mission={mission} />
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, max, color, pulse }: { label: string; value: number; max?: number; color?: string; pulse?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className={`text-2xl font-semibold font-mono ${color || 'text-text'} ${pulse ? 'pulse-dot' : ''}`}>
        {value}
        {max !== undefined && <span className="text-sm text-text-dim">/{max}</span>}
      </div>
    </div>
  )
}
