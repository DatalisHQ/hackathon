import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User } from 'lucide-react'
import type { ChatMessage, AgentStatus } from '../types'
import { ToolCard } from './ToolCard'

interface Props {
  messages: ChatMessage[]
  agentStatus: AgentStatus
  onSend: (text: string) => void
}

function StatusIndicator({ status }: { status: AgentStatus }) {
  const labels: Record<AgentStatus, { text: string; color: string; pulse: boolean }> = {
    idle: { text: 'Ready', color: 'bg-success', pulse: false },
    thinking: { text: 'Thinking...', color: 'bg-accent', pulse: true },
    acting: { text: 'Working...', color: 'bg-warning', pulse: true },
    waiting: { text: 'Waiting for input', color: 'bg-info', pulse: true },
  }
  const s = labels[status]
  return (
    <div className="flex items-center gap-2 text-xs text-text-muted">
      <span className={`w-2 h-2 rounded-full ${s.color} ${s.pulse ? 'pulse-dot' : ''}`} />
      {s.text}
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`slide-in flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-text-muted'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2 mb-3 w-full max-w-lg">
            {message.toolCalls.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Text */}
        {message.content && (
          <div className={`rounded-2xl px-4 py-2.5 max-w-lg ${
            isUser
              ? 'bg-accent text-white rounded-br-md'
              : 'bg-surface-2 text-text rounded-bl-md'
          }`}>
            <div className="text-sm whitespace-pre-wrap leading-relaxed prose-sm">
              <FormattedText text={message.content} />
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-[10px] text-text-dim mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function FormattedText({ text }: { text: string }) {
  // Simple markdown-like formatting
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>
        }
        if (part === '\n') {
          return <br key={i} />
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export function ChatPanel({ messages, agentStatus, onSend }: Props) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || agentStatus === 'thinking' || agentStatus === 'acting') return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">OpenClaw Agent</h2>
            <p className="text-sm text-text-muted max-w-sm">
              I'm an AI agent that can search the web, analyse websites, run commands, send messages, and control devices. Try asking me to do something.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 max-w-md justify-center">
              {[
                'Search for AI startups in Sydney',
                'Analyse https://zuckerbot.ai',
                'Write a cold outreach email',
                'Schedule a daily report',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus() }}
                  className="px-3 py-1.5 text-xs bg-surface-2 border border-border rounded-full text-text-muted hover:text-text hover:border-border-bright transition cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {(agentStatus === 'thinking' || agentStatus === 'acting') && (
          <div className="flex items-center gap-3 slide-in">
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center">
              <Bot className="w-4 h-4 text-text-muted" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Loader2 className="w-3 h-3 animate-spin" />
              {agentStatus === 'thinking' ? 'Thinking...' : 'Working...'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusIndicator status={agentStatus} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask the agent to do something..."
            disabled={agentStatus === 'thinking' || agentStatus === 'acting'}
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || agentStatus === 'thinking' || agentStatus === 'acting'}
            className="px-4 py-3 bg-accent hover:bg-accent-bright text-white rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
