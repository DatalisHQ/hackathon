import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import type { Stage, StageId, BusinessProfile, AudiencePersona, AdCreative, CampaignConfig } from './types'
import { URLInput } from './components/URLInput'
import { BuildProgress } from './components/BuildProgress'
import { ResultsPanel } from './components/ResultsPanel'
import { buildCampaign } from './lib/engine'

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
  const [url, setUrl] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const resultsRef = useRef<HTMLDivElement>(null)

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

    await buildCampaign(inputUrl, (update) => {
      if (update.stage) {
        setStages(prev => prev.map(s =>
          s.id === update.stage!.id ? { ...s, ...update.stage!.changes } : s
        ))
      }
      if (update.business) setBusiness(update.business)
      if (update.audiences) setAudiences(update.audiences)
      if (update.creatives) setCreatives(update.creatives)
      if (update.campaign) {
        setCampaign(update.campaign)
        setIsComplete(true)
      }
    })

    setIsBuilding(false)
  }, [])

  const showBuilder = isBuilding || isComplete

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
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
        <URLInput onSubmit={handleSubmit} isBuilding={isBuilding} />
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6">
            {/* Left: Progress */}
            <BuildProgress stages={stages} />

            {/* Right: Results */}
            <div ref={resultsRef} className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-100px)]">
              <ResultsPanel
                business={business}
                audiences={audiences}
                creatives={creatives}
                campaign={campaign}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
