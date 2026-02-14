import { useState, useCallback } from 'react'
import { Cpu, Wifi } from 'lucide-react'
import type { ChatMessage, ToolCall, AgentStatus } from './types'
import { ChatPanel } from './components/ChatPanel'
import { ActionFeed } from './components/ActionFeed'
import { sendMessage } from './lib/agent'

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [allTools, setAllTools] = useState<ToolCall[]>([])
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle')

  const handleSend = useCallback(async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])

    // Create a placeholder for the assistant response
    const assistantMsgId = crypto.randomUUID()
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      toolCalls: [],
      isStreaming: true,
    }
    setMessages(prev => [...prev, assistantMsg])

    // Run the agent
    await sendMessage(text, (update) => {
      if (update.status) {
        setAgentStatus(update.status)
      }
      if (update.toolCall) {
        const tool = update.toolCall
        // Update the assistant message's tool calls
        setMessages(prev => prev.map(m => {
          if (m.id === assistantMsgId) {
            const existing = m.toolCalls || []
            const existingIndex = existing.findIndex(t => t.id === tool.id)
            const updatedTools = existingIndex >= 0
              ? existing.map(t => t.id === tool.id ? tool : t)
              : [...existing, tool]
            return { ...m, toolCalls: updatedTools }
          }
          return m
        }))
        // Update global tool list
        setAllTools(prev => {
          const existingIndex = prev.findIndex(t => t.id === tool.id)
          if (existingIndex >= 0) {
            return prev.map(t => t.id === tool.id ? tool : t)
          }
          return [...prev, tool]
        })
      }
      if (update.text) {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: update.text!, isStreaming: false, timestamp: Date.now() }
            : m
        ))
      }
    })
  }, [])

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Top bar */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text leading-tight">OpenClaw Agent</h1>
              <p className="text-[10px] text-text-dim">Autonomous AI with real-world tools</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Wifi className="w-3 h-3 text-success" />
              <span>Connected</span>
            </div>
            <div className="text-[10px] text-text-dim bg-surface-2 px-2 py-1 rounded-full">
              {allTools.length} actions
            </div>
          </div>
        </div>
      </header>

      {/* Main content — split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat — left side */}
        <div className="flex-1 flex flex-col border-r border-border">
          <ChatPanel
            messages={messages}
            agentStatus={agentStatus}
            onSend={handleSend}
          />
        </div>

        {/* Action feed — right side */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-surface/30">
          <ActionFeed tools={allTools} />
        </div>
      </div>
    </div>
  )
}
