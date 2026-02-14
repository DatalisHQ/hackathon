export type AutonomyLevel = 'suggest' | 'copilot' | 'autopilot'

export type MissionStatus = 'configuring' | 'running' | 'paused' | 'awaiting_approval' | 'completed' | 'failed'

export type StepType = 
  | 'search'
  | 'scrape'
  | 'score'
  | 'enrich'
  | 'write'
  | 'review'
  | 'queue'
  | 'approval'
  | 'decision'
  | 'export'
  | 'error'

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'awaiting_approval' | 'approved' | 'rejected'

export interface MissionConfig {
  niche: string
  location: string
  offer: string
  constraints: {
    tone: string
    bannedClaims: string[]
    maxLength: number
  }
  autonomy: AutonomyLevel
  leadCount: number
}

export interface Lead {
  id: string
  company: string
  contact: string
  title: string
  email: string
  website: string
  location: string
  score: number
  scoreReason: string
  personalisationHooks: string[]
  enrichedData: Record<string, any>
  status: 'found' | 'scored' | 'enriched' | 'drafted' | 'queued' | 'sent' | 'replied' | 'rejected'
}

export interface OutreachMessage {
  id: string
  leadId: string
  type: 'email' | 'linkedin'
  subject: string
  body: string
  followUpDay: number | null
  status: 'draft' | 'approved' | 'queued' | 'sent'
}

export interface RunStep {
  id: string
  type: StepType
  status: StepStatus
  title: string
  detail: string
  timestamp: number
  duration?: number
  data?: any
  approvalRequired?: boolean
  approvalReason?: string
}

export interface AuditEntry {
  id: string
  timestamp: number
  actor: 'agent' | 'human'
  action: string
  detail: string
  stepId?: string
  data?: any
}

export interface Mission {
  id: string
  config: MissionConfig
  status: MissionStatus
  steps: RunStep[]
  leads: Lead[]
  messages: OutreachMessage[]
  audit: AuditEntry[]
  createdAt: number
  completedAt?: number
}
