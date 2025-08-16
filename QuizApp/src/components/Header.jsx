import { useEffect, useState } from 'react'
import { getCurrentRoomId } from '../utils/room.js'

function Header() {
  const [roomId, setRoomId] = useState('')

  useEffect(() => {
    setRoomId(getCurrentRoomId() || '')
    const interval = setInterval(() => {
      setRoomId(getCurrentRoomId() || '')
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-mark">Q</span>
        <span className="brand-text">QuizApp</span>
      </div>
      {roomId && (
        <div className="header-right">
          <span className="badge">Room {roomId}</span>
        </div>
      )}
    </header>
  )
}

export default Header


