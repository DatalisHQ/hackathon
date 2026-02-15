import type { StageId, Stage, BusinessProfile, AudiencePersona, AdCreative, GoogleAd, CampaignConfig } from '../types'

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── Callbacks ─────────────────────────────────────────────────────────────

export type ThinkingLineType = 'system' | 'data' | 'insight' | 'decision' | 'highlight' | 'user'

type UpdateCallback = (update: {
  stage?: { id: StageId; changes: Partial<Stage> }
  business?: BusinessProfile
  audiences?: AudiencePersona[]
  creatives?: AdCreative[]
  googleAds?: GoogleAd[]
  campaign?: CampaignConfig
  thinking?: { type: ThinkingLineType; text: string }
  awaitApproval?: boolean
}) => void

// ─── Website Scraping ──────────────────────────────────────────────────────

async function scrapeWebsite(url: string): Promise<{ html: string; title: string; description: string; text: string }> {
  // Use a CORS proxy or direct fetch
  let fetchUrl = url
  if (!url.startsWith('http')) fetchUrl = 'https://' + url

  try {
    // Try allorigins proxy for CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch?.[1]?.trim() || ''

    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    const description = metaDescMatch?.[1] || ogDescMatch?.[1] || ''

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)

    return { html, title, description, text }
  } catch (err) {
    console.warn('Scrape failed, using URL-based inference:', err)
    const domain = url.replace(/https?:\/\//, '').split('/')[0]
    return {
      html: '',
      title: domain,
      description: '',
      text: `Business website at ${domain}`,
    }
  }
}

// ─── Claude API (via proxy) ────────────────────────────────────────────────

async function callClaude(prompt: string, maxTokens: number = 3000, userContext?: string[]): Promise<string> {
  // Prepend user context if provided
  if (userContext && userContext.length > 0) {
    const contextBlock = `[ADDITIONAL USER CONTEXT]:\n${userContext.map(m => `- User says: "${m}"`).join('\n')}\n\nPlease incorporate the above user instructions into your response.\n\n---\n\n`
    prompt = contextBlock + prompt
  }
  // Try the serverless proxy first
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxTokens }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.text || ''
    }
  } catch {}

  // Fallback: return empty (engine will use generated data)
  return ''
}

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt + ' Photorealistic, professional quality. Square format. No text or words in the image.' }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.image ? `data:${data.mimeType || 'image/jpeg'};base64,${data.image}` : null
    }
  } catch {}
  return null
}

// ─── Business Analysis ─────────────────────────────────────────────────────

