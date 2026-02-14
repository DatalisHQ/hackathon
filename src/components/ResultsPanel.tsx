import { Building2, Users, Zap, BarChart3, TrendingUp, DollarSign, Calendar, Eye, MousePointer, Target } from 'lucide-react'
import type { BusinessProfile, AudiencePersona, AdCreative, CampaignConfig } from '../types'

interface Props {
  business?: BusinessProfile
  audiences?: AudiencePersona[]
  creatives?: AdCreative[]
  campaign?: CampaignConfig
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`slide-in ${className}`}>
      {children}
    </div>
  )
}

function BusinessCard({ business }: { business: BusinessProfile }) {
  return (
    <Section>
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: business.colors[0] + '20' }}>
            <Building2 className="w-5 h-5" style={{ color: business.colors[0] }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">{business.name}</h3>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>{business.industry}</span>
              <span>•</span>
              <span>{business.location}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-text-muted mb-4 leading-relaxed">{business.description}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-text-dim uppercase tracking-wide mb-1.5">Strengths</div>
            <div className="space-y-1">
              {business.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-success">
                  <span className="mt-0.5">✓</span>
                  <span className="text-text-muted">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-dim uppercase tracking-wide mb-1.5">Opportunities</div>
            <div className="space-y-1">
              {business.weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-warning">
                  <span className="mt-0.5">→</span>
                  <span className="text-text-muted">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand colors */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-[10px] text-text-dim uppercase tracking-wide">Brand</span>
          <div className="flex gap-1">
            {business.colors.map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="text-xs text-text-dim ml-auto">{business.tone}</span>
        </div>
      </div>
    </Section>
  )
}

function AudienceCards({ audiences }: { audiences: AudiencePersona[] }) {
  return (
    <Section>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-text">Target Audiences</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {audiences.map((a, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 slide-in" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{a.emoji}</span>
              <div>
                <div className="text-sm font-medium text-text">{a.name}</div>
                <div className="text-[10px] text-text-dim">Age {a.age} • {a.platforms.join(', ')}</div>
              </div>
            </div>
            <p className="text-xs text-text-muted mb-3">{a.description}</p>
            <div className="flex flex-wrap gap-1">
              {a.interests.map((interest, j) => (
                <span key={j} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full border border-blue-500/20">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function AdPreviewCards({ creatives }: { creatives: AdCreative[] }) {
  return (
    <Section>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-pink-400" />
        <h3 className="text-sm font-medium text-text">Ad Creatives</h3>
      </div>
      <div className="space-y-4">
        {creatives.map((ad, i) => (
          <div key={ad.id} className="bg-surface border border-border rounded-xl overflow-hidden slide-in" style={{ animationDelay: `${i * 200}ms` }}>
            {/* Facebook ad preview */}
            <div className="p-4">
              {/* Ad header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs">🏢</div>
                <div>
                  <div className="text-xs font-medium text-text">Your Business</div>
                  <div className="text-[10px] text-text-dim">Sponsored · 🌐</div>
                </div>
              </div>
              
              {/* Primary text */}
              <p className="text-sm text-text mb-3 leading-relaxed">{ad.primaryText}</p>
              
              {/* Image placeholder */}
              <div className="bg-gradient-to-br from-surface-2 to-surface-3 rounded-lg h-40 flex items-center justify-center border border-border mb-3">
                <div className="text-center">
                  <div className="text-2xl mb-1">🎨</div>
                  <div className="text-[10px] text-text-dim max-w-[200px]">{ad.imagePrompt.slice(0, 60)}...</div>
                </div>
              </div>

              {/* Headline + CTA */}
              <div className="flex items-center justify-between bg-surface-2 rounded-lg p-3 border border-border">
                <div>
                  <div className="text-xs font-semibold text-text">{ad.headline}</div>
                  <div className="text-[10px] text-text-dim">yourbusiness.com</div>
                </div>
                <button className="px-3 py-1.5 bg-accent/20 text-accent text-xs font-medium rounded-md border border-accent/30">
                  {ad.cta}
                </button>
              </div>

              {/* Angle tag */}
              <div className="mt-3 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-text-dim" />
                <span className="text-[10px] text-text-dim">Angle: {ad.angle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function CampaignSummary({ campaign }: { campaign: CampaignConfig }) {
  return (
    <Section>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-medium text-text">Campaign Summary</h3>
      </div>
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Stat icon={<Target className="w-4 h-4 text-accent" />} label="Objective" value={campaign.objective} />
          <Stat icon={<DollarSign className="w-4 h-4 text-success" />} label="Daily Budget" value={`$${campaign.dailyBudget} ${campaign.currency}`} />
          <Stat icon={<Calendar className="w-4 h-4 text-blue-400" />} label="Duration" value={`${campaign.duration} days`} />
          <Stat icon={<Eye className="w-4 h-4 text-purple-400" />} label="Est. Reach" value={campaign.estimatedReach} />
          <Stat icon={<MousePointer className="w-4 h-4 text-amber-400" />} label="Est. Clicks" value={campaign.estimatedClicks} />
          <Stat icon={<TrendingUp className="w-4 h-4 text-pink-400" />} label="Est. CPL" value={campaign.estimatedCpl} />
        </div>

        <div className="pt-4 border-t border-border">
          <button className="w-full py-3 bg-gradient-to-r from-accent to-purple-500 hover:from-accent-bright hover:to-purple-400 text-white font-semibold rounded-xl transition cursor-pointer text-sm">
            🚀 Launch Campaign
          </button>
          <p className="text-[10px] text-text-dim text-center mt-2">Connect your Facebook account to go live</p>
        </div>
      </div>
    </Section>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <div className="text-[10px] text-text-dim">{label}</div>
        <div className="text-sm font-medium text-text">{value}</div>
      </div>
    </div>
  )
}

export function ResultsPanel({ business, audiences, creatives, campaign }: Props) {
  const hasAnything = business || audiences || creatives || campaign

  if (!hasAnything) {
    return (
      <div className="flex items-center justify-center h-full text-text-dim">
        <p className="text-sm">Results will appear here as the AI works...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-1">
      {business && <BusinessCard business={business} />}
      {audiences && <AudienceCards audiences={audiences} />}
      {creatives && <AdPreviewCards creatives={creatives} />}
      {campaign && <CampaignSummary campaign={campaign} />}
    </div>
  )
}
