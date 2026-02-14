import type { ToolCall, ToolName, ChatMessage } from '../types'

// ─── Tool display names & icons ────────────────────────────────────────────

export const TOOL_META: Record<ToolName, { label: string; icon: string; color: string }> = {
  web_search: { label: 'Web Search', icon: '🔍', color: 'text-blue-400' },
  web_fetch: { label: 'Fetch Page', icon: '🌐', color: 'text-cyan-400' },
  browser: { label: 'Browser', icon: '🖥️', color: 'text-purple-400' },
  exec: { label: 'Terminal', icon: '⚡', color: 'text-yellow-400' },
  read: { label: 'Read File', icon: '📄', color: 'text-gray-400' },
  write: { label: 'Write File', icon: '✏️', color: 'text-green-400' },
  edit: { label: 'Edit File', icon: '🔧', color: 'text-orange-400' },
  memory_search: { label: 'Memory', icon: '🧠', color: 'text-pink-400' },
  image: { label: 'Analyse Image', icon: '🖼️', color: 'text-indigo-400' },
  tts: { label: 'Text to Speech', icon: '🔊', color: 'text-violet-400' },
  message: { label: 'Send Message', icon: '💬', color: 'text-emerald-400' },
  cron: { label: 'Schedule Task', icon: '⏰', color: 'text-amber-400' },
  nodes: { label: 'Device Control', icon: '📱', color: 'text-rose-400' },
  unknown: { label: 'Tool', icon: '🔧', color: 'text-gray-400' },
}

function classifyTool(name: string): ToolName {
  if (name in TOOL_META) return name as ToolName
  return 'unknown'
}

// ─── Simulated agent responses ─────────────────────────────────────────────
// In production this would proxy to a real OpenClaw gateway.
// For the hackathon demo, we simulate realistic agent behavior with
// real tool call patterns and streaming-style delivery.

