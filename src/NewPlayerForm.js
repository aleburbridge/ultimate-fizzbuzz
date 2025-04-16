import React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateRoomId, savePlayer, createRoom } from './utils';

function NewPlayerForm({ isJoining = false }) {
  console.log("ISJOINING IS", isJoining)
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const { roomId } = useParams();

    const handleNameChange = (e) => {
      setName(e.target.value);
    };
  
    const handleSubmit = () => {
      if (isJoining && !roomId) {
        console.error('Room ID is required when joining a room')
        return
      }
    
      if (isJoining) {
        savePlayer(name, roomId)
        navigate(`/waiting-room/${roomId}`)
      } else {
        const newRoomId = generateRoomId()
        createRoom(newRoomId)
        savePlayer(name, newRoomId)
        navigate(`/waiting-room/${newRoomId}`)
      }
    }
    

    return (
        <div className="input-container">
            {isJoining && <h2><i>Joining Room {roomId}</i></h2>}
            <input type="text" placeholder="name" className="name-input" value={name} onChange={handleNameChange}/>
            <button type="button" className="create-room-button" onClick={handleSubmit}>{isJoining ? 'Join Room' : 'Create Room'}</button>
        </div>
    )
}

export default NewPlayerForm;