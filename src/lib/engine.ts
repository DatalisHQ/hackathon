import type { Lead, OutreachMessage, RunStep, MissionConfig } from '../types'

// Simulated lead data for different niches
const LEAD_POOLS: Record<string, Array<Omit<Lead, 'id' | 'score' | 'scoreReason' | 'personalisationHooks' | 'enrichedData' | 'status'>>> = {
  default: [
    { company: 'Sunrise Dental Care', contact: 'Dr. Sarah Mitchell', title: 'Practice Owner', email: 's.mitchell@sunrisedental.com.au', website: 'sunrisedental.com.au', location: 'Paddington, NSW' },
    { company: 'FreshPress Juice Bar', contact: 'Tom Nguyen', title: 'Founder', email: 'tom@freshpressjuice.com.au', website: 'freshpressjuice.com.au', location: 'Surry Hills, NSW' },
    { company: 'Peak Performance Gym', contact: 'Jake Henderson', title: 'Owner', email: 'jake@peakperformancegym.com.au', website: 'peakperformancegym.com.au', location: 'Bondi, NSW' },
    { company: 'Bloom & Petal Florist', contact: 'Amy Chen', title: 'Creative Director', email: 'amy@bloomandpetal.com.au', website: 'bloomandpetal.com.au', location: 'Newtown, NSW' },
    { company: 'Coastal Physio', contact: 'Dr. Mark Reynolds', title: 'Principal Physiotherapist', email: 'mark@coastalphysio.com.au', website: 'coastalphysio.com.au', location: 'Manly, NSW' },
    { company: 'The Good Egg Cafe', contact: 'Lisa Park', title: 'Owner', email: 'lisa@thegoodegg.com.au', website: 'thegoodegg.com.au', location: 'Balmain, NSW' },
    { company: 'Swift Plumbing Solutions', contact: 'Darren Cole', title: 'Director', email: 'darren@swiftplumbing.com.au', website: 'swiftplumbing.com.au', location: 'Parramatta, NSW' },
    { company: 'Zen Yoga Studio', contact: 'Priya Sharma', title: 'Studio Owner', email: 'priya@zenyogastudio.com.au', website: 'zenyogastudio.com.au', location: 'Mosman, NSW' },
    { company: 'Precision Auto Care', contact: 'Steve Morris', title: 'Workshop Manager', email: 'steve@precisionauto.com.au', website: 'precisionauto.com.au', location: 'Alexandria, NSW' },
    { company: 'Little Scholars Tutoring', contact: 'Rebecca Tran', title: 'Founder & Head Tutor', email: 'rebecca@littlescholars.com.au', website: 'littlescholars.com.au', location: 'Chatswood, NSW' },
    { company: 'Harbour View Real Estate', contact: 'James O\'Brien', title: 'Principal Agent', email: 'james@harbourviewre.com.au', website: 'harbourviewre.com.au', location: 'Double Bay, NSW' },
    { company: 'Pawfect Grooming', contact: 'Mel Stokes', title: 'Owner', email: 'mel@pawfectgrooming.com.au', website: 'pawfectgrooming.com.au', location: 'Marrickville, NSW' },
    { company: 'Green Spark Electrical', contact: 'Troy Bishop', title: 'Licensed Electrician', email: 'troy@greenspark.com.au', website: 'greenspark.com.au', location: 'Cronulla, NSW' },
    { company: 'Sapphire Skin Clinic', contact: 'Dr. Nina Walsh', title: 'Clinical Director', email: 'nina@sapphireskin.com.au', website: 'sapphireskin.com.au', location: 'Woollahra, NSW' },
    { company: 'Outback IT Solutions', contact: 'Ben Taylor', title: 'Managing Director', email: 'ben@outbackit.com.au', website: 'outbackit.com.au', location: 'North Sydney, NSW' },
    { company: 'Bella Cucina Restaurant', contact: 'Marco Rossi', title: 'Head Chef & Owner', email: 'marco@bellacucina.com.au', website: 'bellacucina.com.au', location: 'Leichhardt, NSW' },
    { company: 'Clear Vision Optometry', contact: 'Dr. Helen Yip', title: 'Optometrist', email: 'helen@clearvision.com.au', website: 'clearvision.com.au', location: 'Burwood, NSW' },
    { company: 'Apex Roofing & Guttering', contact: 'Dale Hartley', title: 'Owner', email: 'dale@apexroofing.com.au', website: 'apexroofing.com.au', location: 'Penrith, NSW' },
    { company: 'Whiskers Cat Cafe', contact: 'Sophie Dunn', title: 'Founder', email: 'sophie@whiskerscafe.com.au', website: 'whiskerscafe.com.au', location: 'Glebe, NSW' },
    { company: 'Momentum Accounting', contact: 'David Lim', title: 'Principal Accountant', email: 'david@momentumaccounting.com.au', website: 'momentumaccounting.com.au', location: 'Macquarie Park, NSW' },
    { company: 'Barefoot Podiatry', contact: 'Dr. Kate Murray', title: 'Podiatrist', email: 'kate@barefootpodiatry.com.au', website: 'barefootpodiatry.com.au', location: 'Dee Why, NSW' },
    { company: 'The Cutting Room', contact: 'Liam Ford', title: 'Senior Stylist', email: 'liam@thecuttingroom.com.au', website: 'thecuttingroom.com.au', location: 'Darlinghurst, NSW' },
    { company: 'Urban Garden Landscaping', contact: 'Chris Payne', title: 'Lead Designer', email: 'chris@urbangarden.com.au', website: 'urbangarden.com.au', location: 'Lane Cove, NSW' },
    { company: 'Forte Music Academy', contact: 'Angela Costa', title: 'Director', email: 'angela@fortemusic.com.au', website: 'fortemusic.com.au', location: 'Hurstville, NSW' },
    { company: 'Pure Clean Services', contact: 'Raj Patel', title: 'Operations Manager', email: 'raj@pureclean.com.au', website: 'pureclean.com.au', location: 'Bankstown, NSW' },
    { company: 'Horizon Mortgage Brokers', contact: 'Sam Whitfield', title: 'Senior Broker', email: 'sam@horizonmb.com.au', website: 'horizonmb.com.au', location: 'Neutral Bay, NSW' },
    { company: 'Tiny Tots Childcare', contact: 'Lauren Ellis', title: 'Centre Director', email: 'lauren@tinytots.com.au', website: 'tinytots.com.au', location: 'Epping, NSW' },
    { company: 'Iron Edge CrossFit', contact: 'Nathan Briggs', title: 'Head Coach', email: 'nathan@ironedge.com.au', website: 'ironedge.com.au', location: 'Redfern, NSW' },
    { company: 'Driftwood Photography', contact: 'Chloe Martin', title: 'Photographer', email: 'chloe@driftwoodphoto.com.au', website: 'driftwoodphoto.com.au', location: 'Avalon, NSW' },
    { company: 'Quickfix Phone Repairs', contact: 'Amir Hassan', title: 'Owner', email: 'amir@quickfixphones.com.au', website: 'quickfixphones.com.au', location: 'Liverpool, NSW' },
  ],
}

