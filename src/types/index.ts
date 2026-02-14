export type StageId = 
  | 'scrape'
  | 'analyse' 
  | 'audience'
  | 'strategy'
  | 'copy'
  | 'creatives'
  | 'campaign'
  | 'complete'

export type StageStatus = 'pending' | 'running' | 'completed' | 'error'

export interface Stage {
  id: StageId
  label: string
  description: string
  status: StageStatus
  startedAt?: number
  completedAt?: number
  data?: any
  thinkingText?: string
}

export interface BusinessProfile {
  url: string
  name: string
  description: string
  industry: string
  location: string
  strengths: string[]
  weaknesses: string[]
  targetCustomer: string
  tone: string
  colors: string[]
  logoUrl?: string
}

export interface AudiencePersona {
  name: string
  age: string
  description: string
  interests: string[]
  painPoints: string[]
  platforms: string[]
  emoji: string
}

export interface AdCreative {
  id: string
  headline: string
  primaryText: string
  cta: string
  imagePrompt: string
  imageUrl?: string
  angle: string
}

export interface CampaignConfig {
  objective: string
  dailyBudget: number
  currency: string
  duration: number
  audiences: AudiencePersona[]
  creatives: AdCreative[]
  estimatedReach: string
  estimatedCpl: string
  estimatedClicks: string
}

export interface CampaignBuild {
  url: string
  status: 'idle' | 'building' | 'complete' | 'error'
  stages: Stage[]
  business?: BusinessProfile
  audiences?: AudiencePersona[]
  creatives?: AdCreative[]
  campaign?: CampaignConfig
  error?: string
  startedAt?: number
  completedAt?: number
}
