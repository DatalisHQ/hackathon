import confetti from 'canvas-confetti'

export function fireConfetti() {
  // First burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6, x: 0.5 },
    colors: ['#6366f1', '#818cf8', '#a78bfa', '#22c55e', '#f59e0b'],
  })

  // Side bursts after a beat
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#6366f1', '#818cf8', '#22c55e'],
    })
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#a78bfa', '#f59e0b', '#6366f1'],
    })
  }, 250)
}
