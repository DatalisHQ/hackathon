import type { AdCreative, BusinessProfile, SimulationResult, IndustryBenchmark } from '../types'

interface IndustryPreset {
  ctrRange: [number, number]
  cpcRange: [number, number]
  cvrRange: [number, number]
  avgRoas: number
  keywords: string[]
}

const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  restaurant: {
    ctrRange: [1.5, 2.5],
    cpcRange: [0.5, 1.2],
    cvrRange: [3, 6],
    avgRoas: 5.2,
    keywords: ['restaurant', 'food', 'dining', 'cafe', 'pizza', 'sushi', 'bar', 'grill', 'bistro', 'eatery', 'bakery', 'catering'],
  },
  roofing: {
    ctrRange: [0.8, 1.5],
    cpcRange: [2.0, 5.0],
    cvrRange: [2, 4],
    avgRoas: 8.5,
    keywords: ['roofing', 'home service', 'contractor', 'plumbing', 'hvac', 'electrical', 'remodel', 'renovation', 'handyman', 'construction', 'landscaping', 'painting'],
  },
  fitness: {
    ctrRange: [1.2, 2.0],
    cpcRange: [0.8, 2.0],
    cvrRange: [2.5, 5],
    avgRoas: 4.8,
    keywords: ['fitness', 'gym', 'yoga', 'crossfit', 'personal training', 'workout', 'health club', 'martial arts', 'pilates', 'sports'],
  },
  beauty: {
    ctrRange: [1.5, 2.5],
    cpcRange: [0.6, 1.5],
    cvrRange: [3, 6],
    avgRoas: 5.5,
    keywords: ['beauty', 'salon', 'spa', 'hair', 'nail', 'skincare', 'cosmetic', 'barbershop', 'waxing', 'lash', 'brow', 'makeup'],
  },
  professional: {
    ctrRange: [0.7, 1.3],
    cpcRange: [2.5, 6.0],
    cvrRange: [1.5, 3],
    avgRoas: 10.0,
    keywords: ['lawyer', 'attorney', 'accountant', 'consulting', 'financial', 'insurance', 'real estate', 'dental', 'medical', 'legal', 'professional', 'advisory'],
  },
  default: {
    ctrRange: [1.0, 1.8],
    cpcRange: [1.0, 3.0],
    cvrRange: [2, 4],
    avgRoas: 5.0,
    keywords: [],
  },
}

function detectIndustry(business: BusinessProfile): string {
  const text = `${business.industry} ${business.description} ${business.name}`.toLowerCase()
  
  for (const [key, preset] of Object.entries(INDUSTRY_PRESETS)) {
    if (key === 'default') continue
    if (preset.keywords.some(kw => text.includes(kw))) {
      return key
    }
  }
  return 'default'
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function formatIndustryName(key: string): string {
  const names: Record<string, string> = {
    restaurant: 'Restaurant & Food',
    roofing: 'Home Services',
    fitness: 'Fitness & Wellness',
    beauty: 'Beauty & Personal Care',
    professional: 'Professional Services',
    default: 'General Advertising',
  }
  return names[key] || 'General Advertising'
}

export function getIndustryBenchmark(business: BusinessProfile): IndustryBenchmark {
  const key = detectIndustry(business)
  const preset = INDUSTRY_PRESETS[key]
  
  return {
    industry: formatIndustryName(key),
    avgCtr: (preset.ctrRange[0] + preset.ctrRange[1]) / 2,
    avgCpc: (preset.cpcRange[0] + preset.cpcRange[1]) / 2,
    avgCvr: (preset.cvrRange[0] + preset.cvrRange[1]) / 2,
  }
}

export function generateSimulatedResults(
  creatives: AdCreative[],
  business: BusinessProfile,
): SimulationResult[] {
  const industryKey = detectIndustry(business)
  const preset = INDUSTRY_PRESETS[industryKey]
  
  // Pick a random winner index
  const winnerIdx = Math.floor(Math.random() * creatives.length)
  
  // Generate base metrics within industry range
  const baseCtr = randomInRange(preset.ctrRange[0], preset.ctrRange[1])
  const baseCpc = randomInRange(preset.cpcRange[0], preset.cpcRange[1])
  const baseCvr = randomInRange(preset.cvrRange[0], preset.cvrRange[1])
  
  const variants = ['A', 'B', 'C', 'D', 'E', 'F']
  const totalImpressions = 50000
  
  const results: SimulationResult[] = creatives.map((creative, i) => {
    const isWinner = i === winnerIdx
    
    // Winner gets 10-30% better metrics, losers get 5-20% worse
    const winnerBoost = 1 + randomInRange(0.10, 0.30)
    const loserPenalty = 1 - randomInRange(0.05, 0.20)
    const modifier = isWinner ? winnerBoost : loserPenalty
    
    // Add small random variance per variant so losers differ from each other
    const variance = 1 + randomInRange(-0.05, 0.05)
    
    const ctr = Number((baseCtr * modifier * variance).toFixed(2))
    const impressions = totalImpressions
    const clicks = Math.round(impressions * (ctr / 100))
    const cpc = Number((baseCpc / modifier * variance).toFixed(2)) // Better variants = lower CPC
    const conversionRate = Number((baseCvr * modifier * variance).toFixed(2))
    const conversions = Math.round(clicks * (conversionRate / 100))
    const totalSpend = clicks * cpc
    const costPerLead = conversions > 0 ? Number((totalSpend / conversions).toFixed(2)) : 0
    
    // Estimated monthly leads: assume 30 days at ~1667 impressions/day
    const estimatedMonthlyLeads = Math.round(conversions * (30 / 14)) // Assuming 14-day sim
    
    // ROAS: revenue / spend — estimate avg lead value based on industry
    const leadValues: Record<string, number> = {
      restaurant: 45,
      roofing: 2500,
      fitness: 120,
      beauty: 85,
      professional: 1500,
      default: 200,
    }
    const avgLeadValue = leadValues[industryKey] || 200
    const revenue = conversions * avgLeadValue
    const roas = totalSpend > 0 ? Number((revenue / totalSpend).toFixed(1)) : 0
    
    // Confidence: winner gets 88-96%, losers get 72-88%
    const confidence = isWinner
      ? Number(randomInRange(88, 96).toFixed(0))
      : Number(randomInRange(72, 88).toFixed(0))
    
    return {
      creativeId: creative.id,
      variant: variants[i] || String.fromCharCode(65 + i),
      impressions,
      clicks,
      ctr,
      cpc,
      conversions,
      conversionRate,
      costPerLead,
      estimatedMonthlyLeads,
      roas,
      confidence: Number(confidence),
      isWinner,
    }
  })
  
  return results
}
