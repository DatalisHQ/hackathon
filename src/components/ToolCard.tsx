import { Loader2 } from 'lucide-react'
import type { ToolCall } from '../types'
import { TOOL_META } from '../lib/agent'

interface Props {
  tool: ToolCall
}

function formatDuration(start: number, end?: number): string {
  const ms = (end || Date.now()) - start
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function ResultPreview({ tool }: { tool: ToolCall }) {
  if (!tool.result) return null

  switch (tool.name) {
    case 'web_search':
      return (
        <div className="mt-2 space-y-1.5">
          {tool.result.results?.slice(0, 3).map((r: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-text-dim mt-0.5">{i + 1}.</span>
              <div className="min-w-0">
                <div className="text-blue-400 truncate">{r.title}</div>
                <div className="text-text-dim truncate">{r.description?.slice(0, 80)}</div>
              </div>
            </div>
          ))}
        </div>
      )

    case 'web_fetch':
      return (
        <div className="mt-2 text-xs text-text-muted">
          <span className="text-text">{tool.result.title}</span>
          {tool.result.wordCount && <span className="ml-2 text-text-dim">({tool.result.wordCount} words)</span>}
        </div>
      )

    case 'browser':
      return (
        <div className="mt-2 text-xs">
          <div className="bg-surface-3 rounded border border-border p-3 text-center text-text-dim">
            <span className="text-lg">🖥️</span>
            <div className="mt-1">Screenshot captured ({tool.result.dimensions})</div>
          </div>
        </div>
      )

    case 'exec':
      return (
        <div className="mt-2">
          <div className="bg-[#0d1117] rounded border border-border p-2 font-mono text-xs text-green-400">
            <div className="text-text-dim">$ {tool.params.command}</div>
            <div className="mt-1">{tool.result.output}</div>
          </div>
        </div>
      )

    case 'write':
      return (
        <div className="mt-2 text-xs text-text-muted">
          Wrote <span className="text-text font-mono">{tool.result.path}</span>
          <span className="text-text-dim ml-1">({(tool.result.bytes / 1024).toFixed(1)} KB)</span>
        </div>
      )

    case 'memory_search':
      return (
        <div className="mt-2 text-xs text-text-muted">
          {tool.result.matches > 0 
            ? <><span className="text-accent">{tool.result.matches} matches</span> — {tool.result.topSnippet}</>
            : <span className="text-text-dim">No relevant memories found</span>
          }
        </div>
      )

    case 'message':
      return (
        <div className="mt-2 text-xs text-text-muted">
          Sent via <span className="text-emerald-400">{tool.result.channel}</span> ✓
        </div>
      )

    case 'cron':
      return (
        <div className="mt-2 text-xs text-text-muted">
          Job <span className="text-amber-400 font-mono">{tool.result.jobId}</span> scheduled ✓
        </div>
      )

    default:
      return tool.result ? (
        <div className="mt-2 text-xs text-text-dim font-mono truncate">
          {JSON.stringify(tool.result).slice(0, 100)}
        </div>
      ) : null
  }
}

export function ToolCard({ tool }: Props) {
  const meta = TOOL_META[tool.name]
  const isRunning = tool.status === 'running'
  const isError = tool.status === 'error'

  return (
    <div className={`rounded-lg border p-3 transition-all slide-in ${
      isRunning 
        ? 'border-accent/30 bg-accent/5' 
        : isError
        ? 'border-danger/30 bg-danger/5'
        : 'border-border bg-surface'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{meta.icon}</span>
          <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
          {tool.params.query && (
            <span className="text-xs text-text-dim truncate max-w-[200px]">"{tool.params.query}"</span>
          )}
          {tool.params.url && (
            <span className="text-xs text-text-dim truncate max-w-[200px]">{tool.params.url}</span>
          )}
          {tool.params.command && (
            <span className="text-xs text-text-dim font-mono truncate max-w-[200px]">$ {tool.params.command}</span>
          )}
          {tool.params.path && (
            <span className="text-xs text-text-dim font-mono truncate max-w-[200px]">{tool.params.path}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Loader2 className="w-3 h-3 animate-spin text-accent" />
          ) : (
            <span className="text-xs text-text-dim">{formatDuration(tool.startedAt, tool.completedAt)}</span>
          )}
        </div>
      </div>

      <ResultPreview tool={tool} />
    </div>
  )
}
