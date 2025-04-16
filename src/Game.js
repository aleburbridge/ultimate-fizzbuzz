import React, { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { getPlayerInfoById, updateRoomField, getPlayerDataOfPlayerWhoseTurnItIs } from './utils'
import NewRuleForm from './NewRuleForm'

function Game() {
  const [turnNumber, setTurnNumber] = useState(1)
  const [roundNumber, setRoundNumber] = useState(1)
  const [roomId, setRoomId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [playerAnswers, setPlayerAnswers] = useState([]) 
  const [playerSubmittedRules, setPlayerSubmittedRules] = useState([]) 
  const [currentPlayerId, setCurrentPlayerId] = useState(null)
  const [currentPlayerName, setCurrentPlayerName] = useState('')
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [isRuleWritingPhase, setIsRuleWritingPhase] = useState(null)

  useEffect(() => {
    const playerId = localStorage.getItem('playerId')
    if (!playerId) return

    getPlayerInfoById(playerId).then((playerInfo) => {
      if (playerInfo?.roomId) {
        setRoomId(playerInfo.roomId)
        setCurrentPlayerId(playerId)  
      }
    })
  }, [])

  useEffect(() => {
    if (!roomId) return

    // Subscribe to room updates
    const roomRef = doc(db, 'rooms', roomId)
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data()
      if (data?.turn) {
        setTurnNumber(data.turn)
      }
      if (data?.round) {
        setRoundNumber(data.round)
      }
      if (data?.playerSubmittedRules) {
        setPlayerSubmittedRules(data.playerSubmittedRules)
      }
      const turnsThisRound = 7 + 3 * (data?.round - 1)
      setIsRuleWritingPhase(data?.turn > turnsThisRound)
    })

    // Subscribe to answers array updates
    const unsubscribeAnswers = onSnapshot(roomRef, (snapshot) => {
        const data = snapshot.data()
        if (data?.playerSubmittedAnswersForCurrentRound) {
        setPlayerAnswers(data.playerSubmittedAnswersForCurrentRound)
        }
    })

    return () => {
        unsubscribeRoom()
        unsubscribeAnswers()
    }
    }, [roomId])

    useEffect(() => {
        if (!roomId || !currentPlayerId || isRuleWritingPhase === null) return
      
        const mode = isRuleWritingPhase ? 'round' : 'turn'
      
        getPlayerDataOfPlayerWhoseTurnItIs(roomId, mode).then((playerData) => {
            console.log("the id of the player whose turn it is is ", playerData.id)
            console.log("your id is ", localStorage.getItem("playerId"))
          if (playerData?.id === currentPlayerId) {
            setIsPlayerTurn(true)
            setCurrentPlayerName('')
          } else {
            setIsPlayerTurn(false)
            setCurrentPlayerName(playerData?.name)
          }
        })
      }, [roomId, currentPlayerId, turnNumber, roundNumber, isRuleWritingPhase])
      

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '' && roomId) {
        // changing turn before order causes answers to not get submitted sometimes
        await updateRoomField(roomId, 'playerSubmittedAnswersForCurrentRound', inputValue.trim(), 'append')
        await updateRoomField(roomId, 'turn', 1, 'increment')
        setInputValue('')
        
    }
  }

  return (
    <>
    <div className="rules-box">
        <h2>Rules</h2>
        <ul style={{ textAlign: 'left' }}>
            <li>Every multiple of 3 is "fizz"</li>
            <li>Every multiple of 5 is "buzz"</li>
            <li>Every multiple of 3 AND 5 is "fizzbuzz"</li>
            {playerSubmittedRules.map((rule, idx) => (
            <li key={idx}>{rule}</li>
            ))}
        </ul>
    </div>

      <div>
        <p>Round {roundNumber}</p>
        <div style={{ minHeight: '2em' }}>
            <p><strong>{playerAnswers.join(' ')} </strong></p>
        </div>
      </div>

      {isRuleWritingPhase === null ? (
        <p>Loading...</p>
        ) : isRuleWritingPhase ? (
            isPlayerTurn ? <NewRuleForm roomId={roomId} isPlayerTurn={isPlayerTurn} /> : <p><i>{currentPlayerName} is writing a new rule</i></p>
        ) : (
        <div className="input-container">
            <span>{turnNumber}: </span>
            <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isPlayerTurn}
            />
            {isPlayerTurn ? null : <p>It's {currentPlayerName}'s turn</p>}
        </div>
        
        )
        }
      
    </>
  )
}

export default Game