async function analyseBusiness(url: string, scraped: { title: string; description: string; text: string }, userContext?: string[]): Promise<BusinessProfile> {
  const domain = url.replace(/https?:\/\//, '').split('/')[0]
  
  const prompt = `Analyse this business website and return a JSON profile.

URL: ${url}
Title: ${scraped.title}
Description: ${scraped.description}
Page content: ${scraped.text.slice(0, 2000)}

Return ONLY valid JSON:
{
  "name": "Business Name",
  "description": "One paragraph about what they do",
  "industry": "e.g. Health & Wellness, Food & Beverage, Professional Services",
  "location": "City, State/Country if detectable, otherwise 'Not specified'",
  "strengths": ["3-4 strengths based on website"],
  "weaknesses": ["2-3 gaps or missed opportunities"],
  "targetCustomer": "Who their ideal customer is",
  "tone": "Brand tone: e.g. professional, casual, luxury, friendly",
  "colors": ["#hex1", "#hex2", "#hex3"]
}`

  const response = await callClaude(prompt, 1500, userContext)
  
  try {
    const match = response.match(/\{[\s\S]*\}/)
    if (match) return { url, ...JSON.parse(match[0]) }
  } catch {}

  // Fallback: infer from scraped data
  return {
    url,
    name: scraped.title || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
    description: scraped.description || `A business at ${domain} offering products and services to their local community.`,
    industry: 'Small Business',
    location: 'Australia',
    strengths: ['Established online presence', 'Active website', 'Clear service offering'],
    weaknesses: ['Limited social media advertising', 'No retargeting pixel detected', 'Could improve mobile experience'],
    targetCustomer: 'Local consumers and businesses looking for quality services',
    tone: 'professional',
    colors: ['#2563eb', '#1e40af', '#3b82f6'],
  }
}

// ─── Audience Generation ───────────────────────────────────────────────────

async function generateAudiences(business: BusinessProfile, userContext?: string[]): Promise<AudiencePersona[]> {
  const prompt = `Create 3 target audience personas for Facebook ads for this business:

Business: ${business.name}
Industry: ${business.industry}
Description: ${business.description}
Target customer: ${business.targetCustomer}
Location: ${business.location}

Return ONLY a JSON array of 3 personas:
[{
  "name": "Persona Name (e.g. 'Busy Professional Sarah')",
  "age": "25-34",
  "description": "2-3 sentences about this person",
  "interests": ["4-5 Facebook interests for targeting"],
  "painPoints": ["2-3 problems they have that this business solves"],
  "platforms": ["Facebook", "Instagram"],
  "emoji": "👩‍💼"
}]`

  const response = await callClaude(prompt, 2000, userContext)
  
  try {
    const match = response.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}

  // Fallback personas
  return [
    {
      name: 'Busy Professional',
      age: '28-42',
      description: `Working professional who values quality and convenience. Likely to discover ${business.name} through targeted social media ads during commute or lunch break.`,
      interests: ['Small business', 'Online shopping', 'Local services', 'Productivity'],
      painPoints: ['Not enough time to research options', 'Overwhelmed by choices', 'Wants trusted recommendations'],
      platforms: ['Facebook', 'Instagram'],
      emoji: '👩‍💼',
    },
    {
      name: 'Local Explorer',
      age: '22-35',
      description: `Active on social media, always looking for new local businesses and experiences. Discovers brands through Instagram and friend recommendations.`,
      interests: ['Local events', 'Community', 'Lifestyle', 'Reviews'],
      painPoints: ['Hard to find quality local businesses', 'Wants authentic experiences', 'Values community connection'],
      platforms: ['Instagram', 'Facebook'],
      emoji: '🧭',
    },
    {
      name: 'Value Seeker',
      age: '35-55',
      description: `Practical and research-driven. Compares options before purchasing. Responds well to clear value propositions and social proof.`,
      interests: ['Deals', 'Reviews', 'Comparison shopping', 'Family'],
      painPoints: ['Worried about wasting money', 'Needs proof of quality', 'Wants clear pricing'],
      platforms: ['Facebook'],
      emoji: '💰',
    },
  ]
}

// ─── Ad Copy Generation ────────────────────────────────────────────────────

async function generateAdCopy(business: BusinessProfile, audiences: AudiencePersona[], userContext?: string[]): Promise<AdCreative[]> {
  const prompt = `Write 3 Facebook ad variants for this business. Each should target a different angle.

Business: ${business.name}
Industry: ${business.industry}  
Description: ${business.description}
Tone: ${business.tone}
Strengths: ${business.strengths.join(', ')}
Target audiences: ${audiences.map(a => a.name).join(', ')}

Return ONLY a JSON array:
[{
  "headline": "Short punchy headline (max 40 chars)",
  "primaryText": "Ad body text (2-3 sentences, conversational, with a hook)",
  "cta": "Learn More|Book Now|Shop Now|Sign Up|Get Offer",
  "imagePrompt": "Detailed prompt for generating an ad image with AI (describe the visual scene, style, colors, mood - no text in image)",
  "angle": "Name of the creative angle (e.g. 'Social Proof', 'Pain Point', 'Aspiration')"
}]`

  const response = await callClaude(prompt, 2000, userContext)
  
  try {
    const match = response.match(/\[[\s\S]*\]/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return parsed.map((c: any) => ({ ...c, id: crypto.randomUUID() }))
    }
  } catch {}

  // Fallback creatives
  return [
    {
      id: crypto.randomUUID(),
      headline: `Discover ${business.name}`,
      primaryText: `Looking for quality ${business.industry.toLowerCase()} services? ${business.name} has been helping customers just like you. See why locals love us — check out what we offer.`,
      cta: 'Learn More',
      imagePrompt: `Professional lifestyle photo representing ${business.industry.toLowerCase()}, warm lighting, modern aesthetic, ${business.tone} mood, using brand colors ${business.colors.join(' ')}`,
      angle: 'Discovery',
    },
    {
      id: crypto.randomUUID(),
      headline: `Your New Favourite ${business.industry}`,
      primaryText: `Tired of settling for less? ${business.name} delivers ${business.strengths[0]?.toLowerCase() || 'quality service'} that keeps customers coming back. Try us this week.`,
      cta: 'Book Now',
      imagePrompt: `Happy customer experiencing ${business.industry.toLowerCase()} service, candid photo style, bright and inviting, genuine smile, ${business.tone} aesthetic`,
      angle: 'Aspiration',
    },
    {
      id: crypto.randomUUID(),
      headline: `Stop Wasting Time`,
      primaryText: `You deserve better than average. ${business.name} is the ${business.industry.toLowerCase()} solution that actually delivers. Join hundreds of satisfied customers.`,
      cta: 'Get Offer',
      imagePrompt: `Before and after concept for ${business.industry.toLowerCase()}, clean split design, dramatic improvement shown visually, professional photography style`,
      angle: 'Pain Point',
    },
  ]
}

// ─── Google Ads Copy Generation ────────────────────────────────────────────

async function generateGoogleAds(business: BusinessProfile, audiences: AudiencePersona[], userContext?: string[]): Promise<GoogleAd[]> {
  const domain = business.url.replace(/https?:\/\//, '').split('/')[0]

  const prompt = `Create 3 Google Search ad variants for this business.

Business: ${business.name}
Industry: ${business.industry}
Description: ${business.description}
URL: ${business.url}
Strengths: ${business.strengths.join(', ')}
Target audiences: ${audiences.map(a => a.name).join(', ')}

Return ONLY a JSON array. Each ad has:
- headlines: array of 3 strings, each max 30 characters
- descriptions: array of 2 strings, each max 90 characters
- displayUrl: the display URL path (just the domain, no https://)
- siteLinks: array of 2-3 short link labels (e.g. "Pricing", "About Us", "Contact")
- finalUrl: the actual URL

[{
  "headlines": ["Headline 1 (max 30)", "Headline 2 (max 30)", "Headline 3 (max 30)"],
  "descriptions": ["Description line 1 (max 90 chars, compelling)", "Description line 2 (max 90 chars, with CTA)"],
  "displayUrl": "${domain}",
  "siteLinks": ["Pricing", "About Us", "Contact"],
  "finalUrl": "${business.url}"
}]`

  const response = await callClaude(prompt, 2000, userContext)

  try {
    const match = response.match(/\[[\s\S]*\]/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return parsed.map((ad: any) => ({
        ...ad,
        id: crypto.randomUUID(),
        headlines: (ad.headlines || []).map((h: string) => h.slice(0, 30)),
        descriptions: (ad.descriptions || []).map((d: string) => d.slice(0, 90)),
      }))
    }
  } catch {}

  // Fallback Google ads
  return [
    {
      id: crypto.randomUUID(),
      headlines: [
        `${business.name.slice(0, 30)}`,
        `Top ${business.industry.slice(0, 22)}`,
        'Get a Free Quote Today',
      ],
      descriptions: [
        `Discover ${business.name} — trusted ${business.industry.toLowerCase()} services. Quality you can count on.`,
        `Visit us today and see why customers love ${business.name}. Book online or call now.`,
      ],
      displayUrl: domain,
      siteLinks: ['Services', 'About Us', 'Contact'],
      finalUrl: business.url,
    },
    {
      id: crypto.randomUUID(),
      headlines: [
        `Best ${business.industry.slice(0, 22)}`,
        `${business.location.slice(0, 24)} Local`,
        'Book Online Now',
      ],
      descriptions: [
        `Looking for ${business.industry.toLowerCase()}? ${business.name} delivers results. Trusted by locals.`,
        `${business.strengths[0] || 'Professional service'} — see what sets us apart. Get started today.`,
      ],
      displayUrl: domain,
      siteLinks: ['Reviews', 'Pricing', 'FAQ'],
      finalUrl: business.url,
    },
    {
      id: crypto.randomUUID(),
      headlines: [
        'Don\'t Settle for Less',
        `Try ${business.name.slice(0, 22)}`,
        'See Our Results',
      ],
      descriptions: [
        `Stop searching. ${business.name} is the ${business.industry.toLowerCase()} solution that actually works.`,
        `Join hundreds of happy customers. Professional, reliable, and ready to help you today.`,
      ],
      displayUrl: domain,
      siteLinks: ['Testimonials', 'Get Started', 'Learn More'],
      finalUrl: business.url,
    },
  ]
}

// ─── Campaign Assembly ─────────────────────────────────────────────────────

function assembleCampaign(business: BusinessProfile, audiences: AudiencePersona[], creatives: AdCreative[]): CampaignConfig {
  const isAU = business.location.toLowerCase().includes('australia') || business.location.toLowerCase().includes('au')
  const currency = isAU ? 'AUD' : 'USD'
  const dailyBudget = isAU ? 30 : 20

  return {
    objective: 'Lead Generation',
    dailyBudget,
    currency,
    duration: 14,
    audiences,
    creatives,
    estimatedReach: `${randomBetween(15, 45)}K-${randomBetween(60, 120)}K people`,
    estimatedCpl: `$${(randomBetween(3, 12)).toFixed(2)} ${currency}`,
    estimatedClicks: `${randomBetween(200, 800)}-${randomBetween(900, 2500)} clicks`,
  }
}

// ─── Thinking text configs ─────────────────────────────────────────────────

const thinkingTexts: Record<StageId, string[]> = {
  scrape: [
    'Connecting to website...',
    'Downloading page content...',
    'Extracting metadata and text...',
    'Reading page structure...',
  ],
  analyse: [
    'Understanding the business model...',
    'Identifying industry and market position...',
    'Evaluating online presence...',
    'Mapping strengths and opportunities...',
    'Determining brand tone and personality...',
  ],
  audience: [
    'Researching target demographics...',
    'Building audience personas...',
    'Mapping interests and behaviours...',
    'Identifying pain points and motivations...',
    'Selecting Facebook targeting parameters...',
  ],
  strategy: [
    'Choosing campaign objective...',
    'Calculating optimal budget allocation...',
    'Setting performance benchmarks...',
    'Planning 14-day test structure...',
  ],
  copy: [
    'Crafting headline variants...',
    'Writing persuasive ad copy...',
    'Tailoring tone to brand voice...',
    'Testing different creative angles...',
    'Optimising for engagement...',
    'Writing Google Search ad headlines...',
    'Crafting Google ad descriptions...',
  ],
  creatives: [
    'Generating visual concepts...',
    'Designing ad creative #1...',
    'Designing ad creative #2...',
    'Designing ad creative #3...',
    'Applying brand colours and style...',
  ],
  campaign: [
    'Assembling campaign structure...',
    'Configuring targeting rules...',
    'Setting budget and schedule...',
    'Final quality check...',
  ],
  complete: ['Done!'],
}

// ─── Phase 1: Strategy (scrape → analyse → audience → strategy) ────────────

export async function buildStrategy(
  url: string,
  onUpdate: UpdateCallback,
  getUserMessages?: () => string[],
): Promise<{ business: BusinessProfile; audiences: AudiencePersona[] }> {
  const pendingUserContext: string[] = []

  function drainUserMessages() {
    if (!getUserMessages) return
    const messages = getUserMessages()
    if (messages.length > 0) {
      for (const msg of messages) {
        onUpdate({ thinking: { type: 'system', text: `→ Incorporating your feedback: "${msg}"` } })
      }
      pendingUserContext.push(...messages)
    }
  }

  function consumeUserContext(): string[] | undefined {
    if (pendingUserContext.length === 0) return undefined
    const ctx = [...pendingUserContext]
    pendingUserContext.length = 0
    return ctx
  }

  // ── Stage 1: Scrape ──
  onUpdate({ stage: { id: 'scrape', changes: { status: 'running', startedAt: Date.now() } } })
  onUpdate({ thinking: { type: 'system', text: `→ Connecting to ${url}...` } })
  
  for (const text of thinkingTexts.scrape) {
    onUpdate({ stage: { id: 'scrape', changes: { thinkingText: text } } })
    await delay(randomBetween(400, 800))
  }

  const scraped = await scrapeWebsite(url)
  
  onUpdate({ thinking: { type: 'data', text: `Title: "${scraped.title}"` } })
  await delay(200)
  if (scraped.description) {
    onUpdate({ thinking: { type: 'data', text: `Meta: "${scraped.description.slice(0, 120)}..."` } })
    await delay(200)
  }
  onUpdate({ thinking: { type: 'data', text: `Extracted ${scraped.text.length} chars of page content` } })
  await delay(150)
  
  const words = scraped.text.split(' ').filter(w => w.length > 3)
  const snippetLength = Math.min(words.length, 15)
  if (snippetLength > 5) {
    onUpdate({ thinking: { type: 'data', text: `"${words.slice(0, snippetLength).join(' ')}..."` } })
    await delay(300)
  }
  
  onUpdate({ thinking: { type: 'highlight', text: `✓ Website scanned successfully` } })

  onUpdate({ stage: { id: 'scrape', changes: { 
    status: 'completed', 
    completedAt: Date.now(),
    data: { title: scraped.title, textLength: scraped.text.length },
  }}})

  await delay(300)
  drainUserMessages()

  // ── Stage 2: Analyse ──
  onUpdate({ stage: { id: 'analyse', changes: { status: 'running', startedAt: Date.now() } } })
  onUpdate({ thinking: { type: 'system', text: '→ Sending page content to Claude for analysis...' } })
  
  for (const text of thinkingTexts.analyse) {
    onUpdate({ stage: { id: 'analyse', changes: { thinkingText: text } } })
    await delay(randomBetween(500, 1000))
  }

  const business = await analyseBusiness(url, scraped, consumeUserContext())
  
  onUpdate({ thinking: { type: 'insight', text: `Business identified: ${business.name}` } })
  await delay(200)
  onUpdate({ thinking: { type: 'insight', text: `Industry: ${business.industry}` } })
  await delay(200)
  onUpdate({ thinking: { type: 'insight', text: `Location: ${business.location}` } })
  await delay(200)
  onUpdate({ thinking: { type: 'insight', text: `Brand tone: ${business.tone}` } })
  await delay(150)
  for (const s of business.strengths) {
    onUpdate({ thinking: { type: 'data', text: `  ✓ Strength: ${s}` } })
    await delay(100)
  }
  for (const w of business.weaknesses) {
    onUpdate({ thinking: { type: 'data', text: `  → Opportunity: ${w}` } })
    await delay(100)
  }
  onUpdate({ thinking: { type: 'highlight', text: `✓ Business profile complete` } })
  
  onUpdate({ business })
  
  onUpdate({ stage: { id: 'analyse', changes: { 
    status: 'completed', 
    completedAt: Date.now(),
    data: { name: business.name, industry: business.industry },
  }}})

  await delay(300)
  drainUserMessages()

  // ── Stage 3: Audience ──
  onUpdate({ stage: { id: 'audience', changes: { status: 'running', startedAt: Date.now() } } })
  onUpdate({ thinking: { type: 'system', text: '→ Building audience personas from business profile...' } })
  
  for (const text of thinkingTexts.audience) {
    onUpdate({ stage: { id: 'audience', changes: { thinkingText: text } } })
    await delay(randomBetween(400, 900))
  }

  const audiences = await generateAudiences(business, consumeUserContext())
  
  for (const a of audiences) {
    onUpdate({ thinking: { type: 'decision', text: `${a.emoji} Persona: "${a.name}" (${a.age})` } })
    await delay(250)
    for (const interest of a.interests.slice(0, 3)) {
      onUpdate({ thinking: { type: 'data', text: `    Interest: ${interest}` } })
      await delay(80)
    }
    onUpdate({ thinking: { type: 'data', text: `    Pain: ${a.painPoints[0]}` } })
    await delay(100)
  }
  onUpdate({ thinking: { type: 'highlight', text: `✓ ${audiences.length} audience personas created` } })
  
  onUpdate({ audiences })
  
  onUpdate({ stage: { id: 'audience', changes: { 
    status: 'completed', 
    completedAt: Date.now(),
    data: { count: audiences.length, personas: audiences.map(a => a.name) },
  }}})

  await delay(300)
  drainUserMessages()

  // ── Stage 4: Strategy ──
  onUpdate({ stage: { id: 'strategy', changes: { status: 'running', startedAt: Date.now() } } })
  onUpdate({ thinking: { type: 'system', text: '→ Determining optimal campaign strategy...' } })
  
  for (const text of thinkingTexts.strategy) {
    onUpdate({ stage: { id: 'strategy', changes: { thinkingText: text } } })
    await delay(randomBetween(300, 700))
  }

  onUpdate({ thinking: { type: 'decision', text: 'Objective: Lead Generation (best for service businesses)' } })
  await delay(200)
  onUpdate({ thinking: { type: 'decision', text: 'Budget: $30/day — enough data for Andromeda to optimise' } })
  await delay(200)
  onUpdate({ thinking: { type: 'decision', text: 'Duration: 14-day test flight — 7 days learning, 7 days optimising' } })
  await delay(200)
  onUpdate({ thinking: { type: 'insight', text: 'Strategy: Broad targeting + diverse creatives. Let Meta\'s algorithm find the best audience.' } })
  await delay(150)
  onUpdate({ thinking: { type: 'highlight', text: '✓ Strategy locked in' } })

  onUpdate({ stage: { id: 'strategy', changes: { 
    status: 'completed', 
    completedAt: Date.now(),
    data: { objective: 'Lead Generation', duration: '14 days' },
  }}})

  // Signal the approval gate
  onUpdate({ awaitApproval: true })

  return { business, audiences }
}

// ─── Phase 2: Execution (copy → creatives → campaign → complete) ───────────

export async function executeCampaign(
  business: BusinessProfile,
  audiences: AudiencePersona[],
  onUpdate: UpdateCallback,
  getUserMessages?: () => string[],
): Promise<void> {
  const pendingUserContext: string[] = []

  function drainUserMessages() {
    if (!getUserMessages) return
    const messages = getUserMessages()
    if (messages.length > 0) {
      for (const msg of messages) {
        onUpdate({ thinking: { type: 'system', text: `→ Incorporating your feedback: "${msg}"` } })
      }
      pendingUserContext.push(...messages)
    }
  }

  function consumeUserContext(): string[] | undefined {
    if (pendingUserContext.length === 0) return undefined
    const ctx = [...pendingUserContext]
    pendingUserContext.length = 0
    return ctx
  }

  await delay(300)
  drainUserMessages()

  // ── Stage 5: Copy ──
  onUpdate({ stage: { id: 'copy', changes: { status: 'running', startedAt: Date.now() } } })
  onUpdate({ thinking: { type: 'system', text: '→ Writing ad copy with Claude...' } })
  
  for (const text of thinkingTexts.copy.slice(0, 5)) {
    onUpdate({ stage: { id: 'copy', changes: { thinkingText: text } } })
    await delay(randomBetween(500, 1000))
  }

  const creatives = await generateAdCopy(business, audiences, consumeUserContext())
  
  for (let i = 0; i < creatives.length; i++) {
    const c = creatives[i]
    onUpdate({ thinking: { type: 'decision', text: `Ad ${i + 1} — Angle: "${c.angle}"` } })
    await delay(200)
    const copyWords = c.headline.split(' ')
    let typed = ''
    for (const word of copyWords) {
      typed += (typed ? ' ' : '') + word
      onUpdate({ thinking: { type: 'data', text: `    Headline: ${typed}█` } })
      await delay(randomBetween(60, 150))
    }
    onUpdate({ thinking: { type: 'data', text: `    Headline: ${c.headline}` } })
    await delay(100)
    onUpdate({ thinking: { type: 'data', text: `    CTA: [${c.cta}]` } })
    await delay(150)
  }
  onUpdate({ thinking: { type: 'highlight', text: `✓ ${creatives.length} Facebook ad variants written` } })
  
  onUpdate({ creatives })

  // Check for user messages before Google ads
  drainUserMessages()

  // Now generate Google ads
  onUpdate({ thinking: { type: 'system', text: '→ Writing Google Search ad copy...' } })
  for (const text of thinkingTexts.copy.slice(5)) {
    onUpdate({ stage: { id: 'copy', changes: { thinkingText: text } } })
    await delay(randomBetween(400, 800))
  }

  const googleAds = await generateGoogleAds(business, audiences, consumeUserContext())

  for (let i = 0; i < googleAds.length; i++) {
    const ad = googleAds[i]
    onUpdate({ thinking: { type: 'decision', text: `Google Ad ${i + 1} — "${ad.headlines[0]}"` } })
    await delay(200)
    onUpdate({ thinking: { type: 'data', text: `    Headlines: ${ad.headlines.join(' | ')}` } })
    await delay(100)
    onUpdate({ thinking: { type: 'data', text: `    URL: ${ad.displayUrl}` } })
    await delay(100)
  }
  onUpdate({ thinking: { type: 'highlight', text: `✓ ${googleAds.length} Google Search ads written` } })

  onUpdate({ googleAds })
  
  onUpdate({ stage: { id: 'copy', changes: { 
    status: 'completed', 
    completedAt: Date.now(),
    data: { variants: creatives.length, googleAds: googleAds.length, angles: creatives.map(c => c.angle) },
  }}})

  await delay(300)
  drainUserMessages()

  // ── Stage 6: Creatives ──
  onUpdate({ stage: { id: 'creatives', changes: { status: 'running', startedAt: Date.now() } } })
  onUpdate({ thinking: { type: 'system', text: '→ Generating ad images with Nano Banana Pro...' } })
  
  // Generate all images in parallel for speed
  const imagePromises = creatives.map((c, i) => {
    onUpdate({ stage: { id: 'creatives', changes: { thinkingText: `Generating image ${i + 1}/${creatives.length}...` } } })
    onUpdate({ thinking: { type: 'data', text: `  Prompt: "${c.imagePrompt.slice(0, 80)}..."` } })
    return generateImage(c.imagePrompt)
  })

  const images = await Promise.allSettled(imagePromises)
  
  for (let i = 0; i < creatives.length; i++) {
    const result = images[i]
    if (result.status === 'fulfilled' && result.value) {
      creatives[i].imageUrl = result.value
      onUpdate({ thinking: { type: 'insight', text: `  ✓ Creative ${i + 1} generated (${creatives[i].angle})` } })
    } else {
      onUpdate({ thinking: { type: 'data', text: `  ⚠ Creative ${i + 1} using placeholder (${creatives[i].angle})` } })
    }
    // Re-emit creatives so UI updates with images progressively
    onUpdate({ creatives: [...creatives] })
    await delay(300)
  }

  onUpdate({ thinking: { type: 'highlight', text: `✓ ${creatives.length} ad creatives generated` } })

  onUpdate({ stage: { id: 'creatives', changes: { 
    status: 'completed', 
    completedAt: Date.now(),
    data: { generated: creatives.length },
  }}})

  await delay(300)
  drainUserMessages()

  // ── Stage 7: Campaign assembly ──
  onUpdate({ stage: { id: 'campaign', changes: { status: 'running', startedAt: Date.now() } } })
  onUpdate({ thinking: { type: 'system', text: '→ Assembling final campaign configuration...' } })
  
  for (const text of thinkingTexts.campaign) {
    onUpdate({ stage: { id: 'campaign', changes: { thinkingText: text } } })
    await delay(randomBetween(300, 600))
  }

  const campaign = assembleCampaign(business, audiences, creatives)
  
  onUpdate({ thinking: { type: 'decision', text: `Daily budget: $${campaign.dailyBudget} ${campaign.currency}` } })
  await delay(150)
  onUpdate({ thinking: { type: 'decision', text: `Estimated reach: ${campaign.estimatedReach}` } })
  await delay(150)
  onUpdate({ thinking: { type: 'decision', text: `Estimated cost per lead: ${campaign.estimatedCpl}` } })
  await delay(150)
  onUpdate({ thinking: { type: 'highlight', text: '✓ Campaign ready to launch 🚀' } })
  
  onUpdate({ campaign })
  
  onUpdate({ stage: { id: 'campaign', changes: { 
    status: 'completed', 
    completedAt: Date.now(),
  }}})

  await delay(500)

  // ── Complete ──
  onUpdate({ stage: { id: 'complete', changes: { status: 'completed', completedAt: Date.now() } } })
}
