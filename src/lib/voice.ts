// Use the browser's built-in Web Speech API (SpeechSynthesis)
// No API keys needed — works in all modern browsers

let speaking = false
let enabled = true
let currentUtterance: SpeechSynthesisUtterance | null = null

export function setVoiceEnabled(v: boolean) {
  enabled = v
  if (!v) stopSpeaking()
}

export function isVoiceEnabled() { return enabled }

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  speaking = false
  currentUtterance = null
}

export function speak(text: string, priority: 'low' | 'high' = 'low') {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return

  // For high priority, interrupt current speech
  if (priority === 'high' && speaking) {
    window.speechSynthesis.cancel()
  }

  // Skip if already speaking and low priority
  if (speaking && priority === 'low') return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.1  // Slightly faster for demo energy
  utterance.pitch = 0.95 // Slightly deeper, more authoritative
  utterance.volume = 0.8

  // Try to pick a good English voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
    || voices.find(v => v.name.includes('Daniel'))
    || voices.find(v => v.lang.startsWith('en-') && v.localService)
    || voices[0]
  if (preferred) utterance.voice = preferred

  utterance.onstart = () => { speaking = true }
  utterance.onend = () => { speaking = false; currentUtterance = null }
  utterance.onerror = () => { speaking = false; currentUtterance = null }

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}
