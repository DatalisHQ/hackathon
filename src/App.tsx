import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles, Volume2, VolumeX, Terminal, Palette, Users, Building2, Rocket } from 'lucide-react'
import type { Stage, BusinessProfile, AudiencePersona, AdCreative, GoogleAd, CampaignConfig } from './types'
import { URLInput } from './components/URLInput'
import { BuildProgress } from './components/BuildProgress'
import { ResultsPanel, ApprovalGate } from './components/ResultsPanel'
import type { ResultView } from './components/ResultsPanel'
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

type TabId = 'agent' | 'business' | 'audiences' | 'creatives' | 'campaign'

interface TabDef {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: TabDef[] = [
  { id: 'agent', label: 'Agent', icon: <Terminal className="w-3.5 h-3.5" /> },
  { id: 'business', label: 'Business', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'audiences', label: 'Audiences', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'creatives', label: 'Ad Creatives', icon: <Palette className="w-3.5 h-3.5" /> },
  { id: 'campaign', label: 'Campaign', icon: <Rocket className="w-3.5 h-3.5" /> },
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
  const [activeTab, setActiveTab] = useState<TabId>('agent')
  const [notifyTabs, setNotifyTabs] = useState<Set<TabId>>(new Set())
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

  // Auto-switch tabs when data arrives
  const switchToTab = useCallback((tab: TabId) => {
    setActiveTab(tab)
    // Add notification glow
    setNotifyTabs(prev => {
      const next = new Set(prev)
      next.add(tab)
      return next
    })
    // Remove glow after animation
    setTimeout(() => {
      setNotifyTabs(prev => {
        const next = new Set(prev)
        next.delete(tab)
        return next
      })
    }, 1500)
  }, [])

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
    if (update.business) {
      setBusiness(update.business)
      switchToTab('business')
      // Switch back to agent after a peek
      setTimeout(() => setActiveTab('agent'), 2500)
    }
    if (update.audiences) {
      setAudiences(update.audiences)
      switchToTab('audiences')
      setTimeout(() => setActiveTab('agent'), 2500)
    }
    if (update.creatives) {
      setCreatives(update.creatives)
      switchToTab('creatives')
      // Stay on creatives a bit longer — it's the payoff
      setTimeout(() => setActiveTab('agent'), 3500)
    }
    if (update.googleAds) {
      setGoogleAds(update.googleAds)
      // Just notify, don't switch (creatives tab will show these too)
      setNotifyTabs(prev => {
        const next = new Set(prev)
        next.add('creatives')
        return next
      })
      setTimeout(() => {
        setNotifyTabs(prev => {
          const next = new Set(prev)
          next.delete('creatives')
          return next
        })
      }, 1500)
    }
    if (update.campaign) {
      setCampaign(update.campaign)
      setIsComplete(true)
      playSuccess()
      setTimeout(() => fireConfetti(), 300)
      speak('Your campaign is ready to launch!', 'high')
      switchToTab('campaign')
    }
    if (update.awaitApproval) {
      setAwaitingApproval(true)
      setIsBuilding(false)
      speak('Strategy complete. Ready to execute your campaign?', 'high')
    }
  }, [switchToTab])

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
    setActiveTab('agent')
    setNotifyTabs(new Set())
    strategyDataRef.current = null

    const result = await buildStrategy(inputUrl, handleUpdate, getUserMessages)
    strategyDataRef.current = result
  }, [handleUpdate, getUserMessages])

  const handleApprove = useCallback(async () => {
    if (!strategyDataRef.current) return
    setAwaitingApproval(false)
    setIsBuilding(true)
    setActiveTab('agent')

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
    setActiveTab('agent')
    setNotifyTabs(new Set())
    strategyDataRef.current = null
  }, [])

  const showBuilder = isBuilding || isComplete || awaitingApproval

  // Tab availability
  const tabAvailable: Record<TabId, boolean> = {
    agent: true,
    business: !!business,
    audiences: !!audiences,
    creatives: !!(creatives || googleAds),
    campaign: !!campaign,
  }

  // Determine whether to show agent browser in Agent tab
  const scrapeStage = stages.find(s => s.id === 'scrape')
  const analyseStage = stages.find(s => s.id === 'analyse')
  const showAgentBrowser = isBuilding && (
    scrapeStage?.status === 'running' ||
    analyseStage?.status === 'running' ||
    (scrapeStage?.status === 'completed' && analyseStage?.status !== 'completed')
  )
  const scanDone = scrapeStage?.status === 'completed'
  const showBrowserFallback = scanDone && analyseStage?.status === 'completed' && !business

  // Map tab to ResultView
  const tabToView: Record<TabId, ResultView | undefined> = {
    agent: undefined,
    business: 'business',
    audiences: 'audiences',
    creatives: 'creatives',
    campaign: 'campaign',
  }

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

      {/* Horizontal Progress Bar — only during build */}
      {showBuilder && (
        <BuildProgress stages={stages} />
      )}

      {/* Main Content */}
      {!showBuilder ? (
        <div className="flex-1 overflow-y-auto">
          <URLInput onSubmit={handleSubmit} isBuilding={isBuilding} />
        </div>
      ) : (
        <>
          {/* Tab Bar */}
          <div className="flex-shrink-0 border-b border-border bg-surface/30 backdrop-blur-sm">
            <div className="flex items-center gap-1 px-6 pt-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                const available = tabAvailable[tab.id]
                const isNotifying = notifyTabs.has(tab.id)

                return (
                  <button
                    key={tab.id}
                    onClick={() => available && setActiveTab(tab.id)}
                    disabled={!available}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer
                      ${isActive
                        ? 'text-accent-bright'
                        : available
                        ? 'text-text-muted hover:text-text'
                        : 'text-text-dim/40 cursor-not-allowed'
                      }
                      ${isNotifying && !isActive ? 'tab-notify' : ''}
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent rounded-full tab-underline-enter" />
                    )}
                    {/* Notification dot for new data */}
                    {available && !isActive && isNotifying && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-bright pulse-dot" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 tab-content-fade">
            {activeTab === 'agent' ? (
              <div className="max-w-6xl mx-auto">
                {/* Agent browser + ThinkingStream layout */}
                <div className={`${showAgentBrowser || showBrowserFallback ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
                  {(showAgentBrowser || showBrowserFallback) && (
                    <div>
                      <AgentBrowser
                        url={url}
                        isActive={isBuilding && !scanDone}
                        currentAction={currentStageAction}
                        scanComplete={scanDone && analyseStage?.status === 'completed'}
                      />
                    </div>
                  )}
                  <div className={`${showAgentBrowser || showBrowserFallback ? '' : 'max-w-3xl mx-auto'}`} style={{ minHeight: '300px' }}>
                    <ThinkingStream lines={thinkingLines} isActive={isBuilding} />
                  </div>
                </div>
              </div>
            ) : (
              <ResultsPanel
                view={tabToView[activeTab]}
                business={business}
                audiences={audiences}
                creatives={creatives}
                googleAds={googleAds}
                campaign={campaign}
                onCreativeEdit={handleCreativeEdit}
                awaitingApproval={awaitingApproval}
                onApprove={handleApprove}
              />
            )}
          </div>

          {/* Bottom Chat Input — full width */}
          <ChatInput
            onSend={handleUserMessage}
            isBuilding={isBuilding}
            isComplete={isComplete}
          />
        </>
      )}

      {/* Approval Gate Modal Overlay */}
      {awaitingApproval && business && audiences && !creatives && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop-enter">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {}} />
          {/* Modal content */}
          <div className="relative z-10 w-full max-w-lg mx-4 modal-card-enter">
            <ApprovalGate
              business={business}
              audiences={audiences}
              onApprove={handleApprove}
            />
          </div>
        </div>
      )}
    </div>
  )
}
