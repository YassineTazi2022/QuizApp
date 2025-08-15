const ROOMS_KEY = 'rooms'
const CURRENT_ROOM_KEY = 'roomId'

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
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveRoomsMap(map) {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(map))
}

export function createRoom() {
  const rooms = getRoomsMap()
  let id = generateRoomId()
  while (rooms[id]) {
    id = generateRoomId()
  }
  rooms[id] = { createdAt: Date.now() }
  saveRoomsMap(rooms)
  setCurrentRoomId(id)
  return id
}

export function roomExists(id) {
  if (!id) return false
  const rooms = getRoomsMap()
  return Boolean(rooms[id])
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


