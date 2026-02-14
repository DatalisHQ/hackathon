# Sophiie AI Agents Hackathon 2026

## Your Submission

### Participant

| Field | Your Answer |
|-------|-------------|
| Name | Davis Grainger |
| University / Employer | Datalis / Independent |

### Project

| Field | Your Answer |
|-------|-------------|
| Project Name | AdForge |
| One-Line Description | Paste a URL. Watch AI build your entire Facebook ad campaign in 60 seconds. |
| Demo Video Link | *(recording in progress)* |
| Tech Stack | React, TypeScript, Vite, Tailwind CSS v4, Zustand, Web Audio API, Canvas Confetti |
| AI Provider(s) Used | Anthropic Claude (Sonnet 4) for business analysis, audience generation, and ad copywriting |

### About Your Project

#### What does it do?

AdForge turns any business URL into a ready-to-launch Facebook ad campaign — autonomously.

You paste a URL. The AI:
1. **Scrapes and reads** the entire website
2. **Analyses the business** — identifies industry, strengths, weaknesses, brand tone, and target market
3. **Creates audience personas** — 3 detailed personas with demographics, interests, pain points, and platform preferences
4. **Plans the strategy** — picks the right campaign objective, budget, and duration
5. **Writes ad copy** — 3 complete ad variants with different creative angles (headlines, body text, CTAs)
6. **Designs creative concepts** — generates image prompts for each ad variant
7. **Assembles the campaign** — configures targeting, budget, schedule, and performance estimates

The entire process takes about 30-60 seconds. No forms. No questionnaires. Just a URL.

#### How does the interaction work?

The interaction is designed around **transparency and control**:

**During the build:**
- A **live thinking stream** shows the AI's reasoning in real-time — what it's reading on the website, what insights it's extracting, what decisions it's making and why
- Each thinking line is **color-coded** by type: system operations (gray), raw data (cyan), insights (amber), decisions (purple), confirmations (green)
- **Sound design** provides subtle audio feedback — ticks on key decisions, chimes on stage completion
- A **progress tracker** shows which of the 8 stages is active, with live "thinking text" showing the current sub-task
- Results **appear progressively** on the right panel as each stage completes — you don't wait for everything to finish

**After the build:**
- Ad copy is **inline-editable** — click any headline or body text to modify it, the changes save immediately
- Creative images have a **regenerate hover** — indicating they can be refreshed
- A **confetti celebration** fires when the campaign is complete (because building something should feel good)
- **Share button** lets you copy the campaign URL
- **"New URL" button** lets you try another business immediately

The key insight: **the AI's work should be visible, not hidden behind a spinner.** Watching the agent think, reason, and decide is what makes the interaction feel alive rather than mechanical.

#### What makes it special?

1. **One input, full output.** Most ad tools require 15-20 form fields before generating anything. AdForge needs one URL. Everything else is inferred.

2. **The AI shows its work.** The thinking stream isn't a gimmick — it builds trust. You can see *why* the AI chose each audience, *why* it wrote each headline, *what* it found on your website. Transparency turns a black box into a collaborator.

3. **Sound as interaction.** Subtle Web Audio API tones provide cognitive feedback without being annoying. You can close your eyes and *hear* the AI working. This is an interaction design choice most AI tools ignore.

4. **Edit, don't regenerate.** Instead of "try again" buttons, you can surgically edit any piece of copy. The AI gives you a starting point; you refine it. This respects the human's expertise while leveraging the AI's speed.

5. **It solves a real $50B problem.** Small businesses pay $2,000-5,000/month to agencies for work that takes an AI 60 seconds. This isn't a demo — it's a product.

#### How to run it

```bash
git clone https://github.com/DatalisHQ/hackathon.git
cd hackathon
npm install
npm run dev
```

Open `http://localhost:5173` and paste any business URL.

**Optional:** To enable real AI-powered analysis (instead of fallback data), create a `.env` file:

```
ANTHROPIC_API_KEY=your-key-here
```

Then create `api/` serverless functions will use this key to proxy requests to Claude.

#### Architecture / Technical Notes

```
src/
├── App.tsx              # Main orchestrator — state management, routing
├── components/
│   ├── URLInput.tsx      # Hero input with glow effect + preset buttons
│   ├── BuildProgress.tsx # 8-stage progress tracker with live status
│   ├── ThinkingStream.tsx# Real-time AI reasoning feed
│   └── ResultsPanel.tsx  # Business card, audiences, ad previews, campaign summary
├── lib/
│   ├── engine.ts         # 8-stage build pipeline with web scraping + Claude API
│   ├── sounds.ts         # Web Audio API synthesised sound effects
│   └── confetti.ts       # Canvas confetti celebration
├── types/
│   └── index.ts          # Full TypeScript type system
└── index.css             # Tailwind v4 theme (dark mode, custom tokens)

api/
└── claude.ts             # Vercel Edge Function — secure Claude API proxy
```

**Key design decisions:**
- **No external UI library** — all components built from scratch for full control over interaction feel
- **Web Audio API** over audio files — zero network requests, instant playback, synthesised tones
- **Tailwind v4 with CSS theme tokens** — consistent dark theme without runtime overhead
- **CORS proxy for web scraping** — uses allorigins.win to fetch websites client-side
- **Graceful fallback** — works without an API key using intelligently generated placeholder data
- **Progressive rendering** — results appear as each stage completes, not all at once

---

*Built in ~20 hours during the Sophiie AI Agents Hackathon, February 14-15, 2026.*
*The AI agent that built your ad campaign was powered by the same kind of thinking that powers Sophiie — the belief that AI should do the work, so humans can focus on what matters.*
