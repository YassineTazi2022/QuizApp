import { useEffect, useState } from 'react'
import './App.css'
import RoleSelect from './components/RoleSelect.jsx'
import HostView from './components/HostView.jsx'
import PlayerView from './components/PlayerView.jsx'

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

  function handleBackToRoleSelect() {
    setRole('')
  }

  return (
    <div className="app">
      {!role && <RoleSelect onSelect={setRole} />}
      {role === 'host' && <HostView onBack={handleBackToRoleSelect} />}
      {role === 'player' && <PlayerView onBack={handleBackToRoleSelect} />}
    </div>
  )
}

export default App
