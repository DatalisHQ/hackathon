import { useState } from 'react'
import { Building2, Users, Zap, BarChart3, TrendingUp, DollarSign, Calendar, Eye, MousePointer, Target, Pencil, Check, RefreshCw, Share2, CheckCircle2, Search, ArrowRight, Shield, ThumbsUp, MessageCircle } from 'lucide-react'
import type { BusinessProfile, AudiencePersona, AdCreative, GoogleAd, CampaignConfig } from '../types'
import { ABTestPanel } from './ABTestPanel'

export type ResultView = 'business' | 'audiences' | 'creatives' | 'campaign'

interface Props {
  view?: ResultView
  business?: BusinessProfile
  audiences?: AudiencePersona[]
  creatives?: AdCreative[]
  googleAds?: GoogleAd[]
  campaign?: CampaignConfig
  onCreativeEdit?: (id: string, field: string, value: string) => void
  awaitingApproval?: boolean
  onApprove?: () => void
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`slide-in ${className}`}>
      {children}
    </div>
  )
}

export function BusinessCard({ business }: { business: BusinessProfile }) {
  return (
    <Section>
      <div className="gradient-border bg-surface rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: business.colors[0] + '20' }}>
            <Building2 className="w-6 h-6" style={{ color: business.colors[0] }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text">{business.name}</h3>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              <span>{business.industry}</span>
              <span className="text-text-dim">•</span>
              <span>{business.location}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-text-muted mb-5 leading-relaxed">{business.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-text-dim uppercase tracking-wider mb-2 font-medium">Strengths</div>
            <div className="space-y-1.5">
              {business.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-success">
                  <span className="mt-0.5">✓</span>
                  <span className="text-text-muted">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-dim uppercase tracking-wider mb-2 font-medium">Opportunities</div>
            <div className="space-y-1.5">
              {business.weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-warning">
                  <span className="mt-0.5">→</span>
                  <span className="text-text-muted">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand colors */}
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border-bright/30">
          <span className="text-[10px] text-text-dim uppercase tracking-wider font-medium">Brand</span>
          <div className="flex gap-1.5">
            {business.colors.map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="text-xs text-text-dim ml-auto">{business.tone}</span>
        </div>
      </div>
    </Section>
  )
}

export function AudienceCards({ audiences }: { audiences: AudiencePersona[] }) {
  return (
    <Section>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-text">Target Audiences</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {audiences.map((a, i) => (
          <div key={i} className="gradient-border bg-surface rounded-2xl p-5 slide-in" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{a.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-text">{a.name}</div>
                <div className="text-[10px] text-text-dim">Age {a.age} • {a.platforms.join(', ')}</div>
              </div>
            </div>
            <p className="text-xs text-text-muted mb-3 leading-relaxed">{a.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {a.interests.map((interest, j) => (
                <span key={j} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-full border border-blue-500/20">
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

export function ApprovalGate({ business, audiences, onApprove }: { business: BusinessProfile; audiences: AudiencePersona[]; onApprove: () => void }) {
  return (
    <Section>
      <div className="relative rounded-2xl overflow-hidden">
        {/* Dramatic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-purple-500/10 to-accent-secondary/15 gradient-shift" />
        <div className="absolute inset-0 border-2 border-accent/30 rounded-2xl pointer-events-none" />
        
        <div className="relative p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/30 to-purple-500/30 flex items-center justify-center mb-4 backdrop-blur-sm border border-accent/20">
              <Shield className="w-8 h-8 text-accent-bright" />
            </div>
            <h3 className="text-xl font-bold text-text mb-1">Strategy Complete</h3>
            <p className="text-sm text-text-muted">Phase 1 analysis finished — ready for campaign execution</p>
          </div>

          <div className="bg-bg/60 backdrop-blur-sm rounded-xl p-5 mb-6 border border-border-bright/30">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-lg font-bold text-text">{business.name}</div>
                <div className="text-[10px] text-text-dim uppercase tracking-wider mt-1">Business</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent-bright">{audiences.length}</div>
                <div className="text-[10px] text-text-dim uppercase tracking-wider mt-1">Audiences</div>
              </div>
              <div>
                <div className="text-lg font-bold text-success">Lead Gen</div>
                <div className="text-[10px] text-text-dim uppercase tracking-wider mt-1">Objective</div>
              </div>
            </div>
          </div>

          <p className="text-sm text-text-muted mb-6 text-center max-w-md mx-auto leading-relaxed">
            We've analysed <strong className="text-text">{business.name}</strong>, identified {audiences.length} target audiences, 
            and planned a lead generation strategy. Ready to generate ad copy, creatives, and assemble your campaign?
          </p>

          <button
            onClick={onApprove}
            className="w-full py-4 bg-gradient-to-r from-accent to-purple-500 hover:from-accent-bright hover:to-purple-400 text-white font-bold rounded-xl transition cursor-pointer text-base flex items-center justify-center gap-2 group shadow-lg shadow-accent/20 hover:shadow-accent/40"
          >
            Execute Campaign
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </Section>
  )
}

function EditableText({ value, onSave, className = '', multiline = false }: { 
  value: string; onSave: (v: string) => void; className?: string; multiline?: boolean 
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) {
    return (
      <div className="flex items-start gap-1">
        {multiline ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="flex-1 bg-surface-3 border border-accent/30 rounded-lg px-2 py-1 text-sm text-text focus:outline-none resize-none"
            rows={3}
            autoFocus
          />
        ) : (
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="flex-1 bg-surface-3 border border-accent/30 rounded-lg px-2 py-1 text-sm text-text focus:outline-none"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') { onSave(draft); setEditing(false) } }}
          />
        )}
        <button onClick={() => { onSave(draft); setEditing(false) }} className="p-1 text-success hover:bg-success/10 rounded cursor-pointer">
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className={`group relative cursor-pointer ${className}`} onClick={() => { setDraft(value); setEditing(true) }}>
      {value}
      <Pencil className="w-3 h-3 text-text-dim opacity-0 group-hover:opacity-100 absolute -right-4 top-0.5 transition" />
    </div>
  )
}

export function AdPreviewCards({ creatives, onEdit, brandColors }: { creatives: AdCreative[]; onEdit?: (id: string, field: string, value: string) => void; brandColors?: string[] }) {
  return (
    <Section>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-pink-400" />
        <h3 className="text-sm font-semibold text-text">Facebook Ad Creatives</h3>
        <span className="text-[10px] text-text-dim ml-auto">Click any text to edit</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {creatives.map((rawAd, i) => {
          const ad = { ...rawAd, _brandColors: brandColors } as AdCreative & { _brandColors?: string[] }
          return (
          <div key={ad.id} className="gradient-border bg-surface rounded-2xl overflow-hidden slide-in" style={{ animationDelay: `${i * 200}ms` }}>
            <div className="p-5">
              {/* Facebook post header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm">🏢</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text">Your Business</div>
                  <div className="flex items-center gap-1 text-[11px] text-text-dim">
                    <span>Sponsored</span>
                    <span>·</span>
                    <span>🌐</span>
                  </div>
                </div>
                <div className="text-text-dim text-lg">···</div>
              </div>
              
              {/* Primary text — editable */}
              <div className="text-sm text-text mb-4 leading-relaxed">
                <EditableText 
                  value={ad.primaryText} 
                  onSave={v => onEdit?.(ad.id, 'primaryText', v)}
                  multiline 
                />
              </div>
              
              {/* Image placeholder — dynamic gradient mockup */}
              <div className="rounded-xl h-48 relative group overflow-hidden border border-border-bright/30 mb-0">
                {/* Animated gradient background using brand colors */}
                <div
                  className="absolute inset-0 gradient-shift opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${ad._brandColors?.[0] || '#6366f1'}22 0%, ${ad._brandColors?.[1] || '#06b6d4'}33 30%, ${ad._brandColors?.[0] || '#6366f1'}22 60%, ${ad._brandColors?.[2] || '#a855f7'}33 100%)`,
                  }}
                />
                {/* Grid/blueprint overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `
                    linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }} />
                {/* Wireframe mockup elements */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-2/3 h-3 rounded-full bg-white/10" />
                    <div className="w-1/2 h-2 rounded-full bg-white/6" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="w-3/4 h-2 rounded-full bg-white/8" />
                      <div className="w-1/2 h-2 rounded-full bg-white/5" />
                    </div>
                    <div className="w-16 h-7 rounded-lg bg-white/10 border border-white/10" />
                  </div>
                </div>
                {/* Image prompt overlay */}
                <div className="absolute inset-0 flex items-center justify-center px-6">
                  <p className="text-[11px] text-text-muted/70 font-mono text-center leading-relaxed max-w-[280px] select-none">
                    {ad.imagePrompt.slice(0, 120)}{ad.imagePrompt.length > 120 ? '...' : ''}
                  </p>
                </div>
                {/* AI Generated badge */}
                <div className="absolute top-3 right-3 bg-bg/70 backdrop-blur-sm border border-accent/30 rounded-full px-2.5 py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                  <span className="text-[9px] text-accent-bright font-semibold uppercase tracking-wider">AI Generated</span>
                </div>
                {/* Hover regenerate overlay */}
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-xl z-10">
                  <span className="text-xs text-accent flex items-center gap-1.5 bg-surface/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </span>
                </div>
              </div>

              {/* Headline + CTA bar */}
              <div className="flex items-center justify-between bg-surface-2/80 p-4 border-t border-border-bright/20">
                <div>
                  <div className="text-sm font-bold text-text mb-0.5">
                    <EditableText value={ad.headline} onSave={v => onEdit?.(ad.id, 'headline', v)} />
                  </div>
                  <div className="text-[11px] text-text-dim">yourbusiness.com</div>
                </div>
                <button className="px-4 py-2 bg-accent/20 text-accent text-sm font-semibold rounded-lg border border-accent/30 hover:bg-accent/30 transition">
                  {ad.cta}
                </button>
              </div>

              {/* Facebook action bar */}
              <div className="flex items-center justify-around py-3 border-t border-border-bright/20 text-text-dim">
                <button className="flex items-center gap-1.5 text-xs hover:text-text transition">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Like</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-text transition">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-text transition">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Angle tag */}
              <div className="pt-3 border-t border-border-bright/20 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-text-dim" />
                <span className="text-[10px] text-text-dim">Angle: {ad.angle}</span>
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </Section>
  )
}

export function GoogleAdCards({ googleAds }: { googleAds: GoogleAd[] }) {
  return (
    <Section>
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-text">Google Search Ads</h3>
        <span className="text-[10px] text-text-dim ml-auto">Preview</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {googleAds.map((ad, i) => (
          <div
            key={ad.id}
            className="gradient-border bg-surface rounded-2xl p-5 slide-in"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            {/* Sponsored label */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-semibold text-text-dim bg-surface-2 px-2 py-0.5 rounded">Sponsored</span>
            </div>

            {/* Display URL */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center">
                <span className="text-[8px] text-text-dim">🔒</span>
              </div>
              <span className="text-xs text-[#76d6a1]">{ad.displayUrl}</span>
            </div>

            {/* Headlines as blue links */}
            <h4 className="text-[#8ab4f8] text-base font-medium leading-snug mb-2 hover:underline cursor-pointer">
              {ad.headlines.join(' | ')}
            </h4>

            {/* Descriptions */}
            <div className="space-y-0.5 mb-3">
              {ad.descriptions.map((desc, j) => (
                <p key={j} className="text-xs text-text-muted leading-relaxed">{desc}</p>
              ))}
            </div>

            {/* Sitelinks */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3 border-t border-border-bright/30">
              {ad.siteLinks.map((link, j) => (
                <span key={j} className="text-xs text-[#8ab4f8] hover:underline cursor-pointer">{link}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function CampaignSummary({ campaign }: { campaign: CampaignConfig }) {
  return (
    <Section>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-text">Campaign Summary</h3>
      </div>
      <div className="gradient-border bg-surface rounded-2xl p-6">
        {/* Revolut-style stat grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard icon={<Target className="w-5 h-5 text-accent" />} label="Objective" value={campaign.objective} />
          <StatCard icon={<DollarSign className="w-5 h-5 text-success" />} label="Daily Budget" value={`$${campaign.dailyBudget} ${campaign.currency}`} />
          <StatCard icon={<Calendar className="w-5 h-5 text-blue-400" />} label="Duration" value={`${campaign.duration} days`} />
          <StatCard icon={<Eye className="w-5 h-5 text-purple-400" />} label="Est. Reach" value={campaign.estimatedReach} />
          <StatCard icon={<MousePointer className="w-5 h-5 text-amber-400" />} label="Est. Clicks" value={campaign.estimatedClicks} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-pink-400" />} label="Est. CPL" value={campaign.estimatedCpl} />
        </div>

        <div className="pt-5 border-t border-border-bright/30 space-y-3">
          <button className="w-full py-4 bg-gradient-to-r from-accent to-purple-500 hover:from-accent-bright hover:to-purple-400 text-white font-bold rounded-xl transition cursor-pointer text-base shadow-lg shadow-accent/20 hover:shadow-accent/40 flex items-center justify-center gap-2">
            🚀 Launch Campaign
          </button>
          <ShareButton />
          <p className="text-[10px] text-text-dim text-center mt-2">Connect your Facebook account to go live</p>
        </div>
      </div>
    </Section>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-bg/50 rounded-xl p-4 border border-border-bright/20">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] text-text-dim uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-base font-bold text-text">{value}</div>
    </div>
  )
}

function ShareButton() {
  const [copied, setCopied] = useState(false)
  
  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full py-3 flex items-center justify-center gap-2 bg-surface-2 hover:bg-surface-3 border border-border-bright/30 rounded-xl transition cursor-pointer text-sm text-text-muted hover:text-text"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-success">Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share Campaign
        </>
      )}
    </button>
  )
}

export function ResultsPanel({ view, business, audiences, creatives, googleAds, campaign, onCreativeEdit, awaitingApproval, onApprove }: Props) {
  // If view prop is specified, render only that section
  if (view) {
    switch (view) {
      case 'business':
        return business ? (
          <div className="max-w-3xl mx-auto"><BusinessCard business={business} /></div>
        ) : null
      case 'audiences':
        return audiences ? (
          <div className="max-w-5xl mx-auto"><AudienceCards audiences={audiences} /></div>
        ) : null
      case 'creatives':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {creatives && <AdPreviewCards creatives={creatives} onEdit={onCreativeEdit} brandColors={business?.colors} />}
            {googleAds && <GoogleAdCards googleAds={googleAds} />}
          </div>
        )
      case 'campaign':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {campaign && <CampaignSummary campaign={campaign} />}
            {creatives && business && campaign && (
              <ABTestPanel creatives={creatives} business={business} campaign={campaign} />
            )}
          </div>
        )
    }
  }

  // Legacy: render all sections sequentially (fallback)
  const hasAnything = business || audiences || creatives || googleAds || campaign

  if (!hasAnything) {
    return (
      <div className="flex items-center justify-center h-full text-text-dim">
        <p className="text-sm">Results will appear here as the AI works...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-1">
      {business && <BusinessCard business={business} />}
      {audiences && <AudienceCards audiences={audiences} />}
      {awaitingApproval && business && audiences && !creatives && (
        <ApprovalGate business={business} audiences={audiences} onApprove={onApprove!} />
      )}
      {creatives && <AdPreviewCards creatives={creatives} onEdit={onCreativeEdit} brandColors={business?.colors} />}
      {googleAds && <GoogleAdCards googleAds={googleAds} />}
      {campaign && <CampaignSummary campaign={campaign} />}
      {creatives && business && campaign && (
        <ABTestPanel creatives={creatives} business={business} campaign={campaign} />
      )}
    </div>
  )
}
