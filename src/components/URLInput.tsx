import { useState } from 'react'
import { Globe, ArrowRight, Sparkles, Cpu } from 'lucide-react'

interface Props {
  onSubmit: (url: string) => void
  isBuilding: boolean
}

const EXAMPLES = [
  { url: 'https://www.sophiie.ai', label: 'Sophiie AI' },
  { url: 'https://www.getjobber.com', label: 'Jobber' },
  { url: 'https://www.servicetitan.com', label: 'ServiceTitan' },
]

export function URLInput({ onSubmit, isBuilding }: Props) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || isBuilding) return
    onSubmit(url.trim())
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb-float absolute w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            top: '10%',
            left: '15%',
          }}
        />
        <div
          className="orb-float-reverse absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
          }}
        />
        <div
          className="orb-float absolute w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
            top: '50%',
            right: '30%',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Hero */}
      <div className="relative text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent-bright mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Campaign Builder
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold text-text mb-6 leading-[1.05] tracking-tight">
          Paste a URL.<br />
          <span className="bg-gradient-to-r from-accent via-accent-bright to-accent-secondary bg-clip-text text-transparent">Get an ad campaign.</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-muted max-w-lg mx-auto leading-relaxed">
          Watch AI analyse your business and build a complete ad campaign in under 60 seconds.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
        {/* Glow behind input */}
        <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-purple-500/15 to-accent-secondary/20 rounded-3xl blur-2xl opacity-40 pointer-events-none" />
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 via-purple-500/50 to-accent-secondary/50 rounded-2xl blur opacity-0 group-hover:opacity-60 group-focus-within:opacity-80 transition duration-500" />
          <div className="relative flex items-center bg-surface border border-border-bright/50 rounded-2xl overflow-hidden focus-within:border-accent/60 transition shadow-lg shadow-black/20">
            <Globe className="w-5 h-5 text-text-dim ml-5 flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourbusiness.com"
              disabled={isBuilding}
              className="flex-1 bg-transparent px-4 py-5 text-text text-lg placeholder:text-text-dim focus:outline-none disabled:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={!url.trim() || isBuilding}
              className="flex items-center gap-2 px-8 py-5 bg-accent hover:bg-accent-bright text-white font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-base"
            >
              Build
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Examples */}
      <div className="relative flex items-center gap-3 mt-8">
        <span className="text-xs text-text-dim">Try:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex.url}
            onClick={() => { setUrl(ex.url); }}
            disabled={isBuilding}
            className="text-sm px-4 py-2 bg-surface-2/80 border border-border-bright/40 rounded-full text-text-muted hover:text-text hover:border-accent/40 hover:bg-surface-3/50 transition-all duration-300 cursor-pointer disabled:opacity-50 backdrop-blur-sm"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Built by agents tagline */}
      <div className="relative flex items-center gap-1.5 mt-16 text-text-dim">
        <Cpu className="w-3.5 h-3.5" />
        <span className="text-xs tracking-wide">Built by autonomous agents</span>
      </div>
    </div>
  )
}
