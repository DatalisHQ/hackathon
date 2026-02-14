import { create } from 'zustand'
import type { Mission, MissionConfig, MissionStatus, RunStep, Lead, OutreachMessage, AuditEntry } from '../types'
import { runMission } from '../lib/engine'

interface MissionStore {
  mission: Mission | null
  isRunning: boolean
  
  // Actions
  createMission: (config: MissionConfig) => void
  startMission: () => void
  pauseMission: () => void
  resumeMission: () => void
  
  // Engine callbacks
  addStep: (step: RunStep) => void
  updateStep: (stepId: string, updates: Partial<RunStep>) => void
  addLead: (lead: Lead) => void
  updateLead: (leadId: string, updates: Partial<Lead>) => void
  addMessage: (msg: OutreachMessage) => void
  updateMessage: (msgId: string, updates: Partial<OutreachMessage>) => void
  addAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
  setStatus: (status: MissionStatus) => void
  
  // Approval flow
  approveStep: (stepId: string) => void
  rejectStep: (stepId: string) => void
}

let missionAbort: AbortController | null = null

export const useMissionStore = create<MissionStore>((set, get) => ({
  mission: null,
  isRunning: false,
  
  createMission: (config) => {
    const mission: Mission = {
      id: crypto.randomUUID(),
      config,
      status: 'configuring',
      steps: [],
      leads: [],
      messages: [],
      audit: [],
      createdAt: Date.now(),
    }
    set({ mission })
    get().addAudit({
      actor: 'human',
      action: 'mission_created',
      detail: `Mission created: ${config.niche} in ${config.location}. Autonomy: ${config.autonomy}`,
    })
  },
  
  startMission: () => {
    const { mission } = get()
    if (!mission) return
    
    set({ isRunning: true })
    get().setStatus('running')
    get().addAudit({
      actor: 'human',
      action: 'mission_started',
      detail: 'Mission execution started',
    })
    
    missionAbort = new AbortController()
    runMission(get(), missionAbort.signal)
  },
  
  pauseMission: () => {
    missionAbort?.abort()
    set({ isRunning: false })
    get().setStatus('paused')
    get().addAudit({
      actor: 'human',
      action: 'mission_paused',
      detail: 'Mission paused by operator',
    })
  },
  
  resumeMission: () => {
    const { mission } = get()
    if (!mission) return
    set({ isRunning: true })
    get().setStatus('running')
    get().addAudit({
      actor: 'human',
      action: 'mission_resumed',
      detail: 'Mission resumed by operator',
    })
    missionAbort = new AbortController()
    runMission(get(), missionAbort.signal)
  },
  
  addStep: (step) => set(s => ({
    mission: s.mission ? { ...s.mission, steps: [...s.mission.steps, step] } : null
  })),
  
  updateStep: (stepId, updates) => set(s => ({
    mission: s.mission ? {
      ...s.mission,
      steps: s.mission.steps.map(st => st.id === stepId ? { ...st, ...updates } : st)
    } : null
  })),
  
  addLead: (lead) => set(s => ({
    mission: s.mission ? { ...s.mission, leads: [...s.mission.leads, lead] } : null
  })),
  
  updateLead: (leadId, updates) => set(s => ({
    mission: s.mission ? {
      ...s.mission,
      leads: s.mission.leads.map(l => l.id === leadId ? { ...l, ...updates } : l)
    } : null
  })),
  
  addMessage: (msg) => set(s => ({
    mission: s.mission ? { ...s.mission, messages: [...s.mission.messages, msg] } : null
  })),
  
  updateMessage: (msgId, updates) => set(s => ({
    mission: s.mission ? {
      ...s.mission,
      messages: s.mission.messages.map(m => m.id === msgId ? { ...m, ...updates } : m)
    } : null
  })),
  
  addAudit: (entry) => set(s => ({
    mission: s.mission ? {
      ...s.mission,
      audit: [...s.mission.audit, {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }]
    } : null
  })),
  
  setStatus: (status) => set(s => ({
    mission: s.mission ? {
      ...s.mission,
      status,
      ...(status === 'completed' ? { completedAt: Date.now() } : {})
    } : null
  })),
  
  approveStep: (stepId) => {
    get().updateStep(stepId, { status: 'approved' })
    get().addAudit({
      actor: 'human',
      action: 'step_approved',
      detail: `Approved: ${get().mission?.steps.find(s => s.id === stepId)?.title}`,
      stepId,
    })
    if (get().mission?.status === 'awaiting_approval') {
      get().setStatus('running')
    }
  },
  
  rejectStep: (stepId) => {
    get().updateStep(stepId, { status: 'rejected' })
    get().addAudit({
      actor: 'human',
      action: 'step_rejected',
      detail: `Rejected: ${get().mission?.steps.find(s => s.id === stepId)?.title}`,
      stepId,
    })
    if (get().mission?.status === 'awaiting_approval') {
      get().setStatus('running')
    }
  },
}))
