import { Globe, Brain, Users, Target, PenTool, Palette, Rocket, CheckCircle2, Loader2, Circle } from 'lucide-react'
import type { Stage, StageId } from '../types'

interface Props {
  stages: Stage[]
}

const STAGE_META: Record<StageId, { icon: React.ReactNode; color: string; barColor: string }> = {
  scrape: { icon: <Globe className="w-3.5 h-3.5" />, color: 'text-cyan-400', barColor: '#22d3ee' },
  analyse: { icon: <Brain className="w-3.5 h-3.5" />, color: 'text-purple-400', barColor: '#c084fc' },
  audience: { icon: <Users className="w-3.5 h-3.5" />, color: 'text-blue-400', barColor: '#60a5fa' },
  strategy: { icon: <Target className="w-3.5 h-3.5" />, color: 'text-amber-400', barColor: '#fbbf24' },
  copy: { icon: <PenTool className="w-3.5 h-3.5" />, color: 'text-green-400', barColor: '#4ade80' },
  creatives: { icon: <Palette className="w-3.5 h-3.5" />, color: 'text-pink-400', barColor: '#f472b6' },
  campaign: { icon: <Rocket className="w-3.5 h-3.5" />, color: 'text-orange-400', barColor: '#fb923c' },
  complete: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-success', barColor: '#22c55e' },
}

export function BuildProgress({ stages }: Props) {
  const currentStage = stages.find(s => s.status === 'running')

  return (
    <div className="w-full px-6 py-3 border-b border-border bg-surface/40 backdrop-blur-sm flex-shrink-0">
      {/* Horizontal dot progress */}
      <div className="flex items-center justify-between max-w-4xl mx-auto relative">
        {stages.map((stage, i) => {
          const meta = STAGE_META[stage.id]
          const isRunning = stage.status === 'running'
          const isComplete = stage.status === 'completed'
          const isPending = stage.status === 'pending'
          const isLast = i === stages.length - 1

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-initial">
              {/* Dot + label group */}
              <div className="relative flex flex-col items-center" style={{ minWidth: '28px' }}>
                {/* The dot */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isComplete
                      ? 'bg-success/20 text-success border-2 border-success/40'
                      : isRunning
                      ? 'bg-accent/20 text-accent-bright border-2 border-accent/50 progress-dot-pulse'
                      : 'bg-surface-2 text-text-dim border-2 border-border-bright/30'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span className={`${meta.color} opacity-40`}>{meta.icon}</span>
                  )}
                </div>

                {/* Label below dot — only shown for running/completed */}
                <span
                  className={`absolute top-8 text-[10px] font-medium whitespace-nowrap transition-all duration-300 ${
                    isRunning
                      ? 'text-accent-bright opacity-100'
                      : isComplete
                      ? 'text-text-muted opacity-70'
                      : 'text-text-dim opacity-0 sm:opacity-40'
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-[2px] mx-1.5 relative">
                  <div className="absolute inset-0 bg-border-bright/30 rounded-full" />
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-accent rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: isComplete ? '100%' : isRunning ? '50%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Current stage thinking text */}
      {currentStage?.thinkingText && (
        <div className="text-center mt-6 mb-1">
          <span className="text-xs text-accent-bright animate-pulse font-medium">
            {currentStage.thinkingText}
          </span>
        </div>
      )}
    </div>
  )
}
