const ROOMS_KEY = 'rooms'
const CURRENT_ROOM_KEY = 'roomId'
const PLAYER_ID_KEY = 'playerId'

export function generateRoomId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 6; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return id
}

export function getRoomsMap() {
  try {
    const raw = localStorage.getItem(ROOMS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveRoomsMap(map) {
  const safe = map && typeof map === 'object' ? map : {}
  localStorage.setItem(ROOMS_KEY, JSON.stringify(safe))
}

export function createRoom() {
  const rooms = getRoomsMap()
  let id = generateRoomId()
  while (rooms[id]) {
    id = generateRoomId()
  }
  rooms[id] = {
    createdAt: Date.now(),
    players: {}, // playerId -> { name, points }
    round: 1,
    currentQuestion: null,
    answers: {}, // round -> { [playerId]: answerIndex }
  }
  saveRoomsMap(rooms)
  setCurrentRoomId(id)
  return id
}

export function roomExists(id) {
  if (!id) return false
  const rooms = getRoomsMap()
  return Boolean(rooms[id] && typeof rooms[id] === 'object')
}

export function getCurrentRoomId() {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('room')
  if (fromUrl) return fromUrl
  return localStorage.getItem(CURRENT_ROOM_KEY) || ''
}

export function setCurrentRoomId(id) {
  if (!id) {
    localStorage.removeItem(CURRENT_ROOM_KEY)
    updateUrlParams({ room: null })
    return
  }
  localStorage.setItem(CURRENT_ROOM_KEY, id)
  updateUrlParams({ room: id })
}

export function updateUrlParams({ room, role }) {
  const url = new URL(window.location.href)
  const params = url.searchParams
  if (room === null) params.delete('room')
  else if (typeof room === 'string') params.set('room', room)
  if (role === null) params.delete('role')
  else if (typeof role === 'string') params.set('role', role)
  window.history.replaceState({}, '', `${url.pathname}?${params.toString()}`)
}

// Room state helpers
export function getRoom(roomId) {
  const rooms = getRoomsMap()
  const value = rooms[roomId]
  if (!value || typeof value !== 'object') return null
  const room = value
  if (!room) return null
  // Normalize missing properties for legacy rooms
  let changed = false
  if (!room.players) { room.players = {}; changed = true }
  if (!room.answers) { room.answers = {}; changed = true }
  if (!room.round) { room.round = 1; changed = true }
  if (!('currentQuestion' in room)) { room.currentQuestion = null; changed = true }
  if (changed) {
    rooms[roomId] = room
    saveRoomsMap(rooms)
  }
  return room
}

export function saveRoom(roomId, nextRoom) {
  const rooms = getRoomsMap()
  rooms[roomId] = nextRoom
  saveRoomsMap(rooms)
}

export function getOrCreatePlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

export function upsertPlayer(roomId, playerId, name) {
  const room = getRoom(roomId)
  if (!room) return
  room.players = room.players || {}
  if (!room.players[playerId]) {
    room.players[playerId] = { name: name || 'Speler', points: 0 }
  } else if (typeof name === 'string' && name.trim()) {
    room.players[playerId].name = name.trim()
  }
  saveRoom(roomId, room)
}

export function removePlayer(roomId, playerId) {
  const room = getRoom(roomId)
  if (!room) return
  delete room.players[playerId]
  saveRoom(roomId, room)
}

export function setRoomQuestion(roomId, question) {
  const room = getRoom(roomId)
  if (!room) return
  room.currentQuestion = question || null
  saveRoom(roomId, room)
}

export function startNewRound(roomId) {
  const room = getRoom(roomId)
  if (!room) return
  room.round = (room.round || 1) + 1
  room.currentQuestion = null
  saveRoom(roomId, room)
}

export function submitAnswer(roomId, playerId, answerIndex) {
  const room = getRoom(roomId)
  if (!room || !room.currentQuestion) return { accepted: false }
  const roundKey = String(room.round)
  room.answers = room.answers || {}
  if (!room.answers[roundKey]) room.answers[roundKey] = {}
  if (room.answers[roundKey][playerId] !== undefined) {
    return { accepted: false } // already answered
  }
  room.answers[roundKey][playerId] = answerIndex
  // Award simple points if correct
  if (room.currentQuestion && room.currentQuestion.answerIndex === answerIndex) {
    if (!room.players[playerId]) {
      room.players[playerId] = { name: 'Speler', points: 0 }
    }
    room.players[playerId].points = (room.players[playerId].points || 0) + 10
  }
  saveRoom(roomId, room)
  return { accepted: true }
}

export function hasAnswered(roomId, playerId) {
  const room = getRoom(roomId)
  if (!room) return false
  const roundKey = String(room.round)
  return Boolean(
    room.answers &&
    room.answers[roundKey] &&
    room.answers[roundKey][playerId] !== undefined
  )
}