const PERSONALISATION_HOOKS = [
  'Recently updated website — investing in growth',
  'No Google Ads detected — untapped paid channel',
  'Active Instagram but no Facebook ads — missing reach',
  'Competitor in same suburb running Meta campaigns',
  'Seasonal opportunity: summer push timing',
  '4.8★ Google reviews — social proof goldmine',
  'New location opened recently',
  'Website lacks clear CTA — easy conversion win',
  'Blog active but no lead magnets',
  'LinkedIn presence but no outbound content',
  'Mobile-unfriendly site — losing traffic',
  'No Meta Pixel installed — zero retargeting',
  'Strong local SEO but no paid amplification',
  'Recently hired — scaling up operations',
  'Community events sponsor — brand-aware',
]

const SCORE_REASONS = [
  'Strong online presence, clear growth intent, active digital marketing',
  'Established business with minimal ad spend — high headroom for growth',
  'Active social media suggests marketing awareness, ready for next level',
  'Recent website refresh indicates investment in customer acquisition',
  'High review volume shows customer satisfaction — ready to scale',
  'Competitor landscape analysis shows opportunity gap',
  'Business model aligns perfectly with Facebook lead gen campaigns',
  'Local focus with broad target — ideal for geo-targeted Meta ads',
]

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

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function generateOutreachEmail(lead: Lead, config: MissionConfig): { subject: string; body: string } {
  const subjects = [
    `${lead.company} + AI-powered ads — quick thought`,
    `Idea for ${lead.company}'s customer acquisition`,
    `${lead.contact.split(' ')[0]}, saw ${lead.company} and had an idea`,
    `How ${lead.company} could 3x leads this quarter`,
    `Quick question about ${lead.company}'s marketing`,
  ]
  
  const bodies = [
    `Hi ${lead.contact.split(' ')[0]},\n\nI came across ${lead.company} and noticed ${lead.personalisationHooks[0]?.toLowerCase() || 'your strong local presence'}.\n\n${config.offer}\n\nWould it be worth a quick 10-minute chat this week to see if this could work for ${lead.company}?\n\nCheers`,
    `Hey ${lead.contact.split(' ')[0]},\n\nBeen looking at ${config.niche} businesses in ${lead.location} and ${lead.company} stood out — ${lead.personalisationHooks[0]?.toLowerCase() || 'you clearly know your stuff'}.\n\n${config.offer}\n\nInterested in seeing what this could look like for you specifically? Happy to put together a quick strategy brief — no strings.\n\nBest`,
    `${lead.contact.split(' ')[0]},\n\nQuick one — I work with ${config.niche} businesses on their customer acquisition.\n\nNoticed ${lead.personalisationHooks[0]?.toLowerCase() || 'you have a solid business'} and thought you might find this interesting:\n\n${config.offer}\n\nWorth 10 minutes of your time?\n\nCheers`,
  ]
  
  return {
    subject: subjects[randomBetween(0, subjects.length - 1)],
    body: bodies[randomBetween(0, bodies.length - 1)],
  }
}

