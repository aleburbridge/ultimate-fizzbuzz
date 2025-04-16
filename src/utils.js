import { db } from './firebase'
import { collection, addDoc, setDoc, getDoc, doc, query, where, getDocs, orderBy, updateDoc, increment, arrayUnion } from 'firebase/firestore'

export function generateRoomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

export async function createRoom(roomId) {
  const roomRef = doc(db, 'rooms', roomId)

  const newRoom = {
    roomId: roomId,
    gameStarted: false,
    round: 1,
    turn: 1,
    playerSubmittedAnswersForCurrentRound: [],
    playerSubmittedRules: []
  }

  await setDoc(roomRef, newRoom)
  console.log('New room created with ID:', roomId)
}

export async function savePlayer(name, roomId) {
  const playersRef = collection(db, 'players')

  const newPlayer = {
    name: name,
    roomId: roomId,
    score: 0,
    skips: 1,
    mistakes: 0,
    createdAt: new Date() // this determines turn order
  }

  const docRef = await addDoc(playersRef, newPlayer)
  console.log('Player saved with ID:', docRef.id)
  localStorage.setItem('playerId', docRef.id)
}

export async function getPlayerInfoById(playerId) {
  const playerRef = doc(db, 'players', playerId)
  const playerDoc = await getDoc(playerRef)
  
  if (playerDoc.exists()) {
    return playerDoc.data()
  } else {
    throw new Error('Player not found')
  }
}

export async function getRoomInfoById(roomId) {
  const roomRef = doc(db, 'rooms', roomId)
  const roomDoc = await getDoc(roomRef)
  
  if (roomDoc.exists()) {
    return roomDoc.data()
  } else {
    throw new Error('Room not found')
  }
}

export async function getAllPlayersInRoom(roomId) {
  const playersQuery = query(
    collection(db, 'players'),
    where('roomId', '==', roomId),
    orderBy('createdAt')
  )

  const querySnapshot = await getDocs(playersQuery)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}


export async function getPlayerDataOfPlayerWhoseTurnItIs(roomId, mode = 'turn') {
  const roomData = await getRoomInfoById(roomId)
  const orderedPlayers = await getAllPlayersInRoom(roomId)

  if (orderedPlayers.length === 0) {
    throw new Error('No players found in this room')
  }

  if (mode === 'turn') {
    const index = (roomData.turn - 1) % orderedPlayers.length
    const player = orderedPlayers[index]
    return { id: player.id, name: player.name }
  }

  if (mode === 'round') {
    const sortedByJoinTime = [...orderedPlayers].sort((a, b) => a.createdAt - b.createdAt)
    const index = (roomData.round - 1) % sortedByJoinTime.length
    const player = sortedByJoinTime[index]
    return { id: player.id, name: player.name }
  }

  throw new Error('Invalid mode passed to getPlayerDataOfPlayerWhoseTurnItIs')
}


export async function updateRoomField(roomId, field, value, mode = 'set') {
  const roomRef = doc(db, 'rooms', roomId)

  if (mode === 'append') {
    const roomSnap = await getDoc(roomRef)
    const currentArray = roomSnap.data()?.[field] || []
    const updatedArray = [...currentArray, value]
    await updateDoc(roomRef, { [field]: updatedArray })
    return
  }

  const updateData = 
    mode === 'increment' ? { [field]: increment(value) } :
    { [field]: value }

  await updateDoc(roomRef, updateData)
}


export async function handleNewRound(roomId) {
  await updateRoomField(roomId, 'round', 1, 'increment')
  await updateRoomField(roomId, 'turn', 1)
  await updateRoomField(roomId, 'playerSubmittedAnswersForCurrentRound', [])
}