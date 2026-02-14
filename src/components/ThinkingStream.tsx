import { useEffect, useRef } from 'react'
import { Brain, Loader2 } from 'lucide-react'

interface Props {
  lines: ThinkingLine[]
  isActive: boolean
}

export interface ThinkingLine {
  id: string
  type: 'system' | 'data' | 'insight' | 'decision' | 'highlight'
  text: string
  timestamp: number
}

const TYPE_STYLES: Record<ThinkingLine['type'], string> = {
  system: 'text-text-dim',
  data: 'text-cyan-400/80 font-mono text-[11px]',
  insight: 'text-amber-400',
  decision: 'text-accent-bright font-medium',
  highlight: 'text-success font-medium',
}

export function ThinkingStream({ lines, isActive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="flex flex-col h-full bg-[#08080d] rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface/50">
        {isActive ? (
          <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
        ) : (
          <Brain className="w-3.5 h-3.5 text-text-dim" />
        )}
        <span className="text-xs font-medium text-text-muted">Agent Reasoning</span>
        {isActive && (
          <span className="text-[10px] text-accent pulse-dot ml-auto">LIVE</span>
        )}
      </div>

      {/* Stream */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {lines.length === 0 ? (
          <div className="text-xs text-text-dim text-center py-8">
            Agent reasoning will stream here in real-time...
          </div>
        ) : (
          lines.map((line) => (
            <div key={line.id} className="slide-in flex items-start gap-2">
              <span className="text-[10px] text-text-dim font-mono flex-shrink-0 mt-0.5 w-[52px]">
                {new Date(line.timestamp).toLocaleTimeString('en-AU', { minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={`text-xs leading-relaxed ${TYPE_STYLES[line.type]}`}>
                {line.text}
              </span>
            </div>
          ))
        )}
        {isActive && (
          <div className="flex items-center gap-1 text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" style={{ animationDelay: '0.3s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" style={{ animationDelay: '0.6s' }} />
          </div>
        )}
      </div>
    </div>
  )
}
