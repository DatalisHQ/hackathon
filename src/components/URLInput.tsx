import { useState } from 'react'
import { Globe, ArrowRight, Sparkles } from 'lucide-react'

interface Props {
  onSubmit: (url: string) => void
  isBuilding: boolean
}

const EXAMPLES = [
  { url: 'https://www.sophiie.ai', label: 'Sophiie AI' },
  { url: 'https://zuckerbot.ai', label: 'ZuckerBot' },
  { url: 'https://www.runtopia.org', label: 'Runtopia' },
]

export function URLInput({ onSubmit, isBuilding }: Props) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || isBuilding) return
    onSubmit(url.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent-bright mb-6">
          <Sparkles className="w-3 h-3" />
          AI-Powered Campaign Builder
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-text mb-4 leading-tight tracking-tight">
          Paste a URL.<br />
          <span className="text-accent">Get an ad campaign.</span>
        </h1>
        <p className="text-lg text-text-muted max-w-md mx-auto">
          Watch AI analyse your business and build a complete Facebook ad campaign in under 60 seconds.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-purple-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <div className="relative flex items-center bg-surface border border-border rounded-2xl overflow-hidden focus-within:border-accent transition">
            <Globe className="w-5 h-5 text-text-dim ml-4 flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourbusiness.com"
              disabled={isBuilding}
              className="flex-1 bg-transparent px-4 py-4 text-text text-lg placeholder:text-text-dim focus:outline-none disabled:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={!url.trim() || isBuilding}
              className="flex items-center gap-2 px-6 py-4 bg-accent hover:bg-accent-bright text-white font-medium transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Build
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Examples */}
      <div className="flex items-center gap-3 mt-6">
        <span className="text-xs text-text-dim">Try:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex.url}
            onClick={() => { setUrl(ex.url); }}
            disabled={isBuilding}
            className="text-xs px-3 py-1.5 bg-surface-2 border border-border rounded-full text-text-muted hover:text-text hover:border-border-bright transition cursor-pointer disabled:opacity-50"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}
