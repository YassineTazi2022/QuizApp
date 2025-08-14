import { useEffect, useMemo, useState } from 'react'
import { motorcycleQuestions } from '../data/motorcycleQuestions.js'

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

  const totalQuestions = useMemo(() => motorcycleQuestions.length, [])

  useEffect(() => {
    if (chosenQuestion) {
      localStorage.setItem('currentQuestion', JSON.stringify(chosenQuestion))
    } else {
      localStorage.removeItem('currentQuestion')
    }
  }, [chosenQuestion])

  function handleReroll() {
    setCandidates(pickTwoRandomQuestions(motorcycleQuestions))
  }

  function handleChoose(question) {
    setChosenQuestion(question)
  }

  function handleClearChoice() {
    setChosenQuestion(null)
    setCandidates(pickTwoRandomQuestions(motorcycleQuestions))
  }

  return (
    <div className="section">
      <h2>Quizmaster</h2>
      <p>Kies één van de twee willekeurige vragen uit {totalQuestions} motor trivia vragen.</p>

      {chosenQuestion && (
        <div className="chosen">
          <strong>Gekozen vraag:</strong> {chosenQuestion.question}
          <div className="question-options">
            {chosenQuestion.options.map((opt, idx) => (
              <div key={idx}>• {opt}</div>
            ))}
          </div>
          <div className="question-actions">
            <button className="btn" onClick={handleClearChoice}>Nieuwe ronde</button>
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