interface AgentResponse {
  text: string
  toolCalls: ToolCall[]
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function makeToolCall(name: string, params: Record<string, any>, result: any, durationMs: number = 0): ToolCall {
  return {
    id: crypto.randomUUID(),
    name: classifyTool(name),
    displayName: TOOL_META[classifyTool(name)].label,
    params,
    result,
    status: 'completed',
    startedAt: Date.now() - durationMs,
    completedAt: Date.now(),
  }
}

type StreamCallback = (update: {
  text?: string
  toolCall?: ToolCall
  status?: 'thinking' | 'acting' | 'idle'
}) => void

// Each "scenario" is a pattern of tool usage + response
interface Scenario {
  match: (input: string) => boolean
  run: (input: string, onUpdate: StreamCallback) => Promise<void>
}

const scenarios: Scenario[] = [
  // ── Research / Search ──────────────────────────────────────────────────
  {
    match: (input) => /search|find|look up|research|what is|who is|how to/i.test(input),
    run: async (input, onUpdate) => {
      onUpdate({ status: 'thinking' })
      await delay(800)

      // Web search
      onUpdate({ status: 'acting' })
      const searchTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'web_search',
        displayName: 'Web Search',
        params: { query: input.replace(/^(search|find|look up|research)\s*(for|about)?\s*/i, '') },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: searchTool })
      await delay(1500)

      searchTool.status = 'completed'
      searchTool.completedAt = Date.now()
      searchTool.result = {
        results: [
          { title: `Top result for: ${searchTool.params.query}`, url: 'https://example.com/result-1', description: 'Comprehensive overview and analysis of the topic with recent data and expert insights.' },
          { title: `${searchTool.params.query} — Latest Research`, url: 'https://example.com/result-2', description: 'Academic and industry research findings from 2025-2026.' },
          { title: `Guide to ${searchTool.params.query}`, url: 'https://example.com/result-3', description: 'Step-by-step guide with practical examples and best practices.' },
        ]
      }
      onUpdate({ toolCall: searchTool })

      // Fetch top result
      await delay(500)
      const fetchTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'web_fetch',
        displayName: 'Fetch Page',
        params: { url: 'https://example.com/result-1' },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: fetchTool })
      await delay(2000)

      fetchTool.status = 'completed'
      fetchTool.completedAt = Date.now()
      fetchTool.result = { title: `Top result for: ${searchTool.params.query}`, wordCount: 2340, readTime: '8 min' }
      onUpdate({ toolCall: fetchTool })

      await delay(600)
      onUpdate({ status: 'idle' })
      onUpdate({ text: `Here's what I found about **${searchTool.params.query}**:\n\nI searched the web and read through the top results. The key findings are:\n\n1. **Overview**: The topic has seen significant developments in 2025-2026, with new approaches emerging across the industry.\n\n2. **Key insight**: The most cited research suggests a shift toward AI-driven automation, with 73% of businesses adopting some form of intelligent tooling.\n\n3. **Practical takeaway**: The most effective approach combines automated workflows with human oversight — exactly the pattern we're building here.\n\nWant me to dig deeper into any specific aspect?` })
    },
  },

  // ── Website analysis ───────────────────────────────────────────────────
  {
    match: (input) => /\b(check|analyse|analyze|review|audit|look at)\b.*\b(website|site|page|url)\b|https?:\/\//i.test(input),
    run: async (input, onUpdate) => {
      const urlMatch = input.match(/https?:\/\/[^\s]+/)
      const url = urlMatch ? urlMatch[0] : 'https://example.com'
      const domain = url.replace(/https?:\/\//, '').split('/')[0]

      onUpdate({ status: 'acting' })
      
      // Fetch the site
      const fetchTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'web_fetch',
        displayName: 'Fetch Page',
        params: { url },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: fetchTool })
      await delay(2500)

      fetchTool.status = 'completed'
      fetchTool.completedAt = Date.now()
      fetchTool.result = {
        title: `${domain} — Homepage`,
        status: 200,
        wordCount: 1850,
        hasContactForm: true,
        hasPricing: false,
        techStack: ['React', 'Vercel'],
      }
      onUpdate({ toolCall: fetchTool })

      // Browser screenshot
      await delay(400)
      const browserTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'browser',
        displayName: 'Browser',
        params: { action: 'screenshot', url },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: browserTool })
      await delay(3000)

      browserTool.status = 'completed'
      browserTool.completedAt = Date.now()
      browserTool.result = { action: 'screenshot', captured: true, dimensions: '1280x720' }
      onUpdate({ toolCall: browserTool })

      await delay(800)
      onUpdate({ status: 'idle' })
      onUpdate({ text: `Here's my analysis of **${domain}**:\n\n🟢 **Good:**\n- Site loads fast, modern tech stack (React on Vercel)\n- Has a contact form — important for lead capture\n- Mobile responsive\n\n🟡 **Could improve:**\n- No pricing page visible — this creates friction for buyers\n- No Meta Pixel detected — missing retargeting opportunity\n- No structured data / schema markup for SEO\n\n🔴 **Issues:**\n- No clear CTA above the fold\n- Blog exists but hasn't been updated in 3+ months\n\n**Recommendation:** Add a clear value proposition and CTA in the hero section, install Meta Pixel for retargeting, and add a pricing page. These three changes alone could improve conversion 2-3x.\n\nWant me to draft specific copy for the hero section?` })
    },
  },

  // ── Write/create something ─────────────────────────────────────────────
  {
    match: (input) => /\b(write|create|draft|generate|make|build)\b/i.test(input),
    run: async (input, onUpdate) => {
      onUpdate({ status: 'thinking' })
      await delay(1200)

      // Memory check
      const memTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'memory_search',
        displayName: 'Memory',
        params: { query: input.slice(0, 50) },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: memTool })
      await delay(800)

      memTool.status = 'completed'
      memTool.completedAt = Date.now()
      memTool.result = { matches: 2, topSnippet: 'Previous context found — incorporating into output.' }
      onUpdate({ toolCall: memTool })

      // Write file
      onUpdate({ status: 'acting' })
      await delay(600)
      const writeTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'write',
        displayName: 'Write File',
        params: { path: '/workspace/output.md', content: '(generating...)' },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: writeTool })
      await delay(2500)

      writeTool.status = 'completed'
      writeTool.completedAt = Date.now()
      writeTool.result = { path: '/workspace/output.md', bytes: 2847 }
      onUpdate({ toolCall: writeTool })

      await delay(400)
      onUpdate({ status: 'idle' })
      onUpdate({ text: `Done. I've created the file and written the content.\n\nI checked my memory for relevant context and found some previous notes that helped shape the output. The file is saved to \`/workspace/output.md\` (2.8 KB).\n\nHere's a preview of what I wrote:\n\n> *The content has been tailored based on your previous preferences and the context of your request. It follows the tone guidelines from your project configuration.*\n\nWant me to refine anything, or shall I move on to the next task?` })
    },
  },

  // ── Run a command ──────────────────────────────────────────────────────
  {
    match: (input) => /\b(run|execute|deploy|install|build|git|npm|ssh)\b/i.test(input),
    run: async (input, onUpdate) => {
      onUpdate({ status: 'acting' })
      await delay(400)

      const command = input.replace(/^(run|execute|please)\s*/i, '')
      const execTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'exec',
        displayName: 'Terminal',
        params: { command: command.slice(0, 80) },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: execTool })
      await delay(3000)

      execTool.status = 'completed'
      execTool.completedAt = Date.now()
      execTool.result = { exitCode: 0, output: '✓ Command completed successfully' }
      onUpdate({ toolCall: execTool })

      await delay(500)
      onUpdate({ status: 'idle' })
      onUpdate({ text: `Command executed successfully (exit code 0).\n\n\`\`\`\n$ ${command.slice(0, 80)}\n✓ Completed\n\`\`\`\n\nAnything else you need me to run?` })
    },
  },

  // ── Send a message ─────────────────────────────────────────────────────
  {
    match: (input) => /\b(send|message|notify|alert|tell|text|email)\b/i.test(input),
    run: async (input, onUpdate) => {
      onUpdate({ status: 'acting' })
      await delay(600)

      const msgTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'message',
        displayName: 'Send Message',
        params: { action: 'send', channel: 'telegram', message: input.slice(0, 100) },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: msgTool })
      await delay(1500)

      msgTool.status = 'completed'
      msgTool.completedAt = Date.now()
      msgTool.result = { sent: true, channel: 'telegram', messageId: crypto.randomUUID().slice(0, 8) }
      onUpdate({ toolCall: msgTool })

      await delay(300)
      onUpdate({ status: 'idle' })
      onUpdate({ text: `Message sent via Telegram. ✓\n\nThe recipient will see it immediately. Want me to schedule a follow-up?` })
    },
  },

  // ── Schedule something ─────────────────────────────────────────────────
  {
    match: (input) => /\b(schedule|remind|cron|timer|every|at \d|in \d)\b/i.test(input),
    run: async (input, onUpdate) => {
      onUpdate({ status: 'acting' })
      await delay(500)

      const cronTool: ToolCall = {
        id: crypto.randomUUID(),
        name: 'cron',
        displayName: 'Schedule Task',
        params: { action: 'add', schedule: 'parsed from input', task: input.slice(0, 60) },
        status: 'running',
        startedAt: Date.now(),
      }
      onUpdate({ toolCall: cronTool })
      await delay(1200)

      cronTool.status = 'completed'
      cronTool.completedAt = Date.now()
      cronTool.result = { jobId: crypto.randomUUID().slice(0, 8), scheduled: true }
      onUpdate({ toolCall: cronTool })

      await delay(300)
      onUpdate({ status: 'idle' })
      onUpdate({ text: `Scheduled. ✓\n\nI've set up the task and it'll run automatically. I'll notify you when it fires. You can say "list my schedules" to see all active tasks.` })
    },
  },

  // ── Default / conversation ─────────────────────────────────────────────
  {
    match: () => true,
    run: async (input, onUpdate) => {
      onUpdate({ status: 'thinking' })
      await delay(1500)

      // Sometimes check memory for context
      if (input.length > 20) {
        const memTool: ToolCall = {
          id: crypto.randomUUID(),
          name: 'memory_search',
          displayName: 'Memory',
          params: { query: input.slice(0, 40) },
          status: 'running',
          startedAt: Date.now(),
        }
        onUpdate({ toolCall: memTool })
        await delay(600)
        memTool.status = 'completed'
        memTool.completedAt = Date.now()
        memTool.result = { matches: 0 }
        onUpdate({ toolCall: memTool })
      }

      await delay(800)
      onUpdate({ status: 'idle' })
      onUpdate({ text: `I hear you. That's an interesting point.\n\nI don't have a specific tool action for this, but I'm here and ready. I can:\n\n- 🔍 **Search** the web for anything\n- 🌐 **Analyse** a website\n- ✏️ **Write** content or code\n- ⚡ **Run** commands on the server\n- 💬 **Send** messages via Telegram\n- ⏰ **Schedule** recurring tasks\n- 📱 **Control** connected devices\n\nWhat would you like me to do?` })
    },
  },
]

export async function sendMessage(input: string, onUpdate: StreamCallback): Promise<void> {
  const scenario = scenarios.find(s => s.match(input))
  if (scenario) {
    await scenario.run(input, onUpdate)
  }
}
