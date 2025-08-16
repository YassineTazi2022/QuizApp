let socket = null
let listeners = new Set()

export function connect(roomId) {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${protocol}://${location.hostname}:${3001}`
  socket = new WebSocket(url)

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'subscribe', roomId }))
  })

  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)
      listeners.forEach((cb) => cb(data))
    } catch {}
  })

  socket.addEventListener('close', () => {
    // Try to reconnect after short delay
    setTimeout(() => connect(roomId), 1000)
  })
}

export function onMessage(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function send(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data))
  }
}

export const wsApi = {
  hostSetQuestion(roomId, question) {
    send({ type: 'host_set_question', roomId, question })
  },
  hostNewRound(roomId) {
    send({ type: 'host_new_round', roomId })
  },
  playerJoin(roomId, playerId, name) {
    send({ type: 'player_join', roomId, playerId, name })
  },
  playerUpdateName(roomId, playerId, name) {
    send({ type: 'player_update_name', roomId, playerId, name })
  },
  playerLeave(roomId, playerId) {
    send({ type: 'player_leave', roomId, playerId })
  },
  playerAnswer(roomId, playerId, answerIndex) {
    send({ type: 'player_answer', roomId, playerId, answerIndex })
  }
}


