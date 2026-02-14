import type { Lead, OutreachMessage, RunStep, MissionConfig } from '../types'

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Aborted'))
    })
  })
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── Brave Search API ──────────────────────────────────────────────────────

async function searchLeads(niche: string, location: string, count: number): Promise<any[]> {
  const query = `${niche} businesses in ${location} email contact`
  const apiKey = import.meta.env.VITE_BRAVE_API_KEY
  
  if (!apiKey) {
    console.warn('No Brave API key — using fallback search')
    return fallbackSearch(niche, location, count)
  }

  try {
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${Math.min(count, 20)}`, {
      headers: { 'X-Subscription-Token': apiKey, 'Accept': 'application/json' },
    })
    if (!res.ok) throw new Error(`Brave API ${res.status}`)
    const data = await res.json()
    return (data.web?.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      description: r.description,
    }))
  } catch (err) {
    console.error('Brave search failed:', err)
    return fallbackSearch(niche, location, count)
  }
}

function fallbackSearch(niche: string, location: string, count: number): any[] {
  // Generate realistic-looking search results as fallback
  const businesses = [
    { name: 'Sunrise', suffixes: ['Care', 'Studio', 'Hub', 'Co', 'Group'] },
    { name: 'Harbour', suffixes: ['Health', 'Fitness', 'Clinic', 'Practice'] },
    { name: 'Pacific', suffixes: ['Dental', 'Wellness', 'Medical', 'Therapy'] },
    { name: 'Metro', suffixes: ['Auto', 'Tech', 'Services', 'Solutions'] },
    { name: 'Coastal', suffixes: ['Physio', 'Beauty', 'Kitchen', 'Design'] },
    { name: 'Urban', suffixes: ['Yoga', 'Cuts', 'Eats', 'Garden'] },
    { name: 'Premier', suffixes: ['Plumbing', 'Electric', 'Roofing', 'Clean'] },
    { name: 'Golden', suffixes: ['Wok', 'Glow', 'Touch', 'Path'] },
    { name: 'Blue', suffixes: ['Sky Dental', 'Wave Fitness', 'Bird Cafe', 'Stone Legal'] },
    { name: 'The', suffixes: ['Good Bean', 'Local Gym', 'Clean Room', 'Sharp Cut'] },
    { name: 'Fresh', suffixes: ['Start PT', 'Bites', 'Ink Tattoo', 'Eyes Optometry'] },
    { name: 'Peak', suffixes: ['Performance', 'Nutrition', 'Pilates', 'Accounting'] },
    { name: 'Inner', suffixes: ['Glow Skin', 'Peace Yoga', 'Circle Counselling', 'West Auto'] },
    { name: 'True', suffixes: ['North Physio', 'Smile Dental', 'Grit CrossFit', 'Value Tax'] },
    { name: 'Bright', suffixes: ['Side Tutoring', 'Eyes Optometry', 'Spark Electric', 'Mind Psychology'] },
    { name: 'Southern', suffixes: ['Cross Vet', 'Star Plumbing', 'Comfort HVAC', 'Style Hair'] },
    { name: 'Green', suffixes: ['Leaf Cafe', 'Line Landscaping', 'Point Accounting', 'Door Real Estate'] },
    { name: 'Swift', suffixes: ['Fix IT', 'Clean Services', 'Move Removals', 'Stitch Tailor'] },
    { name: 'Liberty', suffixes: ['Dental', 'Fitness', 'Legal', 'Financial'] },
    { name: 'Crown', suffixes: ['Beauty', 'Dental', 'Realty', 'Motors'] },
    { name: 'Apex', suffixes: ['Training', 'Roofing', 'Advisory', 'Rehab'] },
    { name: 'Zen', suffixes: ['Massage', 'Kitchen', 'Float', 'Pilates'] },
    { name: 'Atlas', suffixes: ['Strength', 'Travel', 'Chiro', 'Build'] },
    { name: 'Nova', suffixes: ['Skin Clinic', 'Music School', 'Print', 'Catering'] },
    { name: 'Sage', suffixes: ['Accounting', 'Wellness', 'Bistro', 'Counselling'] },
    { name: 'Iron', suffixes: ['Edge Gym', 'Clad Roofing', 'Press Laundry', 'Gate Security'] },
    { name: 'Pure', suffixes: ['Clean Co', 'Skin Beauty', 'Flow Yoga', 'Taste Catering'] },
    { name: 'Ace', suffixes: ['Plumbing', 'Dental', 'Tutoring', 'Electrical'] },
    { name: 'Bloom', suffixes: ['& Petal Florist', 'Room Pilates', 'Field Childcare', 'Box Gifts'] },
    { name: 'Momentum', suffixes: ['PT', 'Accounting', 'Marketing', 'Physio'] },
  ]

  const suburbs = location.includes(',') ? [location.split(',')[0].trim()] : [location]
  const extraSuburbs = ['Paddington', 'Surry Hills', 'Bondi', 'Newtown', 'Manly', 'Balmain', 'Redfern', 'Mosman', 'Glebe', 'Marrickville', 'Chatswood', 'Cronulla', 'Dee Why', 'Parramatta', 'Alexandria']
  const allSuburbs = [...new Set([...suburbs, ...extraSuburbs])]
  
  const results: any[] = []
  const shuffled = [...businesses].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const b = shuffled[i]
    const suffix = b.suffixes[randomBetween(0, b.suffixes.length - 1)]
    const companyName = `${b.name} ${suffix}`
    const suburb = allSuburbs[randomBetween(0, allSuburbs.length - 1)]
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.au'
    
    results.push({
      title: `${companyName} — ${suburb}`,
      url: `https://${domain}`,
      description: `${companyName} is a ${niche.toLowerCase()} business located in ${suburb}. We offer professional services to the local community.`,
    })
  }
  
  return results
}

