import { useState, useEffect, useRef, useCallback } from 'react'
import { FlaskConical, Trophy, TrendingUp, BarChart3, Zap, Target, ChevronDown, ChevronUp } from 'lucide-react'
import type { AdCreative, BusinessProfile, CampaignConfig, SimulationResult, IndustryBenchmark } from '../types'
import { generateSimulatedResults, getIndustryBenchmark } from '../lib/simulation'

interface Props {
  creatives: AdCreative[]
  business: BusinessProfile
  campaign: CampaignConfig
}

type SimState = 'idle' | 'running' | 'complete'

const SIMULATION_PHASES = [
  'Analysing audience response...',
  'Measuring engagement patterns...',
  'Calculating conversion funnels...',
  'Scoring creative performance...',
  'Determining statistical significance...',
]

const VARIANT_COLORS = [
  { bg: 'bg-indigo-500', bar: '#6366f1', light: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { bg: 'bg-cyan-500', bar: '#06b6d4', light: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { bg: 'bg-purple-500', bar: '#a855f7', light: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  { bg: 'bg-amber-500', bar: '#f59e0b', light: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  { bg: 'bg-rose-500', bar: '#f43f5e', light: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
]

function AnimatedCounter({ target, duration = 2000, prefix = '', suffix = '', decimals = 0 }: {
  target: number; duration?: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [current, setCurrent] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    startTime.current = null
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts
      const progress = Math.min((ts - startTime.current) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * target)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return <span>{prefix}{current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}</span>
}

function MetricBar({ value, maxValue, color, label, displayValue }: {
  value: number; maxValue: number; color: string; label: string; displayValue: string
}) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-text-dim w-12 text-right shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-bg/60 rounded-full overflow-hidden border border-border-bright/20">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-text-muted w-16 text-right font-mono shrink-0">{displayValue}</span>
    </div>
  )
}

export function ABTestPanel({ creatives, business, campaign }: Props) {
  const [simState, setSimState] = useState<SimState>('idle')
  const [progress, setProgress] = useState(0)
  const [impressionCount, setImpressionCount] = useState(0)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [results, setResults] = useState<SimulationResult[]>([])
  const [benchmark, setBenchmark] = useState<IndustryBenchmark | null>(null)
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const runSimulation = useCallback(() => {
    setSimState('running')
    setProgress(0)
    setImpressionCount(0)
    setPhaseIndex(0)
    setResults([])
    setExpandedVariant(null)

    const totalDuration = 4000
    const tickMs = 50
    const steps = totalDuration / tickMs
    let step = 0

    intervalRef.current = setInterval(() => {
      step++
      const pct = Math.min((step / steps) * 100, 100)
      setProgress(pct)
      setImpressionCount(Math.round((pct / 100) * 50000))

      // Cycle phases
      const phaseIdx = Math.min(Math.floor((pct / 100) * SIMULATION_PHASES.length), SIMULATION_PHASES.length - 1)
      setPhaseIndex(phaseIdx)

      if (step >= steps) {
        clearInterval(intervalRef.current)
        // Generate results
        const simResults = generateSimulatedResults(creatives, business)
        const industryBenchmark = getIndustryBenchmark(business)
        setResults(simResults)
        setBenchmark(industryBenchmark)
        setSimState('complete')
      }
    }, tickMs)
  }, [creatives, business])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Find max values for bar chart scaling
  const maxCtr = results.length > 0 ? Math.max(...results.map(r => r.ctr)) * 1.2 : 1
  const maxCpc = results.length > 0 ? Math.max(...results.map(r => r.cpc)) * 1.2 : 1
  const maxCvr = results.length > 0 ? Math.max(...results.map(r => r.conversionRate)) * 1.2 : 1
  const maxRoas = results.length > 0 ? Math.max(...results.map(r => r.roas)) * 1.2 : 1

  return (
    <div className="slide-in">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-text">A/B Performance Simulation</h3>
        <span className="text-[10px] text-text-dim ml-auto">AI-Powered Prediction</span>
      </div>

      <div className="gradient-border bg-surface rounded-2xl p-6">
        {/* Variant Preview Cards */}
        {simState === 'idle' && (
          <>
            <div className="mb-5">
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                Select which ad variants to test. We'll simulate <strong className="text-text">50,000 impressions</strong> across
                your target audiences and predict performance using industry benchmarks.
              </p>
              <div className="grid gap-3">
                {creatives.map((creative, i) => {
                  const vColor = VARIANT_COLORS[i % VARIANT_COLORS.length]
                  return (
                    <div
                      key={creative.id}
                      className={`rounded-xl border ${vColor.border} ${vColor.light} p-4 flex items-start gap-3 transition`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${vColor.bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-text truncate">{creative.headline}</div>
                        <div className="text-xs text-text-muted mt-0.5 line-clamp-2">{creative.primaryText}</div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Target className="w-3 h-3 text-text-dim" />
                          <span className="text-[10px] text-text-dim">{creative.angle}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={runSimulation}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-accent hover:from-purple-500 hover:to-accent-bright text-white font-bold rounded-xl transition cursor-pointer text-base flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              <FlaskConical className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Run A/B Simulation
            </button>
          </>
        )}

        {/* Running State */}
        {simState === 'running' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-purple-400 pulse-dot" />
                <span className="text-sm text-purple-300 font-medium">{SIMULATION_PHASES[phaseIndex]}</span>
              </div>
              <div className="text-3xl font-bold text-text font-mono">
                <AnimatedCounter target={impressionCount} duration={200} suffix="" decimals={0} />
              </div>
              <div className="text-[10px] text-text-dim uppercase tracking-wider mt-1">Impressions Simulated</div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-bg/60 rounded-full overflow-hidden border border-border-bright/20 mb-4">
              <div
                className="h-full rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7, #6366f1)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 2s ease infinite',
                }}
              />
            </div>

            {/* Variant progress indicators */}
            <div className="grid gap-2 mt-4">
              {creatives.map((_, i) => {
                const vColor = VARIANT_COLORS[i % VARIANT_COLORS.length]
                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className={`w-6 h-6 rounded-md ${vColor.bg} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div className="flex-1 h-1.5 bg-bg/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{
                          width: `${Math.min(progress + randomOffset(i), 100)}%`,
                          backgroundColor: vColor.bar,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="text-text-dim font-mono w-10 text-right">{Math.round(impressionCount / creatives.length).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {simState === 'complete' && results.length > 0 && (
          <div className="space-y-6">
            {/* Winner announcement */}
            {(() => {
              const winner = results.find(r => r.isWinner)
              if (!winner) return null
              const winnerCreative = creatives.find(c => c.id === winner.creativeId)
              return (
                <div className="ab-winner-card rounded-xl p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-bold text-text">Variant {winner.variant} Wins!</span>
                  </div>
                  <p className="text-sm text-text-muted mb-1">{winnerCreative?.headline}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
                      🏆 Recommended
                    </span>
                    <span className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent-bright text-xs font-semibold">
                      {winner.confidence}% confidence
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Results cards */}
            <div className="grid gap-4">
              {results.map((result, i) => {
                const vColor = VARIANT_COLORS[i % VARIANT_COLORS.length]
                const creative = creatives.find(c => c.id === result.creativeId)
                const isExpanded = expandedVariant === result.variant
                return (
                  <div
                    key={result.creativeId}
                    className={`rounded-xl border p-5 transition-all duration-300 slide-in ${
                      result.isWinner
                        ? 'ab-winner-card'
                        : 'border-border-bright/20 bg-bg/40 opacity-80'
                    }`}
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    {/* Card header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg ${vColor.bg} flex items-center justify-center text-white font-bold shrink-0`}>
                        {result.variant}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text">Variant {result.variant}</span>
                          {result.isWinner && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-semibold">
                              🏆 Winner
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted truncate mt-0.5">{creative?.headline}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-text">{result.ctr}%</div>
                        <div className="text-[10px] text-text-dim">CTR</div>
                      </div>
                    </div>

                    {/* Key metrics grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <MetricPill label="CPC" value={`$${result.cpc.toFixed(2)}`} good={result.isWinner} />
                      <MetricPill label="CVR" value={`${result.conversionRate}%`} good={result.isWinner} />
                      <MetricPill label="ROAS" value={`${result.roas}x`} good={result.isWinner} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <MetricPill label="Leads/mo" value={String(result.estimatedMonthlyLeads)} good={result.isWinner} />
                      <MetricPill label="CPL" value={`$${result.costPerLead.toFixed(2)}`} good={result.isWinner} />
                      <MetricPill label="Confidence" value={`${result.confidence}%`} good={result.isWinner} />
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedVariant(isExpanded ? null : result.variant)}
                      className="flex items-center gap-1 text-[10px] text-text-dim mt-3 hover:text-text-muted transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border-bright/20 text-xs text-text-muted space-y-1">
                        <div className="flex justify-between"><span>Impressions</span><span className="text-text font-mono">{result.impressions.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Clicks</span><span className="text-text font-mono">{result.clicks.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Conversions</span><span className="text-text font-mono">{result.conversions.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Angle</span><span className="text-text">{creative?.angle}</span></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bar Chart Comparison */}
            <div className="gradient-border bg-surface rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-text">Side-by-Side Comparison</span>
              </div>
              
              <div className="space-y-5">
                <ChartGroup
                  label="Click-Through Rate (%)"
                  results={results}
                  getValue={r => r.ctr}
                  maxValue={maxCtr}
                  format={v => `${v.toFixed(2)}%`}
                />
                <ChartGroup
                  label="Cost Per Click ($)"
                  results={results}
                  getValue={r => r.cpc}
                  maxValue={maxCpc}
                  format={v => `$${v.toFixed(2)}`}
                  invertColor
                />
                <ChartGroup
                  label="Conversion Rate (%)"
                  results={results}
                  getValue={r => r.conversionRate}
                  maxValue={maxCvr}
                  format={v => `${v.toFixed(2)}%`}
                />
                <ChartGroup
                  label="Return on Ad Spend"
                  results={results}
                  getValue={r => r.roas}
                  maxValue={maxRoas}
                  format={v => `${v.toFixed(1)}x`}
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border-bright/20">
                {results.map((r, i) => {
                  const vColor = VARIANT_COLORS[i % VARIANT_COLORS.length]
                  return (
                    <div key={r.variant} className="flex items-center gap-1.5 text-[10px] text-text-muted">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: vColor.bar }} />
                      <span>Variant {r.variant}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Industry Benchmarks */}
            {benchmark && (
              <div className="gradient-border bg-surface rounded-xl p-5 slide-in">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-text">Industry Benchmarks</span>
                  <span className="text-[10px] text-text-dim ml-auto">{benchmark.industry}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <BenchmarkCard
                    label="Avg CTR"
                    benchmark={`${benchmark.avgCtr.toFixed(2)}%`}
                    best={`${Math.max(...results.map(r => r.ctr)).toFixed(2)}%`}
                    isBetter={Math.max(...results.map(r => r.ctr)) > benchmark.avgCtr}
                  />
                  <BenchmarkCard
                    label="Avg CPC"
                    benchmark={`$${benchmark.avgCpc.toFixed(2)}`}
                    best={`$${Math.min(...results.map(r => r.cpc)).toFixed(2)}`}
                    isBetter={Math.min(...results.map(r => r.cpc)) < benchmark.avgCpc}
                  />
                  <BenchmarkCard
                    label="Avg CVR"
                    benchmark={`${benchmark.avgCvr.toFixed(2)}%`}
                    best={`${Math.max(...results.map(r => r.conversionRate)).toFixed(2)}%`}
                    isBetter={Math.max(...results.map(r => r.conversionRate)) > benchmark.avgCvr}
                  />
                </div>
              </div>
            )}

            {/* Re-run button */}
            <button
              onClick={runSimulation}
              className="w-full py-3 flex items-center justify-center gap-2 bg-surface-2 hover:bg-surface-3 border border-border-bright/30 rounded-xl transition cursor-pointer text-sm text-text-muted hover:text-text"
            >
              <Zap className="w-4 h-4" />
              Run New Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* --- Helper Components --- */

function MetricPill({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={`bg-bg/50 rounded-lg p-2.5 border text-center ${good ? 'border-green-500/20' : 'border-border-bright/15'}`}>
      <div className={`text-sm font-bold ${good ? 'text-text' : 'text-text-muted'}`}>{value}</div>
      <div className="text-[9px] text-text-dim uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

function ChartGroup({ label, results, getValue, maxValue, format, invertColor }: {
  label: string
  results: SimulationResult[]
  getValue: (r: SimulationResult) => number
  maxValue: number
  format: (v: number) => string
  invertColor?: boolean
}) {
  return (
    <div>
      <div className="text-[10px] text-text-dim uppercase tracking-wider mb-2 font-medium">{label}</div>
      <div className="space-y-1.5">
        {results.map((r, i) => {
          const vColor = VARIANT_COLORS[i % VARIANT_COLORS.length]
          const value = getValue(r)
          // For inverted metrics (like CPC), lower is better
          const isGreenOverride = invertColor ? r.isWinner : undefined
          return (
            <MetricBar
              key={r.variant}
              value={value}
              maxValue={maxValue}
              color={isGreenOverride !== undefined ? (isGreenOverride ? '#22c55e' : vColor.bar) : (r.isWinner ? '#22c55e' : vColor.bar)}
              label={r.variant}
              displayValue={format(value)}
            />
          )
        })}
      </div>
    </div>
  )
}

function BenchmarkCard({ label, benchmark, best, isBetter }: {
  label: string; benchmark: string; best: string; isBetter: boolean
}) {
  return (
    <div className="bg-bg/50 rounded-lg p-3 border border-border-bright/15">
      <div className="text-[10px] text-text-dim uppercase tracking-wider mb-2 font-medium">{label}</div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-xs text-text-muted">Industry:</span>
        <span className="text-sm font-semibold text-text">{benchmark}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs text-text-muted">Your best:</span>
        <span className={`text-sm font-bold ${isBetter ? 'text-green-400' : 'text-amber-400'}`}>{best}</span>
      </div>
      <div className={`text-[10px] mt-1.5 font-medium ${isBetter ? 'text-green-500' : 'text-amber-500'}`}>
        {isBetter ? '↑ Above average' : '↓ Below average'}
      </div>
    </div>
  )
}

// Small seeded offset for visual variety during animation
function randomOffset(i: number): number {
  return ((i * 7 + 3) % 5) - 2
}
