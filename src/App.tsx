import { useMissionStore } from './store/mission'
import { MissionConfig } from './components/MissionConfig'
import { MissionDashboard } from './components/MissionDashboard'
import { Crosshair } from 'lucide-react'

export default function App() {
  const { mission, createMission, startMission } = useMissionStore()

  const handleSubmit = (config: Parameters<typeof createMission>[0]) => {
    createMission(config)
    // Auto-start after a brief moment
    setTimeout(() => {
      startMission()
    }, 500)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-accent" />
            <span className="font-semibold text-text">Outbound Agent</span>
            <span className="text-xs text-text-dim bg-surface-2 px-2 py-0.5 rounded-full">by OpenClaw</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-dim">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Agent online
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-8">
        {!mission ? (
          <MissionConfig onSubmit={handleSubmit} />
        ) : (
          <MissionDashboard />
        )}
      </main>
    </div>
  )
}
