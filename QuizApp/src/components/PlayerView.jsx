import { useEffect, useState } from 'react'
import { getCurrentRoomId, roomExists, setCurrentRoomId, getOrCreatePlayerId, upsertPlayer, getRoom, submitAnswer, hasAnswered, removePlayer } from '../utils/room.js'

function PlayerView({ onBack }) {
  const [inputRoom, setInputRoom] = useState('')
  const [joinedRoom, setJoinedRoom] = useState('')
  const [error, setError] = useState('')
  const [chosenQuestion, setChosenQuestion] = useState(null)
  const [roundNumber, setRoundNumber] = useState(1)
  const [answeredQuestion, setAnsweredQuestion] = useState(null)
  const [players, setPlayers] = useState([])
  const [playerName, setPlayerName] = useState('')
  const [playerId] = useState(() => getOrCreatePlayerId())

  useEffect(() => {
    const maybeRoom = getCurrentRoomId()
    if (maybeRoom && roomExists(maybeRoom)) {
      setJoinedRoom(maybeRoom)
    }
  }, [])

  // Sync room state periodically (question, round, players, answers)
  useEffect(() => {
    if (!joinedRoom) return

    const syncRoom = () => {
      const room = getRoom(joinedRoom)
      if (!room) return
      setChosenQuestion(room.currentQuestion)
      setRoundNumber(room.round || 1)
      const leaderboard = Object.entries(room.players || {}).map(([id, info]) => ({ id, ...info }))
      leaderboard.sort((a, b) => (b.points || 0) - (a.points || 0))
      setPlayers(leaderboard)
      try {
        const answered = hasAnswered(joinedRoom, playerId)
        if (answered) {
          // lock if answered this round
          if (answeredQuestion === null && room.answers && room.answers[String(room.round)] && room.answers[String(room.round)][playerId] !== undefined) {
            setAnsweredQuestion(room.answers[String(room.round)][playerId])
          }
        } else {
          // if new round and no answer stored, unlock answer
          setAnsweredQuestion(null)
        }
      } catch (e) {
        // ignore transient errors
      }
    }

    syncRoom()
    const interval = setInterval(syncRoom, 800)

    return () => clearInterval(interval)
  }, [joinedRoom])

  // Add keyboard support for answering questions
  useEffect(() => {
    if (!chosenQuestion) return

    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase()
      if (key >= 'A' && key <= 'D') {
        const answerIndex = key.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
        if (answerIndex < chosenQuestion.options.length) {
          handleAnswer(answerIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [chosenQuestion])

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
    const name = playerName.trim() || 'Speler'
    upsertPlayer(id, playerId, name)
  }

  function handleLeave() {
    setJoinedRoom('')
    setCurrentRoomId('')
    setChosenQuestion(null)
    removePlayer(joinedRoom, playerId)
  }

  function handleAnswer(answerIndex) {
    if (!chosenQuestion || answeredQuestion !== null) return
    const result = submitAnswer(joinedRoom, playerId, answerIndex)
    if (result && result.accepted) {
      setAnsweredQuestion(answerIndex)
    }
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
          <label>
            Naam
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Jouw naam"
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
        <div className="player-game-container">
          {chosenQuestion ? (
            <>
              {/* Top segment with round number, question and leaderboard */}
              <div className="game-top-segment">
                <div className="game-info">
                  <div className="round-info">Ronde {roundNumber}</div>
                  <div className="question-display">{chosenQuestion.question}</div>
                </div>
                <div className="leaderboard">
                  <h3>Scorebord</h3>
                  {players.map((player, idx) => (
                    <div key={idx} className="player-score">
                      <span className="player-name">{player.name}</span>
                      <span className="player-points">{player.points} punten</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer buttons */}
              <div className="answer-buttons">
                {chosenQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    className={`answer-btn ${answeredQuestion === idx ? 'answered' : ''} ${answeredQuestion !== null && answeredQuestion !== idx ? 'disabled' : ''} ${answeredQuestion !== null && idx === chosenQuestion.answerIndex ? 'correct' : ''} ${answeredQuestion === idx && answeredQuestion !== chosenQuestion.answerIndex ? 'incorrect' : ''}`}
                    onClick={() => handleAnswer(idx)}
                    disabled={answeredQuestion !== null}
                    style={{
                      backgroundImage: `url(${(chosenQuestion.optionImages && chosenQuestion.optionImages[idx]) || ''})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#fff',
                      position: 'relative'
                    }}
                  >
                    <span className="answer-overlay"></span>
                    <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                    <span className="answer-text">{option}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="waiting-message">
              <p>Wachten op vraag van de quizmaster...</p>
            </div>
          )}

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