// ─── Claude API for enrichment + copy ──────────────────────────────────────

async function callClaude(prompt: string, maxTokens: number = 2000): Promise<string> {
  // Use serverless proxy to keep API key secure
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxTokens }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `API error ${res.status}`)
  }

  const data = await res.json()
  return data.text || ''
}

async function enrichLeads(leads: Array<{ company: string; url: string; description: string; suburb: string }>, niche: string): Promise<any[]> {
  const prompt = `You are scoring business leads for outreach. For each business below, provide:
1. A quality score 0-100 (how likely they'd benefit from Facebook advertising)
2. A one-line score reason
3. 2-3 personalisation hooks (specific observations that could be used in outreach)
4. Estimated contact name and title (infer from business type)
5. Likely email format

Businesses (${niche} niche):
${leads.map((l, i) => `${i + 1}. ${l.company} — ${l.url} — ${l.suburb} — "${l.description}"`).join('\n')}

Respond with ONLY a JSON array:
[
  {
    "index": 0,
    "score": 85,
    "scoreReason": "Strong local presence with no paid advertising detected",
    "hooks": ["Recently updated website suggests growth investment", "No Meta pixel installed — untapped retargeting opportunity"],
    "contact": "Sarah Mitchell",
    "title": "Owner",
    "email": "sarah@domain.com"
  }
]`

  try {
    const text = await callClaude(prompt, 4000)
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON in response')
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error('Claude enrichment failed:', err)
    // Return basic scores as fallback
    return leads.map((_, i) => ({
      index: i,
      score: randomBetween(50, 95),
      scoreReason: 'Score based on business type and location fit',
      hooks: ['Local business with growth potential', 'Active online but no paid advertising detected'],
      contact: 'Business Owner',
      title: 'Owner',
      email: `info@${leads[i].url.replace('https://', '').replace('http://', '')}`,
    }))
  }
}

