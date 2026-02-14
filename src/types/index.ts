export type ToolName = 
  | 'web_search'
  | 'web_fetch' 
  | 'browser'
  | 'exec'
  | 'read'
  | 'write'
  | 'edit'
  | 'memory_search'
  | 'image'
  | 'tts'
  | 'message'
  | 'cron'
  | 'nodes'
  | 'unknown'

export interface ToolCall {
  id: string
  name: ToolName
  displayName: string
  params: Record<string, any>
  result?: any
  status: 'running' | 'completed' | 'error'
  startedAt: number
  completedAt?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
  isStreaming?: boolean
}

export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'waiting'

export interface AgentState {
  status: AgentStatus
  currentTool?: string
  uptime: number
  messagesProcessed: number
  toolsUsed: number
}
