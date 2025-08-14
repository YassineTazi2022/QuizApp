function PlayerView({ onBack }) {
  return (
    <div className="section">
      <h2>Speler</h2>
      <p>Hier kan je later een game joinen en antwoorden.</p>
      <button className="btn back" onClick={onBack}>Terug naar rolkeuze</button>
    </div>
  )
}

export default PlayerView