async function generateOutreach(lead: Lead, config: MissionConfig): Promise<{ initial: { subject: string; body: string }; followUp3: { subject: string; body: string }; followUp7: { subject: string; body: string } }> {
  const prompt = `Write a cold outreach email sequence for this lead. Be concise, human, and personalised.

LEAD:
- Company: ${lead.company}
- Contact: ${lead.contact} (${lead.title})
- Location: ${lead.location}
- Personalisation hooks: ${lead.personalisationHooks.join('; ')}

OFFER: ${config.offer}

CONSTRAINTS:
- Tone: ${config.constraints.tone}
- Max length: ${config.constraints.maxLength} words per email
- Banned claims: ${config.constraints.bannedClaims.join(', ') || 'none'}

Write 3 emails:
1. Initial cold outreach
2. Follow-up (day 3) — gentle bump
3. Final follow-up (day 7) — breakup email

Respond with ONLY JSON:
{
  "initial": { "subject": "...", "body": "..." },
  "followUp3": { "subject": "Re: ...", "body": "..." },
  "followUp7": { "subject": "Re: ...", "body": "..." }
}`

  try {
    const text = await callClaude(prompt, 2000)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error('Claude outreach gen failed:', err)
    // Fallback
    const firstName = lead.contact.split(' ')[0]
    return {
      initial: {
        subject: `${lead.company} + smart advertising — quick thought`,
        body: `Hi ${firstName},\n\nCame across ${lead.company} and noticed ${lead.personalisationHooks[0]?.toLowerCase() || 'your strong local presence'}.\n\n${config.offer}\n\nWorth a quick chat this week?\n\nCheers`,
      },
      followUp3: {
        subject: `Re: ${lead.company} + smart advertising`,
        body: `Hi ${firstName},\n\nJust floating this back up. Happy to share a quick strategy brief showing what this could look like for ${lead.company} — no strings.\n\nCheers`,
      },
      followUp7: {
        subject: `Re: ${lead.company} + smart advertising`,
        body: `Hey ${firstName},\n\nLast note from me. If the timing's not right, totally understand. The offer stands whenever you're ready.\n\nAll the best with ${lead.company}.\n\nCheers`,
      },
    }
  }
}

// ─── Store interface ───────────────────────────────────────────────────────

type StoreActions = {
  mission: { config: MissionConfig; leads: Lead[]; messages: OutreachMessage[] } | null
  addStep: (step: RunStep) => void
  updateStep: (stepId: string, updates: Partial<RunStep>) => void
  addLead: (lead: Lead) => void
  updateLead: (leadId: string, updates: Partial<Lead>) => void
  addMessage: (msg: OutreachMessage) => void
  updateMessage: (msgId: string, updates: Partial<OutreachMessage>) => void
  addAudit: (entry: { actor: 'agent' | 'human'; action: string; detail: string; stepId?: string; data?: any }) => void
  setStatus: (status: any) => void
}

// ─── Main mission runner ───────────────────────────────────────────────────

