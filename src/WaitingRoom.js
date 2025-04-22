import React, { useEffect, useState } from 'react';
import { getPlayerInfoById } from './utils';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'


function WaitingRoom() {
    const [playerInfo, setPlayerInfo] = useState(null);
    const [playersInRoom, setPlayersInRoom] = useState([])
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { roomId } = useParams();
    const navigate = useNavigate();

    const joinUrl = `${window.location.origin}/join-room/${roomId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(joinUrl);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    useEffect(() => {
        // Validate roomId format
        if (!roomId || !/^[A-Z]{4}$/.test(roomId)) {
            setError('Invalid room ID. Room ID must be a 4-letter uppercase string.');
            setIsLoading(false);
            return;
        }

        const fetchPlayer = async () => {
            try {
                const playerId = localStorage.getItem('playerId');
                console.log('PLAYERID IS ', playerId)
                if (playerId) {
                    const data = await getPlayerInfoById(playerId);
                      setPlayerInfo(data);
                    }
             // TODO: redirect player if not Player ID, for some reason all players are being redirected to /join-room/ when playerId fails
                  
            } catch (error) {
                console.error('Error fetching player:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlayer();

        const roomRef = doc(db, 'rooms', roomId)
        const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
        const data = snapshot.data()
        if (data?.gameStarted) {
            navigate(`/game/${roomId}`)
        }
        })


        const unsubscribePlayers = onSnapshot(
            query(collection(db, 'players'), where('roomId', '==', roomId)),
            (snapshot) => {
                const players = snapshot.docs.map(doc => doc.data())
                setPlayersInRoom(players)
            }
        )
        
        return () => {
            unsubscribePlayers()
            unsubscribeRoom()
        }
    }, [roomId, navigate]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async () => {
        const roomRef = doc(db, 'rooms', roomId)
        await updateDoc(roomRef, { gameStarted: true })
      };


    return (
        <div>
            <h2><i>Waiting Room {roomId}</i></h2>
            <div>
                <p style={{cursor: "pointer"}} onClick={copyToClipboard}><u>📋 Copy Invite link</u></p>
            </div>
    
            <div>
                <ul style={{padding: "0"}}>
                    {playersInRoom.map((player, index) => (
                    <li style={{listStyle: "none"}} key={index}>{player.name}</li>
                    ))}
                </ul>
            </div>

            <button className="create-room-button" onClick={handleSubmit}>Start Game</button>
        </div>
    );
}

export default WaitingRoom;