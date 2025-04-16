import React, { useState } from 'react'
import { handleNewRound, updateRoomField } from './utils'

function NewRuleForm({ roomId, isPlayerTurn }) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '' && roomId) {
      await updateRoomField(roomId, 'playerSubmittedRules', inputValue.trim(), 'append')
      await handleNewRound(roomId)
      setInputValue('')
    }
  }

  return (
    <div className="input-container">
      <p><i>Write a new rule</i></p>
      <input 
        type="text" 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!isPlayerTurn}
      />
    </div>
  )
}

export default NewRuleForm