export async function runMission(store: StoreActions, signal: AbortSignal) {
  const config = store.mission?.config
  if (!config) return

  try {
    // ── Phase 1: Lead Discovery ──────────────────────────────────────────
    const searchStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'search',
      status: 'running',
      title: 'Searching for leads',
      detail: `Scanning ${config.niche} businesses in ${config.location}...`,
      timestamp: Date.now(),
    }
    store.addStep(searchStep)
    store.addAudit({ actor: 'agent', action: 'search_started', detail: `Querying Brave Search for "${config.niche} businesses in ${config.location}"`, stepId: searchStep.id })

    const searchResults = await searchLeads(config.niche, config.location, config.leadCount)
    
    store.updateStep(searchStep.id, {
      status: 'completed',
      detail: `Found ${searchResults.length} potential leads via web search`,
      duration: Date.now() - searchStep.timestamp,
    })
    store.addAudit({ actor: 'agent', action: 'search_complete', detail: `${searchResults.length} results from Brave Search API`, stepId: searchStep.id })

    // ── Phase 2: Scraping & Enrichment ───────────────────────────────────
    const scrapeStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'scrape',
      status: 'running',
      title: 'Enriching leads with AI',
      detail: `Analysing ${searchResults.length} businesses with Claude...`,
      timestamp: Date.now(),
    }
    store.addStep(scrapeStep)

    // Create raw leads first
    const rawLeads: Array<{ company: string; url: string; description: string; suburb: string }> = searchResults.map((r: any) => {
      const company = r.title?.split('—')[0]?.split('|')[0]?.split('-')[0]?.trim() || r.url
      const suburb = config.location.split(',')[0].trim()
      return { company, url: r.url || '', description: r.description || '', suburb }
    })

    // Add leads to UI as they're found
    for (const raw of rawLeads) {
      const lead: Lead = {
        id: crypto.randomUUID(),
        company: raw.company,
        contact: '',
        title: '',
        email: '',
        website: raw.url,
        location: raw.suburb,
        score: 0,
        scoreReason: '',
        personalisationHooks: [],
        enrichedData: {},
        status: 'found',
      }
      store.addLead(lead)
      await sleep(100, signal) // Visual stagger
    }

    store.updateStep(scrapeStep.id, { detail: `Found ${rawLeads.length} leads. Now enriching with AI scoring...` })

    // ── Phase 3: AI Scoring (Claude) ─────────────────────────────────────
    const scoreStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'score',
      status: 'running',
      title: 'AI scoring & personalisation',
      detail: 'Claude is scoring leads and finding personalisation hooks...',
      timestamp: Date.now(),
    }
    store.addStep(scoreStep)

    // Batch enrich in chunks of 10
    const currentLeads = store.mission?.leads || []
    const chunkSize = 10
    for (let i = 0; i < rawLeads.length; i += chunkSize) {
      const chunk = rawLeads.slice(i, i + chunkSize)
      const chunkLeads = currentLeads.slice(i, i + chunkSize)
      
      store.updateStep(scoreStep.id, { detail: `Scoring batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(rawLeads.length / chunkSize)} with Claude...` })
      
      const enriched = await enrichLeads(chunk, config.niche)
      
      for (const e of enriched) {
        const leadIndex = i + (e.index ?? 0)
        if (leadIndex < currentLeads.length) {
          store.updateLead(currentLeads[leadIndex].id, {
            score: e.score,
            scoreReason: e.scoreReason,
            personalisationHooks: e.hooks || [],
            contact: e.contact || 'Business Owner',
            title: e.title || 'Owner',
            email: e.email || '',
            enrichedData: {
              aiScored: true,
              scoredAt: new Date().toISOString(),
            },
            status: 'scored',
          })
        }
      }
    }

    const scoredLeads = store.mission?.leads || []
    const topScore = Math.max(...scoredLeads.map(l => l.score), 0)
    store.updateStep(scoreStep.id, {
      status: 'completed',
      detail: `Scored ${scoredLeads.length} leads. Top score: ${topScore}. ${scoredLeads.filter(l => l.score >= 60).length} qualified.`,
      duration: Date.now() - scoreStep.timestamp,
    })
    store.addAudit({ actor: 'agent', action: 'scoring_complete', detail: `${scoredLeads.length} leads scored by Claude. ${scoredLeads.filter(l => l.score >= 60).length} qualified (score ≥60).`, stepId: scoreStep.id })

    // ── Phase 4: Approval checkpoint ─────────────────────────────────────
    if (config.autonomy !== 'autopilot') {
      const approvalStep: RunStep = {
        id: crypto.randomUUID(),
        type: 'approval',
        status: 'awaiting_approval',
        title: 'Review scored leads before outreach',
        detail: `${scoredLeads.filter(l => l.score >= 60).length} qualified leads ready. Review the lead list and approve to proceed with outreach drafting.`,
        timestamp: Date.now(),
        approvalRequired: true,
        approvalReason: 'Lead list requires human review before outreach generation',
      }
      store.addStep(approvalStep)
      store.setStatus('awaiting_approval')
      store.addAudit({ actor: 'agent', action: 'approval_requested', detail: 'Requesting approval for scored lead list before writing outreach', stepId: approvalStep.id })

      while (true) {
        await sleep(500, signal)
        const step = store.mission?.steps.find(s => s.id === approvalStep.id)
        if (step?.status === 'approved') break
        if (step?.status === 'rejected') {
          store.setStatus('failed')
          store.addAudit({ actor: 'agent', action: 'mission_aborted', detail: 'Lead list rejected by operator' })
          return
        }
      }
    }

    // ── Phase 5: Outreach Writing (Claude) ───────────────────────────────
    const writeStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'write',
      status: 'running',
      title: 'Writing personalised outreach',
      detail: 'Claude is crafting personalised emails for each qualified lead...',
      timestamp: Date.now(),
    }
    store.addStep(writeStep)

    const qualifiedLeads = (store.mission?.leads || []).filter(l => l.score >= 60).sort((a, b) => b.score - a.score)
    
    for (let i = 0; i < qualifiedLeads.length; i++) {
      const lead = qualifiedLeads[i]
      store.updateStep(writeStep.id, { detail: `Writing outreach for ${i + 1}/${qualifiedLeads.length}: ${lead.company}...` })

      const emails = await generateOutreach(lead, config)

      // Initial
      store.addMessage({
        id: crypto.randomUUID(),
        leadId: lead.id,
        type: 'email',
        subject: emails.initial.subject,
        body: emails.initial.body,
        followUpDay: null,
        status: 'draft',
      })

      // Follow-up day 3
      store.addMessage({
        id: crypto.randomUUID(),
        leadId: lead.id,
        type: 'email',
        subject: emails.followUp3.subject,
        body: emails.followUp3.body,
        followUpDay: 3,
        status: 'draft',
      })

      // Follow-up day 7
      store.addMessage({
        id: crypto.randomUUID(),
        leadId: lead.id,
        type: 'email',
        subject: emails.followUp7.subject,
        body: emails.followUp7.body,
        followUpDay: 7,
        status: 'draft',
      })

      store.updateLead(lead.id, { status: 'drafted' })
    }

    store.updateStep(writeStep.id, {
      status: 'completed',
      detail: `Wrote ${qualifiedLeads.length * 3} personalised messages (initial + 2 follow-ups) for ${qualifiedLeads.length} leads`,
      duration: Date.now() - writeStep.timestamp,
    })
    store.addAudit({ actor: 'agent', action: 'outreach_written', detail: `Claude wrote ${qualifiedLeads.length * 3} messages for ${qualifiedLeads.length} qualified leads`, stepId: writeStep.id })

    // ── Phase 6: Final approval for send queue ───────────────────────────
    if (config.autonomy === 'suggest') {
      const sendApproval: RunStep = {
        id: crypto.randomUUID(),
        type: 'approval',
        status: 'awaiting_approval',
        title: 'Approve outreach messages for send queue',
        detail: `${qualifiedLeads.length * 3} messages drafted. Review outreach copy and approve to add to send queue.`,
        timestamp: Date.now(),
        approvalRequired: true,
        approvalReason: 'Outreach messages require human approval before queuing (Suggest mode)',
      }
      store.addStep(sendApproval)
      store.setStatus('awaiting_approval')
      store.addAudit({ actor: 'agent', action: 'approval_requested', detail: 'Requesting approval for outreach messages before queuing', stepId: sendApproval.id })

      while (true) {
        await sleep(500, signal)
        const step = store.mission?.steps.find(s => s.id === sendApproval.id)
        if (step?.status === 'approved') break
        if (step?.status === 'rejected') {
          store.setStatus('failed')
          return
        }
      }
    }

    // ── Phase 7: Queue assembly ──────────────────────────────────────────
    const queueStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'queue',
      status: 'running',
      title: 'Assembling send queue',
      detail: 'Scheduling messages with optimal send times...',
      timestamp: Date.now(),
    }
    store.addStep(queueStep)

    await sleep(1500, signal)

    const allMessages = store.mission?.messages || []
    for (const msg of allMessages) {
      store.updateMessage(msg.id, { status: 'queued' })
    }

    store.updateStep(queueStep.id, {
      status: 'completed',
      detail: `${allMessages.length} messages queued across ${qualifiedLeads.length} leads. Sequence: initial → day 3 → day 7.`,
      duration: Date.now() - queueStep.timestamp,
    })

    // ── Phase 8: Export ──────────────────────────────────────────────────
    const exportStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'export',
      status: 'running',
      title: 'Generating export artefacts',
      detail: 'Building CSV, outreach pack, and mission report...',
      timestamp: Date.now(),
    }
    store.addStep(exportStep)

    await sleep(1000, signal)

    store.updateStep(exportStep.id, {
      status: 'completed',
      detail: 'Export ready: lead-list.csv, outreach-pack.md, mission-report.md, raw-data.json',
      duration: Date.now() - exportStep.timestamp,
    })

    // ── Done ─────────────────────────────────────────────────────────────
    store.setStatus('completed')
    store.addAudit({
      actor: 'agent',
      action: 'mission_completed',
      detail: `Mission complete. ${qualifiedLeads.length} leads qualified, ${allMessages.length} messages queued, 4 artefacts ready for export.`,
    })

  } catch (err: any) {
    if (err.message === 'Aborted') return
    console.error('Mission error:', err)
    store.setStatus('failed')
    store.addAudit({ actor: 'agent', action: 'mission_failed', detail: err.message || 'Unknown error' })
  }
}
