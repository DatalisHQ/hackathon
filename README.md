# AdForge

Paste a URL. Get an ad campaign. That's it.

## What is this

AdForge is an AI agent that builds Facebook and Google ad campaigns from scratch. You give it a business URL, it scrapes the site, figures out what the business does, builds audience personas, writes ad copy, generates creatives, and assembles a ready-to-launch campaign. Takes about 60 seconds.

No forms. No onboarding. No 15-step wizard. Just a URL.

**Live:** https://outbound-agent-alpha.vercel.app

## Why

Small businesses pay agencies $2-5K/month for ad campaigns. Most of that work is templated. An AI can do it in a minute for close to nothing. That's the bet.

## How it works

The whole thing runs as an 8-stage pipeline:

1. Scrapes the website (CORS proxy + content extraction)
2. Analyses the business with Claude (industry, strengths, weaknesses, brand tone)
3. Builds 3 target audience personas
4. Plans the campaign strategy
5. Writes Facebook ad copy (3 variants, different angles)
6. Writes Google Search ads
7. Assembles campaign config (budget, duration, reach estimates)
8. Runs A/B simulation with synthetic performance data

You can talk to the agent at any point during the build. Type or use your mic. It picks up your instructions and folds them into the next step.

After it's done you can edit any copy inline, ask questions about the campaign, and run simulated A/B tests against industry benchmarks.

## The interaction stuff

This was built for a hackathon about AI interaction design, so the UX is the point:

- **You watch the agent think.** Real-time reasoning stream shows what it's reading, what it decided, and why. Not hidden behind a spinner.
- **You can interrupt it.** Chat input is always visible. Tell it "focus on local customers" mid-build and it adjusts.
- **Voice in, voice out.** Mic button for speech input. Agent narrates key decisions via Web Speech API.
- **Sound design.** Subtle audio ticks on decisions, chimes on stage completion. You can hear the AI working.
- **Approval gate.** Strategy phase completes, then it stops and asks permission before generating ads. You stay in control.
- **A/B testing.** After the build, simulate test runs across your ad variants with industry-specific synthetic data.

## Run it locally

```bash
git clone https://github.com/DatalisHQ/hackathon.git
cd hackathon
cp .env.example .env
# Add your Anthropic API key to .env
npm install
npm run dev
```

Without an API key it still works but falls back to placeholder data instead of real AI analysis.

## Stack

React, TypeScript, Vite, Tailwind v4. Claude Sonnet 4 via API proxy. Web Audio API for sounds. Web Speech API for voice. Canvas Confetti for the dopamine hit. No UI framework. Everything from scratch.

## Built for

Sophiie AI Agents Hackathon 2026. Solo entry. ~24 hours of build time.

The thesis: AI should replace dashboards, not just sit inside them. AdForge is what happens when you let the agent do the whole job instead of making the human click through 40 form fields.
