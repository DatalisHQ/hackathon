import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import type { Stage, BusinessProfile, AudiencePersona, AdCreative, CampaignConfig } from './types'
import { URLInput } from './components/URLInput'
import { BuildProgress } from './components/BuildProgress'
import { ResultsPanel } from './components/ResultsPanel'
import { ThinkingStream } from './components/ThinkingStream'
import type { ThinkingLine } from './components/ThinkingStream'
import { buildCampaign } from './lib/engine'
import { playTick, playSuccess, playStageComplete } from './lib/sounds'
import { fireConfetti } from './lib/confetti'

const INITIAL_STAGES: Stage[] = [
  { id: 'scrape', label: 'Scan Website', description: 'Reading your website content', status: 'pending' },
  { id: 'analyse', label: 'Analyse Business', description: 'Understanding your business model', status: 'pending' },
  { id: 'audience', label: 'Find Audiences', description: 'Building target personas', status: 'pending' },
  { id: 'strategy', label: 'Plan Strategy', description: 'Choosing campaign approach', status: 'pending' },
  { id: 'copy', label: 'Write Ad Copy', description: 'Crafting persuasive messages', status: 'pending' },
  { id: 'creatives', label: 'Design Creatives', description: 'Generating visual ads', status: 'pending' },
  { id: 'campaign', label: 'Build Campaign', description: 'Assembling everything', status: 'pending' },
  { id: 'complete', label: 'Ready to Launch', description: 'Campaign complete', status: 'pending' },
]

export default function App() {
  const [isBuilding, setIsBuilding] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES)
  const [business, setBusiness] = useState<BusinessProfile>()
  const [audiences, setAudiences] = useState<AudiencePersona[]>()
  const [creatives, setCreatives] = useState<AdCreative[]>()
  const [campaign, setCampaign] = useState<CampaignConfig>()
  const [thinkingLines, setThinkingLines] = useState<ThinkingLine[]>([])
  const [url, setUrl] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isBuilding) {
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current)
      }, 100)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isBuilding])

  const handleSubmit = useCallback(async (inputUrl: string) => {
    setUrl(inputUrl)
    setIsBuilding(true)
    setIsComplete(false)
    setStages([...INITIAL_STAGES])
    setBusiness(undefined)
    setAudiences(undefined)
    setCreatives(undefined)
    setCampaign(undefined)
    setThinkingLines([])

    await buildCampaign(inputUrl, (update) => {
      if (update.stage) {
        setStages(prev => prev.map(s =>
          s.id === update.stage!.id ? { ...s, ...update.stage!.changes } : s
        ))
      }
      if (update.thinking) {
        setThinkingLines(prev => [...prev, {
          id: crypto.randomUUID(),
          type: update.thinking!.type,
          text: update.thinking!.text,
          timestamp: Date.now(),
        }])
        // Sound effects
        if (update.thinking.type === 'highlight') {
          playStageComplete()
        } else if (update.thinking.type === 'decision' || update.thinking.type === 'insight') {
          playTick()
        }
      }
      if (update.business) setBusiness(update.business)
      if (update.audiences) setAudiences(update.audiences)
      if (update.creatives) setCreatives(update.creatives)
      if (update.campaign) {
        setCampaign(update.campaign)
        setIsComplete(true)
        playSuccess()
        setTimeout(() => fireConfetti(), 300)
      }
    })

    setIsBuilding(false)
  }, [])

  const handleCreativeEdit = useCallback((id: string, field: string, value: string) => {
    setCreatives(prev => prev?.map(c => c.id === id ? { ...c, [field]: value } : c))
  }, [])

  const showBuilder = isBuilding || isComplete

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm flex-shrink-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-text text-sm">AdForge</span>
            <span className="text-[10px] text-text-dim bg-surface-2 px-2 py-0.5 rounded-full">AI Campaign Builder</span>
          </div>
          <div className="flex items-center gap-4">
            {isBuilding && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                Building... {(elapsed / 1000).toFixed(1)}s
              </div>
            )}
            {isComplete && (
              <div className="flex items-center gap-2 text-xs text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Complete — {(elapsed / 1000).toFixed(1)}s
              </div>
            )}
            {showBuilder && url && (
              <div className="text-xs text-text-dim truncate max-w-[200px]">{url}</div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      {!showBuilder ? (
        <div className="flex-1 overflow-y-auto">
          <URLInput onSubmit={handleSubmit} isBuilding={isBuilding} />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Progress + Thinking */}
          <div className="w-80 flex-shrink-0 flex flex-col border-r border-border">
            <div className="p-4 flex-shrink-0">
              <BuildProgress stages={stages} />
            </div>
            <div className="flex-1 px-4 pb-4 min-h-0">
              <ThinkingStream lines={thinkingLines} isActive={isBuilding} />
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex-1 overflow-y-auto p-6">
            <ResultsPanel
              business={business}
              audiences={audiences}
              creatives={creatives}
              campaign={campaign}
              onCreativeEdit={handleCreativeEdit}
            />
          </div>
        </div>
      )}
    </div>
  )
}
