import { Globe, Brain, Users, Target, PenTool, Palette, Rocket, CheckCircle2, Loader2, Circle } from 'lucide-react'
import type { Stage, StageId } from '../types'

interface Props {
  stages: Stage[]
}

const STAGE_META: Record<StageId, { icon: React.ReactNode; color: string }> = {
  scrape: { icon: <Globe className="w-4 h-4" />, color: 'text-cyan-400' },
  analyse: { icon: <Brain className="w-4 h-4" />, color: 'text-purple-400' },
  audience: { icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
  strategy: { icon: <Target className="w-4 h-4" />, color: 'text-amber-400' },
  copy: { icon: <PenTool className="w-4 h-4" />, color: 'text-green-400' },
  creatives: { icon: <Palette className="w-4 h-4" />, color: 'text-pink-400' },
  campaign: { icon: <Rocket className="w-4 h-4" />, color: 'text-orange-400' },
  complete: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-success' },
}

function formatDuration(start?: number, end?: number): string {
  if (!start) return ''
  const ms = (end || Date.now()) - start
  return `${(ms / 1000).toFixed(1)}s`
}

export function BuildProgress({ stages }: Props) {
  const currentStage = stages.find(s => s.status === 'running')
  const completedCount = stages.filter(s => s.status === 'completed').length
  const progress = (completedCount / stages.length) * 100

  return (
    <div className="w-72 flex-shrink-0">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-text-muted">Building campaign</span>
          <span className="text-xs text-text-dim font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-accent via-accent-bright to-accent-secondary rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {progress > 0 && (
              <div className="absolute inset-0 rounded-full glow" style={{ boxShadow: '0 0 12px 2px rgba(99, 102, 241, 0.5)' }} />
            )}
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-1.5">
        {stages.map((stage, i) => {
          const meta = STAGE_META[stage.id]
          const isRunning = stage.status === 'running'
          const isComplete = stage.status === 'completed'
          const isPending = stage.status === 'pending'

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                isRunning ? 'bg-accent/8 border border-accent/20' : ''
              }`}
            >
              {/* Status icon */}
              <div className={`flex-shrink-0 ${isPending ? 'text-text-dim' : meta.color}`}>
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isPending ? 'text-text-dim' : 'text-text'}`}>
                  {stage.label}
                </div>
                {isRunning && stage.thinkingText && (
                  <div className="text-[10px] text-accent-bright animate-pulse truncate">
                    {stage.thinkingText}
                  </div>
                )}
              </div>

              {/* Duration */}
              {isComplete && (
                <span className="text-[10px] text-text-dim font-mono flex-shrink-0">
                  {formatDuration(stage.startedAt, stage.completedAt)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
