import { Search, Globe, BarChart3, PenTool, CheckCircle2, XCircle, Clock, AlertTriangle, Send, FileDown, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import type { RunStep, StepType, StepStatus } from '../types'

interface Props {
  steps: RunStep[]
  onApprove?: (stepId: string) => void
  onReject?: (stepId: string) => void
}

const STEP_ICONS: Record<StepType, React.ReactNode> = {
  search: <Search className="w-4 h-4" />,
  scrape: <Globe className="w-4 h-4" />,
  score: <BarChart3 className="w-4 h-4" />,
  enrich: <Globe className="w-4 h-4" />,
  write: <PenTool className="w-4 h-4" />,
  review: <ShieldCheck className="w-4 h-4" />,
  queue: <Send className="w-4 h-4" />,
  approval: <ShieldAlert className="w-4 h-4" />,
  decision: <AlertTriangle className="w-4 h-4" />,
  export: <FileDown className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4" />,
}

const STATUS_STYLES: Record<StepStatus, { dot: string; text: string }> = {
  pending: { dot: 'bg-text-dim', text: 'text-text-dim' },
  running: { dot: 'bg-accent pulse-dot', text: 'text-accent-bright' },
  completed: { dot: 'bg-success', text: 'text-success' },
  failed: { dot: 'bg-danger', text: 'text-danger' },
  skipped: { dot: 'bg-text-dim', text: 'text-text-dim' },
  awaiting_approval: { dot: 'bg-warning pulse-dot', text: 'text-warning' },
  approved: { dot: 'bg-success', text: 'text-success' },
  rejected: { dot: 'bg-danger', text: 'text-danger' },
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function RunFeed({ steps, onApprove, onReject }: Props) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Live Run Feed
      </h2>
      
      <div className="space-y-2">
        {steps.map((step, i) => {
          const style = STATUS_STYLES[step.status]
          const isApproval = step.type === 'approval' && step.status === 'awaiting_approval'
          
          return (
            <div
              key={step.id}
              className={`slide-in rounded-lg border p-3 transition ${
                isApproval
                  ? 'border-warning/40 bg-warning/5'
                  : step.status === 'running'
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className="mt-0.5 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                </div>
                
                {/* Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${style.text}`}>
                  {STEP_ICONS[step.type]}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-medium ${style.text}`}>{step.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-text-dim flex-shrink-0">
                      {step.duration && <span>{formatDuration(step.duration)}</span>}
                      <span>{formatTime(step.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{step.detail}</p>
                  
                  {/* Approval buttons */}
                  {isApproval && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onApprove?.(step.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success border border-success/30 rounded-md text-xs font-medium transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject?.(step.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 rounded-md text-xs font-medium transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      {step.approvalReason && (
                        <span className="text-xs text-text-dim ml-2">{step.approvalReason}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
