import { useState } from 'react'
import { Target, MapPin, MessageSquare, Shield, Zap, Users, ArrowRight } from 'lucide-react'
import type { AutonomyLevel, MissionConfig as MissionConfigType } from '../types'

interface Props {
  onSubmit: (config: MissionConfigType) => void
}

const AUTONOMY_LEVELS: { value: AutonomyLevel; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'suggest',
    label: 'Suggest',
    description: 'Agent does the work, you approve every step. Full control.',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
  },
  {
    value: 'copilot',
    label: 'Co-pilot',
    description: 'Agent runs autonomously, pauses only at high-risk decisions.',
    icon: <Users className="w-5 h-5" />,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  },
  {
    value: 'autopilot',
    label: 'Autopilot',
    description: 'Full autonomy. Agent executes end-to-end, you review after.',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  },
]

const PRESET_NICHES = [
  'Dental clinics', 'Gyms & fitness', 'Cafes & restaurants', 'Real estate agents',
  'Beauty salons', 'Physiotherapists', 'Plumbers', 'Accountants',
]

export function MissionConfig({ onSubmit }: Props) {
  const [niche, setNiche] = useState('')
  const [location, setLocation] = useState('')
  const [offer, setOffer] = useState('')
  const [tone, setTone] = useState('professional but friendly')
  const [bannedClaims, setBannedClaims] = useState('')
  const [maxLength, setMaxLength] = useState(150)
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('copilot')
  const [leadCount, setLeadCount] = useState(30)

  const canSubmit = niche.trim() && location.trim() && offer.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      niche: niche.trim(),
      location: location.trim(),
      offer: offer.trim(),
      constraints: {
        tone,
        bannedClaims: bannedClaims.split(',').map(s => s.trim()).filter(Boolean),
        maxLength,
      },
      autonomy,
      leadCount,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text mb-2">New Mission</h1>
        <p className="text-text-muted">Configure your outreach campaign. The agent handles the rest.</p>
      </div>

      {/* Niche */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-text">
          <Target className="w-4 h-4 text-accent" />
          Target Niche
        </label>
        <input
          type="text"
          value={niche}
          onChange={e => setNiche(e.target.value)}
          placeholder="e.g. Dental clinics"
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition"
        />
        <div className="flex flex-wrap gap-2">
          {PRESET_NICHES.map(n => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                niche === n 
                  ? 'border-accent bg-accent/10 text-accent-bright' 
                  : 'border-border text-text-muted hover:border-border-bright hover:text-text'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-text">
          <MapPin className="w-4 h-4 text-accent" />
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Sydney, NSW"
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition"
        />
      </div>

      {/* Offer */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-text">
          <MessageSquare className="w-4 h-4 text-accent" />
          Your Offer
        </label>
        <textarea
          value={offer}
          onChange={e => setOffer(e.target.value)}
          placeholder="e.g. We help dental clinics get 20+ new patient bookings per month using AI-targeted Facebook ads — for a flat $49/mo instead of $2K+ agency fees."
          rows={3}
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition resize-none"
        />
      </div>

      {/* Constraints */}
      <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">Constraints</h3>
        
        <div className="space-y-2">
          <label className="text-sm text-text-muted">Tone</label>
          <input
            type="text"
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-text-muted">Banned claims (comma-separated)</label>
          <input
            type="text"
            value={bannedClaims}
            onChange={e => setBannedClaims(e.target.value)}
            placeholder="e.g. guaranteed results, #1 in Australia"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-text-muted">Max email length (words)</label>
            <input
              type="number"
              value={maxLength}
              onChange={e => setMaxLength(Number(e.target.value))}
              min={50}
              max={500}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-muted">Target leads</label>
            <input
              type="number"
              value={leadCount}
              onChange={e => setLeadCount(Number(e.target.value))}
              min={5}
              max={50}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition"
            />
          </div>
        </div>
      </div>

      {/* Autonomy Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text">Autonomy Level</label>
        <div className="grid grid-cols-3 gap-3">
          {AUTONOMY_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => setAutonomy(level.value)}
              className={`p-4 rounded-lg border text-left transition ${
                autonomy === level.value
                  ? level.color
                  : 'border-border bg-surface hover:border-border-bright'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {level.icon}
                <span className="font-medium text-sm">{level.label}</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
          canSubmit
            ? 'bg-accent hover:bg-accent-bright text-white cursor-pointer'
            : 'bg-surface-2 text-text-dim cursor-not-allowed'
        }`}
      >
        Launch Mission
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
