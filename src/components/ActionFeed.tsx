import { Activity, Zap, Clock } from 'lucide-react'
import type { ToolCall } from '../types'
import { TOOL_META } from '../lib/agent'

interface Props {
  tools: ToolCall[]
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDuration(start: number, end?: number): string {
  const ms = (end || Date.now()) - start
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function ActionFeed({ tools }: Props) {
  // Stats
  const completed = tools.filter(t => t.status === 'completed').length
  const errors = tools.filter(t => t.status === 'error').length
  const toolTypes = new Set(tools.map(t => t.name)).size

  return (
    <div className="flex flex-col h-full">
      {/* Header stats */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4" />
          Agent Actions
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface rounded-lg p-2 text-center">
            <div className="text-lg font-semibold font-mono text-text">{completed}</div>
            <div className="text-[10px] text-text-dim">Completed</div>
          </div>
          <div className="bg-surface rounded-lg p-2 text-center">
            <div className="text-lg font-semibold font-mono text-accent">{toolTypes}</div>
            <div className="text-[10px] text-text-dim">Tools Used</div>
          </div>
          <div className="bg-surface rounded-lg p-2 text-center">
            <div className="text-lg font-semibold font-mono text-text-muted">{errors}</div>
            <div className="text-[10px] text-text-dim">Errors</div>
          </div>
        </div>
      </div>

      {/* Tool history */}
      <div className="flex-1 overflow-y-auto p-4">
        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Zap className="w-8 h-8 text-text-dim opacity-30 mb-2" />
            <p className="text-xs text-text-dim">Agent actions will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...tools].reverse().map(tool => {
              const meta = TOOL_META[tool.name]
              return (
                <div
                  key={tool.id}
                  className={`slide-in flex items-start gap-2 p-2 rounded-lg transition ${
                    tool.status === 'running'
                      ? 'bg-accent/5 border border-accent/20'
                      : tool.status === 'error'
                      ? 'bg-danger/5 border border-danger/20'
                      : 'hover:bg-surface'
                  }`}
                >
                  <span className="text-sm flex-shrink-0 mt-0.5">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-dim">
                        {tool.status === 'completed' && (
                          <span>{formatDuration(tool.startedAt, tool.completedAt)}</span>
                        )}
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTime(tool.startedAt)}</span>
                      </div>
                    </div>
                    {/* Param summary */}
                    <div className="text-[11px] text-text-dim mt-0.5 truncate">
                      {tool.params.query && `"${tool.params.query}"`}
                      {tool.params.url && tool.params.url}
                      {tool.params.command && `$ ${tool.params.command}`}
                      {tool.params.path && tool.params.path}
                      {tool.params.action && !tool.params.query && !tool.params.url && tool.params.action}
                    </div>
                  </div>
                  {/* Status dot */}
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${
                    tool.status === 'running' ? 'bg-accent pulse-dot'
                    : tool.status === 'error' ? 'bg-danger'
                    : 'bg-success'
                  }`} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