function generateFollowUp(lead: Lead, day: number): { subject: string; body: string } {
  if (day === 3) {
    return {
      subject: `Re: ${lead.company} + AI-powered ads`,
      body: `Hi ${lead.contact.split(' ')[0]},\n\nJust floating this back up — I know things get busy.\n\nI put together a quick strategy brief for ${lead.company} showing what a targeted campaign could look like. Happy to send it over if you're curious.\n\nNo pressure either way.\n\nCheers`,
    }
  }
  return {
    subject: `Re: ${lead.company} + AI-powered ads`,
    body: `Hey ${lead.contact.split(' ')[0]},\n\nLast follow-up from me — don't want to be that person.\n\nIf the timing isn't right, totally understand. But if you ever want to explore what AI-powered ads could do for ${lead.company}, the offer stands.\n\nAll the best with the business.\n\nCheers`,
  }
}

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

export async function runMission(store: StoreActions, signal: AbortSignal) {
  const config = store.mission?.config
  if (!config) return

  try {
    // Phase 1: Lead Discovery
    const searchStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'search',
      status: 'running',
      title: 'Searching for leads',
      detail: `Scanning ${config.niche} businesses in ${config.location}...`,
      timestamp: Date.now(),
    }
    store.addStep(searchStep)
    store.addAudit({ actor: 'agent', action: 'search_started', detail: `Searching for ${config.niche} businesses in ${config.location}`, stepId: searchStep.id })

    await sleep(randomBetween(2000, 3500), signal)

    const pool = LEAD_POOLS.default
    const selectedLeads = pickRandom(pool, Math.min(config.leadCount, pool.length))
    
    store.updateStep(searchStep.id, { 
      status: 'completed', 
      detail: `Found ${selectedLeads.length} potential leads`,
      duration: Date.now() - searchStep.timestamp 
    })

    // Phase 2: Scraping & Enrichment  
    const scrapeStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'scrape',
      status: 'running',
      title: 'Scraping & enriching leads',
      detail: `Analysing websites and digital presence for ${selectedLeads.length} businesses...`,
      timestamp: Date.now(),
    }
    store.addStep(scrapeStep)

    for (let i = 0; i < selectedLeads.length; i++) {
      const raw = selectedLeads[i]
      await sleep(randomBetween(300, 800), signal)
      
      const lead: Lead = {
        id: crypto.randomUUID(),
        ...raw,
        score: 0,
        scoreReason: '',
        personalisationHooks: [],
        enrichedData: {},
        status: 'found',
      }
      store.addLead(lead)
      store.updateStep(scrapeStep.id, { 
        detail: `Enriching ${i + 1}/${selectedLeads.length}: ${raw.company}...` 
      })
    }

    store.updateStep(scrapeStep.id, {
      status: 'completed',
      detail: `Enriched ${selectedLeads.length} leads with website, social, and competitive data`,
      duration: Date.now() - scrapeStep.timestamp,
    })

    // Phase 3: Lead Scoring
    const scoreStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'score',
      status: 'running',
      title: 'Scoring & ranking leads',
      detail: 'Applying AI scoring model based on fit, intent, and accessibility...',
      timestamp: Date.now(),
    }
    store.addStep(scoreStep)

    const currentLeads = store.mission?.leads || []
    for (let i = 0; i < currentLeads.length; i++) {
      await sleep(randomBetween(200, 500), signal)
      const score = randomBetween(45, 97)
      const hooks = pickRandom(PERSONALISATION_HOOKS, randomBetween(2, 4))
      const reason = SCORE_REASONS[randomBetween(0, SCORE_REASONS.length - 1)]
      
      store.updateLead(currentLeads[i].id, {
        score,
        scoreReason: reason,
        personalisationHooks: hooks,
        enrichedData: {
          hasWebsite: true,
          hasSocialMedia: Math.random() > 0.3,
          hasGoogleAds: Math.random() > 0.7,
          hasMetaAds: Math.random() > 0.8,
          googleRating: (3.5 + Math.random() * 1.5).toFixed(1),
          reviewCount: randomBetween(5, 200),
          estimatedEmployees: randomBetween(1, 25),
        },
        status: 'scored',
      })
    }

    store.updateStep(scoreStep.id, {
      status: 'completed',
      detail: `Scored ${currentLeads.length} leads. Top score: ${Math.max(...(store.mission?.leads || []).map(l => l.score))}`,
      duration: Date.now() - scoreStep.timestamp,
    })
    store.addAudit({ actor: 'agent', action: 'scoring_complete', detail: `Scored ${currentLeads.length} leads`, stepId: scoreStep.id })

    // Phase 4: Approval checkpoint (if copilot or suggest mode)
    if (config.autonomy !== 'autopilot') {
      const approvalStep: RunStep = {
        id: crypto.randomUUID(),
        type: 'approval',
        status: 'awaiting_approval',
        title: 'Review scored leads before outreach',
        detail: `${currentLeads.length} leads scored and ready. Review the lead list and approve to proceed with outreach drafting.`,
        timestamp: Date.now(),
        approvalRequired: true,
        approvalReason: 'Lead list requires human review before outreach generation',
      }
      store.addStep(approvalStep)
      store.setStatus('awaiting_approval')
      store.addAudit({ actor: 'agent', action: 'approval_requested', detail: 'Requesting approval for scored lead list', stepId: approvalStep.id })
      
      // Wait for approval
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

    // Phase 5: Outreach Writing
    const writeStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'write',
      status: 'running',
      title: 'Drafting outreach messages',
      detail: 'Writing personalised emails for each qualified lead...',
      timestamp: Date.now(),
    }
    store.addStep(writeStep)

    const qualifiedLeads = (store.mission?.leads || []).filter(l => l.score >= 60).sort((a, b) => b.score - a.score)
    
    for (let i = 0; i < qualifiedLeads.length; i++) {
      await sleep(randomBetween(500, 1200), signal)
      const lead = qualifiedLeads[i]
      
      // Initial outreach
      const { subject, body } = generateOutreachEmail(lead, config)
      const msg: OutreachMessage = {
        id: crypto.randomUUID(),
        leadId: lead.id,
        type: 'email',
        subject,
        body,
        followUpDay: null,
        status: 'draft',
      }
      store.addMessage(msg)
      
      // Follow-up day 3
      const fu3 = generateFollowUp(lead, 3)
      store.addMessage({
        id: crypto.randomUUID(),
        leadId: lead.id,
        type: 'email',
        subject: fu3.subject,
        body: fu3.body,
        followUpDay: 3,
        status: 'draft',
      })
      
      // Follow-up day 7
      const fu7 = generateFollowUp(lead, 7)
      store.addMessage({
        id: crypto.randomUUID(),
        leadId: lead.id,
        type: 'email',
        subject: fu7.subject,
        body: fu7.body,
        followUpDay: 7,
        status: 'draft',
      })
      
      store.updateLead(lead.id, { status: 'drafted' })
      store.updateStep(writeStep.id, { detail: `Drafted outreach for ${i + 1}/${qualifiedLeads.length}: ${lead.company}` })
    }

    store.updateStep(writeStep.id, {
      status: 'completed',
      detail: `Wrote ${qualifiedLeads.length * 3} messages (initial + 2 follow-ups) for ${qualifiedLeads.length} qualified leads`,
      duration: Date.now() - writeStep.timestamp,
    })

    // Phase 6: Final approval for send queue
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
      store.addAudit({ actor: 'agent', action: 'approval_requested', detail: 'Requesting approval for outreach messages', stepId: sendApproval.id })
      
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

    // Phase 7: Queue assembly
    const queueStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'queue',
      status: 'running',
      title: 'Assembling send queue',
      detail: 'Scheduling messages with optimal send times...',
      timestamp: Date.now(),
    }
    store.addStep(queueStep)

    await sleep(randomBetween(1500, 2500), signal)

    const allMessages = store.mission?.messages || []
    for (const msg of allMessages) {
      store.updateMessage(msg.id, { status: 'queued' })
    }

    store.updateStep(queueStep.id, {
      status: 'completed',
      detail: `${allMessages.length} messages queued for delivery`,
      duration: Date.now() - queueStep.timestamp,
    })

    // Phase 8: Export
    const exportStep: RunStep = {
      id: crypto.randomUUID(),
      type: 'export',
      status: 'running',
      title: 'Generating export artefacts',
      detail: 'Building CSV, outreach pack, and mission report...',
      timestamp: Date.now(),
    }
    store.addStep(exportStep)

    await sleep(randomBetween(1000, 2000), signal)

    store.updateStep(exportStep.id, {
      status: 'completed',
      detail: 'Export ready: lead-list.csv, outreach-pack.md, mission-report.md',
      duration: Date.now() - exportStep.timestamp,
    })

    // Done
    store.setStatus('completed')
    store.addAudit({
      actor: 'agent',
      action: 'mission_completed',
      detail: `Mission complete. ${qualifiedLeads.length} leads qualified, ${allMessages.length} messages queued.`,
    })

  } catch (err: any) {
    if (err.message === 'Aborted') return
    store.setStatus('failed')
    store.addAudit({ actor: 'agent', action: 'mission_failed', detail: err.message })
  }
}
