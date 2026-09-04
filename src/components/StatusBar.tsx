import { useEffect, useState } from 'react'

function getTime() {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

export function StatusBar() {
  const [time, setTime] = useState(getTime)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const timer = window.setInterval(() => setTime(getTime()), 1_000)
    const updateConnection = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  return <header className="status-bar">
    <time>{time}</time>
    <span aria-live="polite" className={`connection ${online ? 'online' : 'offline'}`}>
      <span aria-hidden="true" className="connection-dot" />
      {online ? 'Terhubung' : 'Offline'}
    </span>
  </header>
}
