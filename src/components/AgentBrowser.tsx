import { useState, useEffect, useMemo } from 'react'
import { Lock, X, Minus, Square } from 'lucide-react'

interface AgentBrowserProps {
  url: string
  isActive: boolean
  currentAction?: string
  highlights?: string[]
  scanComplete?: boolean
}

const SCAN_LABELS = [
  'Scanning headlines...',
  'Reading meta tags...',
  'Analyzing content structure...',
  'Extracting service info...',
  'Reading pricing data...',
  'Identifying brand elements...',
  'Mapping page layout...',
  'Parsing contact details...',
]

function HighlightBox({ label, index }: { label: string; index: number }) {
  // Deterministic but varied positions based on index
  const positions = useMemo((): { top: string; left: string; width: string; height: string } => {
    const rows = [
      { top: '12%', left: '8%', width: '55%', height: '18px' },
      { top: '22%', left: '12%', width: '70%', height: '14px' },
      { top: '35%', left: '5%', width: '42%', height: '45px' },
      { top: '42%', left: '52%', width: '40%', height: '32px' },
      { top: '58%', left: '8%', width: '80%', height: '16px' },
      { top: '68%', left: '15%', width: '60%', height: '20px' },
      { top: '78%', left: '5%', width: '35%', height: '28px' },
      { top: '85%', left: '45%', width: '48%', height: '14px' },
    ]
    return rows[index % rows.length]
  }, [index])

  return (
    <div
      className="absolute border border-accent-secondary/60 rounded bg-accent-secondary/5 highlight-box-anim"
      style={{
        ...positions,
        animationDelay: `${index * 0.6}s`,
      }}
    >
      <span
        className="absolute -top-5 left-0 text-[9px] text-accent-secondary font-mono whitespace-nowrap bg-bg/80 px-1.5 py-0.5 rounded"
      >
        {label}
      </span>
    </div>
  )
}

export function AgentBrowser({ url, isActive, currentAction, highlights, scanComplete }: AgentBrowserProps) {
  const [phase, setPhase] = useState<'connecting' | 'scanning' | 'complete'>('connecting')
  const [activeHighlights, setActiveHighlights] = useState<{ label: string; index: number }[]>([])
  const [highlightCounter, setHighlightCounter] = useState(0)

  // Transition through phases
  useEffect(() => {
    if (scanComplete) {
      setPhase('complete')
      return
    }
    if (!isActive) return

    setPhase('connecting')
    const connectTimer = setTimeout(() => setPhase('scanning'), 1500)
    return () => clearTimeout(connectTimer)
  }, [isActive, scanComplete])

  // Cycle floating highlight boxes during scanning
  useEffect(() => {
    if (phase !== 'scanning' || !isActive) return

    const interval = setInterval(() => {
      setHighlightCounter(prev => {
        const next = prev + 1
        const labels = highlights?.length ? highlights : SCAN_LABELS
        const label = labels[next % labels.length]

        setActiveHighlights(prev => {
          // Keep max 3 visible at a time
          const updated = [...prev, { label, index: next }]
          if (updated.length > 3) return updated.slice(-3)
          return updated
        })

        return next
      })
    }, 1800)

    return () => clearInterval(interval)
  }, [phase, isActive, highlights])

  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div className="slide-in rounded-2xl overflow-hidden border border-border-bright/40 bg-surface-2 shadow-xl shadow-black/30">
      {/* Browser chrome */}
      <div className="bg-surface-2 px-4 py-2.5 flex items-center gap-3 border-b border-border-bright/30">
        {/* Window dots */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/70 flex items-center justify-center hover:bg-red-500 transition">
            <X className="w-1.5 h-1.5 text-red-900 opacity-0 hover:opacity-100" />
          </div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/70 flex items-center justify-center">
            <Minus className="w-1.5 h-1.5 text-yellow-900 opacity-0" />
          </div>
          <div className="w-3 h-3 rounded-full bg-green-500/70 flex items-center justify-center">
            <Square className="w-1.5 h-1.5 text-green-900 opacity-0" />
          </div>
        </div>

        {/* URL bar */}
        <div className="flex-1 bg-bg/80 rounded-lg px-3 py-1.5 flex items-center gap-2 overflow-hidden relative">
          <Lock className="w-3 h-3 text-green-500 flex-shrink-0" />
          <span className="text-xs text-text-muted font-mono truncate">{displayUrl}</span>

          {/* Loading bar */}
          {isActive && phase !== 'complete' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
              <div className="h-full bg-accent-secondary url-loading-bar" />
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex-shrink-0">
          {isActive && phase !== 'complete' ? (
            <span className="w-2 h-2 rounded-full bg-accent-secondary pulse-dot block" />
          ) : scanComplete ? (
            <span className="text-[10px] text-success font-medium">✓</span>
          ) : null}
        </div>
      </div>

      {/* Content area */}
      <div className="relative h-56 bg-[#0a0e1a] overflow-hidden">
        {/* Simulated page content lines */}
        <div className="absolute inset-0 p-4 space-y-3 opacity-20">
          {/* Nav bar sim */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-4 rounded bg-surface-3/60" />
            <div className="flex-1" />
            <div className="w-12 h-3 rounded bg-surface-3/40" />
            <div className="w-12 h-3 rounded bg-surface-3/40" />
            <div className="w-12 h-3 rounded bg-surface-3/40" />
          </div>
          {/* Hero sim */}
          <div className="mt-2 space-y-2">
            <div className="w-3/4 h-5 rounded bg-surface-3/50" />
            <div className="w-1/2 h-3 rounded bg-surface-3/30" />
          </div>
          {/* Content blocks */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="h-16 rounded bg-surface-3/30" />
            <div className="h-16 rounded bg-surface-3/30" />
            <div className="h-16 rounded bg-surface-3/30" />
          </div>
          <div className="space-y-1.5 mt-3">
            <div className="w-full h-2.5 rounded bg-surface-3/25" />
            <div className="w-5/6 h-2.5 rounded bg-surface-3/25" />
            <div className="w-4/6 h-2.5 rounded bg-surface-3/25" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="h-12 rounded bg-surface-3/25" />
            <div className="h-12 rounded bg-surface-3/25" />
          </div>
        </div>

        {/* Connecting state */}
        {phase === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/60 z-10">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-accent-secondary/50 border-t-accent-secondary rounded-full animate-spin" />
              <span className="text-sm text-accent-secondary font-mono">Connecting to {displayUrl}...</span>
            </div>
          </div>
        )}

        {/* Scanning state */}
        {phase === 'scanning' && isActive && (
          <>
            {/* Scan line */}
            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-secondary to-transparent scan-line-anim z-20 pointer-events-none" />

            {/* Scanline overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none scanline-overlay" />

            {/* Highlight boxes */}
            {activeHighlights.map((h, i) => (
              <HighlightBox key={`${h.index}-${h.label}`} label={h.label} index={h.index} />
            ))}
          </>
        )}

        {/* Scan complete state */}
        {phase === 'complete' && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/40 z-10">
            <div className="flex items-center gap-2 bg-success/10 border border-success/30 px-4 py-2 rounded-xl">
              <span className="text-success text-lg">✓</span>
              <span className="text-sm text-success font-medium">Scan complete</span>
            </div>
          </div>
        )}

        {/* Current action label */}
        {currentAction && phase === 'scanning' && (
          <div className="absolute bottom-3 left-3 right-3 z-30">
            <div className="bg-bg/90 backdrop-blur-sm border border-accent-secondary/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary pulse-dot flex-shrink-0" />
              <span className="text-[11px] text-accent-secondary font-mono truncate">{currentAction}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
