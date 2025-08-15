import { useEffect, useState } from 'react'
import { getCurrentRoomId, roomExists, setCurrentRoomId } from '../utils/room.js'

function PlayerView({ onBack }) {
  const [inputRoom, setInputRoom] = useState('')
  const [joinedRoom, setJoinedRoom] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const maybeRoom = getCurrentRoomId()
    if (maybeRoom && roomExists(maybeRoom)) {
      setJoinedRoom(maybeRoom)
    }
  }, [])

  function handleJoin(e) {
    e.preventDefault()
    const id = inputRoom.trim().toUpperCase()
    if (!id) {
      setError('Voer een room ID in')
      return
    }
    if (!roomExists(id)) {
      setError('Room niet gevonden')
      return
    }
    setError('')
    setJoinedRoom(id)
    setCurrentRoomId(id)
  }

  function handleLeave() {
    setJoinedRoom('')
    setCurrentRoomId('')
  }

  return (
    <div className="section">
      <h2>Speler</h2>
      {!joinedRoom && (
        <form onSubmit={handleJoin} className="section">
          <label>
            Room ID
            <input
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value)}
              placeholder="BV: ABC123"
              style={{ marginLeft: 8, padding: 6 }}
            />
          </label>
          <div className="question-actions">
            <button className="btn" type="submit">Join</button>
          </div>
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
        </form>
      )}

      {joinedRoom && (
        <div className="section">
          <div>Gejoined in room: <strong>{joinedRoom}</strong></div>
          <div className="question-actions">
            <button className="btn" onClick={handleLeave}>Leave room</button>
          </div>
        </div>
      )}

      <button className="btn back" onClick={onBack}>Terug naar rolkeuze</button>
    </div>
  )
}

export default PlayerView


