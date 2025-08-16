import { WebSocketServer } from 'ws'

/* eslint-disable no-undef */
const PORT = (typeof process !== 'undefined' && process.env && process.env.PORT) ? process.env.PORT : 3001
const wss = new WebSocketServer({ port: PORT })

// In-memory room state (authoritative server store)
// roomId -> { players: {playerId: {name, points}}, round, currentQuestion, answers: {roundKey: {playerId: index}} }
const rooms = new Map()

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      players: {},
      round: 1,
      currentQuestion: null,
      answers: {},
    })
  }
  return rooms.get(roomId)
}

function broadcast(roomId, payload) {
  const message = JSON.stringify(payload)
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.subscribedRoomId === roomId) {
      client.send(message)
    }
  })
}

function safeParse(data) {
  try { return JSON.parse(data) } catch { return null }
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = safeParse(data)
    if (!msg || !msg.type) return

    if (msg.type === 'subscribe' && msg.roomId) {
      ws.subscribedRoomId = msg.roomId
      // Send initial snapshot
      const room = getOrCreateRoom(msg.roomId)
      ws.send(JSON.stringify({ type: 'room_snapshot', roomId: msg.roomId, room }))
      return
    }

    const { roomId } = msg
    if (!roomId) return
    const room = getOrCreateRoom(roomId)

    switch (msg.type) {
      case 'host_set_question': {
        room.currentQuestion = msg.question || null
        broadcast(roomId, { type: 'room_update', room })
        break
      }
      case 'host_new_round': {
        room.round = (room.round || 1) + 1
        room.currentQuestion = null
        broadcast(roomId, { type: 'room_update', room })
        break
      }
      case 'player_join': {
        const { playerId, name } = msg
        if (!room.players[playerId]) {
          room.players[playerId] = { name: name || 'Speler', points: 0 }
        } else if (name) {
          room.players[playerId].name = name
        }
        broadcast(roomId, { type: 'room_update', room })
        break
      }
      case 'player_update_name': {
        const { playerId, name } = msg
        if (!room.players[playerId]) {
          room.players[playerId] = { name: name || 'Speler', points: 0 }
        } else if (typeof name === 'string') {
          room.players[playerId].name = name || 'Speler'
        }
        broadcast(roomId, { type: 'room_update', room })
        break
      }
      case 'player_leave': {
        const { playerId } = msg
        delete room.players[playerId]
        broadcast(roomId, { type: 'room_update', room })
        break
      }
      case 'player_answer': {
        const { playerId, answerIndex } = msg
        const roundKey = String(room.round)
        if (!room.answers[roundKey]) room.answers[roundKey] = {}
        if (room.answers[roundKey][playerId] === undefined) {
          room.answers[roundKey][playerId] = answerIndex
          if (room.currentQuestion && room.currentQuestion.answerIndex === answerIndex) {
            if (!room.players[playerId]) room.players[playerId] = { name: 'Speler', points: 0 }
            room.players[playerId].points = (room.players[playerId].points || 0) + 10
          }
          broadcast(roomId, { type: 'room_update', room })
        }
        break
      }
      default:
        break
    }
  })
})

console.log(`[ws] WebSocket server listening on :${PORT}`)


