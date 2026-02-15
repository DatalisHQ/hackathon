import { useState, useCallback, useRef, useEffect } from 'react'
import { ArrowUp, Mic, MicOff } from 'lucide-react'

// Speech Recognition types (Web Speech API)
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}
interface SpeechRecognitionErrorEvent {
  error: string
}
interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

interface Props {
  onSend: (message: string) => void
  isBuilding: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isBuilding, disabled }: Props) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const hasRecognition = !!getSpeechRecognition()

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }, [value, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript
      if (transcript.trim()) {
        onSend(transcript.trim())
      }
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isListening, onSend])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const isEmpty = value.trim().length === 0

  return (
    <div className="flex-shrink-0 p-3 border-t border-border-bright/20">
      <div className={`flex items-center gap-2 bg-surface-2 border rounded-xl px-3 py-2 transition-colors ${isListening ? 'border-red-500/50 bg-red-500/5' : 'border-border-bright/30 focus-within:border-accent/50'}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening...' : isBuilding ? 'Talk to the agent...' : 'Enter a URL to start'}
          disabled={disabled || isListening}
          className="flex-1 bg-transparent text-xs text-text placeholder:text-text-dim outline-none disabled:opacity-50"
        />
        {hasRecognition && (
          <button
            onClick={toggleListening}
            disabled={disabled}
            className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full transition-all cursor-pointer ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-surface-3 text-text-muted hover:text-text hover:bg-surface-2 border border-border-bright/30'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </button>
        )}
        <button
          onClick={handleSend}
          disabled={isEmpty || disabled || isListening}
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent/20 active:scale-95 cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
