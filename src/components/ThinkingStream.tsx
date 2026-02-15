import { useEffect, useRef } from 'react'
import { Terminal, Loader2 } from 'lucide-react'

interface Props {
  lines: ThinkingLine[]
  isActive: boolean
}

export interface ThinkingLine {
  id: string
  type: 'system' | 'data' | 'insight' | 'decision' | 'highlight' | 'user'
  text: string
  timestamp: number
}

const TYPE_STYLES: Record<ThinkingLine['type'], string> = {
  system: 'text-text-dim',
  data: 'text-cyan-400/90 font-mono text-[11px]',
  insight: 'text-amber-400',
  decision: 'text-accent-bright font-medium',
  highlight: 'text-success font-medium',
  user: 'text-white font-medium',
}

export function ThinkingStream({ lines, isActive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="flex flex-col h-full bg-[#060a14] rounded-2xl border border-border-bright/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface/60 backdrop-blur-sm">
        {isActive ? (
          <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
        ) : (
          <Terminal className="w-3.5 h-3.5 text-text-dim" />
        )}
        <span className="text-xs font-semibold text-text-muted tracking-wide">Agent Console</span>
        {isActive && (
          <span className="text-[10px] text-accent font-mono pulse-dot ml-auto">● LIVE</span>
        )}
      </div>

      {/* Stream */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {lines.length === 0 ? (
          <div className="text-xs text-text-dim text-center py-8 font-mono">
            Agent output will stream here in real-time...
          </div>
        ) : (
          lines.map((line) => (
            line.type === 'user' ? (
              <div key={line.id} className="slide-in flex items-start gap-2 border-l-2 border-cyan-400 pl-2 ml-1 py-1 bg-cyan-400/5 rounded-r-lg">
                <span className="text-[10px] text-text-dim font-mono flex-shrink-0 mt-0.5 w-[52px] opacity-60">
                  {new Date(line.timestamp).toLocaleTimeString('en-AU', { minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-xs leading-relaxed text-white font-medium">
                  <span className="text-cyan-400 mr-1">👤 You:</span>{line.text}
                </span>
              </div>
            ) : (
              <div key={line.id} className="slide-in flex items-start gap-2">
                <span className="text-[10px] text-text-dim font-mono flex-shrink-0 mt-0.5 w-[52px] opacity-60">
                  {new Date(line.timestamp).toLocaleTimeString('en-AU', { minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`text-xs leading-relaxed ${TYPE_STYLES[line.type]}`}>
                  {line.text}
                </span>
              </div>
            )
          ))
        )}
        {isActive && (
          <div className="flex items-center gap-1.5 text-accent pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" style={{ animationDelay: '0.3s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" style={{ animationDelay: '0.6s' }} />
          </div>
        )}
      </div>
    </div>
  )
}
