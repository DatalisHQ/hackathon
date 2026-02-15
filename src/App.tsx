import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles, Volume2, VolumeX } from 'lucide-react'
import type { Stage, BusinessProfile, AudiencePersona, AdCreative, GoogleAd, CampaignConfig } from './types'
import { URLInput } from './components/URLInput'
import { BuildProgress } from './components/BuildProgress'
import { ResultsPanel } from './components/ResultsPanel'
import { ThinkingStream } from './components/ThinkingStream'
import type { ThinkingLine } from './components/ThinkingStream'
import { AgentBrowser } from './components/AgentBrowser'
import { ChatInput } from './components/ChatInput'
import { buildStrategy, executeCampaign } from './lib/engine'
import { playTick, playSuccess, playStageComplete } from './lib/sounds'
import { fireConfetti } from './lib/confetti'
import { speak, setVoiceEnabled, isVoiceEnabled, stopSpeaking } from './lib/voice'

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
  const [googleAds, setGoogleAds] = useState<GoogleAd[]>()
  const [campaign, setCampaign] = useState<CampaignConfig>()
  const [thinkingLines, setThinkingLines] = useState<ThinkingLine[]>([])
  const [url, setUrl] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [awaitingApproval, setAwaitingApproval] = useState(false)
  const [voiceOn, setVoiceOn] = useState(isVoiceEnabled())
  const [currentStageAction, setCurrentStageAction] = useState<string | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const strategyDataRef = useRef<{ business: BusinessProfile; audiences: AudiencePersona[] } | null>(null)
  const userMessagesRef = useRef<string[]>([])

  const getUserMessages = useCallback((): string[] => {
    const msgs = [...userMessagesRef.current]
    userMessagesRef.current = []
    return msgs
  }, [])

  const handleUserMessage = useCallback((message: string) => {
    userMessagesRef.current.push(message)
    setThinkingLines(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'user' as const,
      text: message,
      timestamp: Date.now(),
    }])
  }, [])

  useEffect(() => {
    if (isBuilding) {
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current)
      }, 100)
    } else if (!awaitingApproval) {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isBuilding, awaitingApproval])

  const handleUpdate = useCallback((update: any) => {
    if (update.stage) {
      setStages(prev => prev.map(s =>
        s.id === update.stage!.id ? { ...s, ...update.stage!.changes } : s
      ))
      // Track the current stage action text for the AgentBrowser
      if (update.stage.changes?.thinkingText) {
        setCurrentStageAction(update.stage.changes.thinkingText)
      }
    }
    if (update.thinking) {
      setThinkingLines(prev => [...prev, {
        id: crypto.randomUUID(),
        type: update.thinking!.type,
        text: update.thinking!.text,
        timestamp: Date.now(),
      }])
      if (update.thinking.type === 'highlight') {
        playStageComplete()
        // Speak highlight text (stage completions) with high priority
        speak(update.thinking.text.replace(/[✓→]/g, '').trim(), 'high')
      } else if (update.thinking.type === 'decision') {
        playTick()
        // Speak key decisions with low priority
        speak(update.thinking.text.replace(/[✓→]/g, '').trim(), 'low')
      } else if (update.thinking.type === 'insight') {
        playTick()
      }
    }
    if (update.business) setBusiness(update.business)
    if (update.audiences) setAudiences(update.audiences)
    if (update.creatives) setCreatives(update.creatives)
    if (update.googleAds) setGoogleAds(update.googleAds)
    if (update.campaign) {
      setCampaign(update.campaign)
      setIsComplete(true)
      playSuccess()
      setTimeout(() => fireConfetti(), 300)
      speak('Your campaign is ready to launch!', 'high')
    }
    if (update.awaitApproval) {
      setAwaitingApproval(true)
      setIsBuilding(false)
      speak('Strategy complete. Ready to execute your campaign?', 'high')
    }
  }, [])

  const handleSubmit = useCallback(async (inputUrl: string) => {
    setUrl(inputUrl)
    setIsBuilding(true)
    setIsComplete(false)
    setAwaitingApproval(false)
    setStages([...INITIAL_STAGES])
    setBusiness(undefined)
    setAudiences(undefined)
    setCreatives(undefined)
    setGoogleAds(undefined)
    setCampaign(undefined)
    setThinkingLines([])
    strategyDataRef.current = null

    const result = await buildStrategy(inputUrl, handleUpdate, getUserMessages)
    strategyDataRef.current = result
  }, [handleUpdate, getUserMessages])

  const handleApprove = useCallback(async () => {
    if (!strategyDataRef.current) return
    setAwaitingApproval(false)
    setIsBuilding(true)

    await executeCampaign(
      strategyDataRef.current.business,
      strategyDataRef.current.audiences,
      handleUpdate,
      getUserMessages,
    )

    setIsBuilding(false)
  }, [handleUpdate, getUserMessages])

  const handleCreativeEdit = useCallback((id: string, field: string, value: string) => {
    setCreatives(prev => prev?.map(c => c.id === id ? { ...c, [field]: value } : c))
  }, [])

  const handleReset = useCallback(() => {
    setIsBuilding(false)
    setIsComplete(false)
    setAwaitingApproval(false)
    setStages([...INITIAL_STAGES])
    setBusiness(undefined)
    setAudiences(undefined)
    setCreatives(undefined)
    setGoogleAds(undefined)
    setCampaign(undefined)
    setThinkingLines([])
    setUrl('')
    setElapsed(0)
    strategyDataRef.current = null
  }, [])

  const showBuilder = isBuilding || isComplete || awaitingApproval

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="relative border-b border-border bg-surface/60 backdrop-blur-md flex-shrink-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-text text-base tracking-tight">AdForge</span>
            <span className="text-[10px] text-text-dim bg-surface-2 px-2.5 py-1 rounded-full border border-border-bright/30 font-medium">AI Campaign Builder</span>
          </div>
          <div className="flex items-center gap-4">
            {isBuilding && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                Building... {(elapsed / 1000).toFixed(1)}s
              </div>
            )}
            {awaitingApproval && !isBuilding && !isComplete && (
              <div className="flex items-center gap-2 text-xs text-warning">
                <span className="w-1.5 h-1.5 rounded-full bg-warning pulse-dot" />
                Awaiting approval
              </div>
            )}
            {isComplete && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Complete — {(elapsed / 1000).toFixed(1)}s
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-text-muted hover:text-text px-3 py-1.5 rounded-lg border border-border hover:border-border-bright transition cursor-pointer"
                >
                  ← New URL
                </button>
              </div>
            )}
            {showBuilder && url && (
              <div className="text-xs text-text-dim truncate max-w-[200px]">{url}</div>
            )}
            {/* Voice toggle */}
            {showBuilder && (
              <button
                onClick={() => {
                  const next = !voiceOn
                  setVoiceOn(next)
                  setVoiceEnabled(next)
                  if (!next) stopSpeaking()
                }}
                className="p-2 rounded-lg border border-border hover:border-border-bright text-text-muted hover:text-text transition cursor-pointer"
                title={voiceOn ? 'Mute voice narration' : 'Enable voice narration'}
              >
                {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
        {/* Gradient line under header */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </header>

      {/* Main */}
      {!showBuilder ? (
        <div className="flex-1 overflow-y-auto">
          <URLInput onSubmit={handleSubmit} isBuilding={isBuilding} />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Progress + Thinking + Chat */}
          <div className="w-80 flex-shrink-0 flex flex-col border-r border-border">
            <div className="p-5 flex-shrink-0">
              <BuildProgress stages={stages} />
            </div>
            <div className="flex-1 px-4 pb-0 min-h-0">
              <ThinkingStream lines={thinkingLines} isActive={isBuilding} />
            </div>
            <ChatInput
              onSend={handleUserMessage}
              isBuilding={isBuilding}
            />
          </div>

          {/* Right: Results */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Agent Browser — visible during scrape/analyse stages */}
            {(() => {
              const scrapeStage = stages.find(s => s.id === 'scrape')
              const analyseStage = stages.find(s => s.id === 'analyse')
              const showBrowser = isBuilding && (
                scrapeStage?.status === 'running' ||
                analyseStage?.status === 'running' ||
                (scrapeStage?.status === 'completed' && analyseStage?.status !== 'completed')
              )
              const scanDone = scrapeStage?.status === 'completed'
              if (showBrowser || (scanDone && analyseStage?.status === 'completed' && !business)) {
                return (
                  <div className="mb-6">
                    <AgentBrowser
                      url={url}
                      isActive={isBuilding && !scanDone}
                      currentAction={currentStageAction}
                      scanComplete={scanDone && analyseStage?.status === 'completed'}
                    />
                  </div>
                )
              }
              return null
            })()}
            <ResultsPanel
              business={business}
              audiences={audiences}
              creatives={creatives}
              googleAds={googleAds}
              campaign={campaign}
              onCreativeEdit={handleCreativeEdit}
              awaitingApproval={awaitingApproval}
              onApprove={handleApprove}
            />
          </div>
        </div>
      )}
    </div>
  )
}
