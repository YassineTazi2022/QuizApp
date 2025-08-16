import { useEffect, useMemo, useState } from 'react'
import { motorcycleQuestions } from '../data/motorcycleQuestions.js'
import { createRoom, getCurrentRoomId, setCurrentRoomId, setRoomQuestion, startNewRound } from '../utils/room.js'
import { connect as wsConnect, wsApi, onMessage } from '../utils/ws.js'

function HostView({ onBack }) {
  const [candidates, setCandidates] = useState(() => pickTwoRandomQuestions(motorcycleQuestions))
  const [chosenQuestion, setChosenQuestion] = useState(() => {
    const raw = localStorage.getItem('currentQuestion')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })
  const [players, setPlayers] = useState([])
  const [roundNumber, setRoundNumber] = useState(1)
  const [roomId] = useState(() => {
    const existing = getCurrentRoomId()
    if (existing) {
      setCurrentRoomId(existing)
      return existing
    }
    const id = createRoom()
    return id
  })

  const totalQuestions = useMemo(() => motorcycleQuestions.length, [])

  useEffect(() => {
    if (!roomId) return
    setRoomQuestion(roomId, chosenQuestion)
    // Notify players via WS
    wsApi.hostSetQuestion(roomId, chosenQuestion)
  }, [chosenQuestion, roomId])

  // roomId is created in initializer; keep URL/localStorage in sync when it changes
  useEffect(() => {
    if (roomId) {
      setCurrentRoomId(roomId)
      wsConnect(roomId)
    }
  }, [roomId])

  // Listen for room updates to keep leaderboard and round in sync
  useEffect(() => {
    if (!roomId) return
    const unsubscribe = onMessage((msg) => {
      if ((msg.type === 'room_update' || msg.type === 'room_snapshot') && msg.room) {
        const room = msg.room
        const leaderboard = Object.entries(room.players || {}).map(([id, info]) => ({ id, ...info }))
        leaderboard.sort((a, b) => (b.points || 0) - (a.points || 0))
        setPlayers(leaderboard)
        setRoundNumber(room.round || 1)
      }
    })
    return () => unsubscribe && unsubscribe()
  }, [roomId])

  function handleReroll() {
    setCandidates(pickTwoRandomQuestions(motorcycleQuestions))
  }

  function handleChoose(question) {
    setChosenQuestion(question)
  }

  function handleClearChoice() {
    setChosenQuestion(null)
    if (roomId) startNewRound(roomId)
    if (roomId) wsApi.hostNewRound(roomId)
    setCandidates(pickTwoRandomQuestions(motorcycleQuestions))
  }

  return (
    <div className="section">
      <h2>Quizmaster</h2>
      <div>Room ID: <strong>{roomId}</strong></div>
      <p>Kies één van de twee willekeurige vragen uit {totalQuestions} motor trivia vragen.</p>

      {chosenQuestion && (
        <div className="chosen">
          <strong>Gekozen vraag:</strong> {chosenQuestion.question}
          <div style={{ marginTop: 4, color: '#666' }}>Ronde: <strong>{roundNumber}</strong></div>
          <div className="question-options">
            {chosenQuestion.options.map((opt, idx) => (
              <div key={idx}>• {opt}</div>
            ))}
          </div>
          <div className="question-actions">
            <button className="btn" onClick={handleClearChoice}>Nieuwe ronde</button>
          </div>
          <div className="leaderboard" style={{ marginTop: 12 }}>
            <h3>Scorebord</h3>
            {players.map((p, idx) => (
              <div key={p.id || idx} className="player-score">
                <span className="player-name">{p.name}</span>
                <span className="player-points">{p.points || 0} punten</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="question-actions" style={{ marginTop: 12 }}>
        <button className="btn" onClick={handleReroll}>Geef 2 nieuwe vragen</button>
      </div>

      <div className="question-grid">
        {candidates.map((q) => (
          <div key={q.id} className={`question-card${chosenQuestion && chosenQuestion.id === q.id ? ' selected' : ''}`}>
            <div className="question-text">{q.question}</div>
            <div className="question-options">
              {q.options.map((opt, idx) => (
                <div key={idx}>• {opt}</div>
              ))}
            </div>
            <div className="question-actions">
              <button className="btn" disabled={!!chosenQuestion} onClick={() => handleChoose(q)}>
                Kies deze vraag
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn back" onClick={onBack}>Terug naar rolkeuze</button>
    </div>
  )
}

function pickTwoRandomQuestions(list) {
  if (!list || list.length < 2) return list || []
  const firstIndex = Math.floor(Math.random() * list.length)
  let secondIndex = Math.floor(Math.random() * list.length)
  while (secondIndex === firstIndex) {
    secondIndex = Math.floor(Math.random() * list.length)
  }
  return [list[firstIndex], list[secondIndex]]
}

export default HostView


