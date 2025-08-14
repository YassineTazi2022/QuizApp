function RoleSelect({ onSelect }) {
  return (
    <div className="role-select">
      <h1 className="title">Kies je rol</h1>
      <div className="button-row">
        <button className="btn" onClick={() => onSelect('host')}>Ik ben Quizmaster</button>
        <button className="btn" onClick={() => onSelect('player')}>Ik ben Speler</button>
      </div>
    </div>
  )
}

export default RoleSelect


