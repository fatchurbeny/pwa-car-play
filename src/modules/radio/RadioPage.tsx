import { useCallback, useEffect, useRef, useState } from 'react'

const STREAM_URL = 'https://c5.siar.us/proxy/ssfm/stream'
type PlayerStatus = 'idle' | 'loading' | 'playing' | 'reconnecting' | 'error'

export function RadioPage() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const retryTimer = useRef<number>()
  const wantsPlayback = useRef(false)
  const [status, setStatus] = useState<PlayerStatus>('idle')

  const pause = useCallback(() => {
    wantsPlayback.current = false
    window.clearTimeout(retryTimer.current)
    audioRef.current?.pause()
    setStatus('idle')
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    wantsPlayback.current = true
    setStatus('loading')
    try {
      await audio.play()
    } catch {
      setStatus('error')
    }
  }, [])

  const reconnect = useCallback(() => {
    if (!wantsPlayback.current) return
    setStatus('reconnecting')
    window.clearTimeout(retryTimer.current)
    retryTimer.current = window.setTimeout(() => {
      const audio = audioRef.current
      if (!audio || !wantsPlayback.current) return
      audio.load()
      void play()
    }, 3_000)
  }, [play])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({ artist: 'Suara Surabaya', title: 'SSFM 100' })
    navigator.mediaSession.setActionHandler('play', () => void play())
    navigator.mediaSession.setActionHandler('pause', pause)
    return () => {
      window.clearTimeout(retryTimer.current)
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
    }
  }, [pause, play])

  const isPlaying = status === 'playing' || status === 'loading' || status === 'reconnecting'
  const detail = status === 'reconnecting' ? 'Menyambungkan ulang…' : status === 'error' ? 'Stream tidak tersedia. Coba lagi.' : isPlaying ? 'Sedang diputar' : 'Siap diputar'

  return <section className="radio-page">
    <audio ref={audioRef} preload="none" src={STREAM_URL} onPlaying={() => setStatus('playing')} onWaiting={() => setStatus('loading')} onError={reconnect} />
    <div className="radio-live"><span aria-hidden="true" /> LIVE</div>
    <p className="radio-frequency">100.0 FM</p>
    <h1>Suara Surabaya</h1>
    <p className="radio-status" aria-live="polite">{detail}</p>
    <button className="radio-control" type="button" onClick={() => isPlaying ? pause() : void play()} aria-label={isPlaying ? 'Jeda Suara Surabaya' : 'Putar Suara Surabaya'}>
      {isPlaying ? 'Ⅱ' : '▶'}
    </button>
  </section>
}
