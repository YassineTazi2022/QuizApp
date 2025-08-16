import { useEffect, useState } from 'react'
import './App.css'
import RoleSelect from './components/RoleSelect.jsx'
import HostView from './components/HostView.jsx'
import PlayerView from './components/PlayerView.jsx'
import { getCurrentRoomId, setCurrentRoomId, updateUrlParams } from './utils/room.js'

function App() {
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('role')
    return saved || ''
  })

  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role)
    } else {
      localStorage.removeItem('role')
    }
  }, [role])

  useEffect(() => {
    // Sync role in URL for shareable links
    updateUrlParams({ role: role || null })
  }, [role])

  function handleBackToRoleSelect() {
    setRole('')
    setCurrentRoomId('')
  }

  return (
    <div className={`app ${role === 'player' ? 'player-mode' : ''}`}>
      {!role && <RoleSelect onSelect={setRole} />}
      {role === 'host' && <HostView onBack={handleBackToRoleSelect} />}
      {role === 'player' && <PlayerView onBack={handleBackToRoleSelect} />}
    </div>
  )
}

export default App
