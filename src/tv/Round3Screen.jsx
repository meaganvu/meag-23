import { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // 🟢 Added storage import
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // 🟢 Added Firebase Storage methods
import AssignPlayerRound2 from "./AssignPlayerRound2";

const Round3Screen = ({ onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // 🟢 Store pre-fetched download URLs
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);

  // ⏱️ TIMER STATES (20 minutes = 1200 seconds)
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isRunning, setIsRunning] = useState(false);

  // 🔄 Fetch players and pre-fetch all images from Firebase Storage concurrently
  useEffect(() => {
    const fetchPlayersAndImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const playerList = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().Name || 'Unknown'
          }))
          .filter(player => player.id !== '07032003'); // Exclude host from grid

        setPlayers(playerList);

        // ⚡️ Map through players and prefetch both Alive and Eliminated URLs simultaneously
        const urlMap = {};
        await Promise.all(
          playerList.map(async (player) => {
            // 🟢 Smart Alive Photo Fetch (.jpeg with .jpg fallback)
            try {
              const aliveRef = ref(storage, `${player.id}.jpeg`);
              urlMap[player.id] = await getDownloadURL(aliveRef);
            } catch (err) {
              try {
                const fallbackRef = ref(storage, `${player.id}.jpg`);
                urlMap[player.id] = await getDownloadURL(fallbackRef);
              } catch (fallbackErr) {
                urlMap[player.id] = 'https://via.placeholder.com/150'; // Fallback
              }
            }

            // 🟢 Smart Eliminated Photo Fetch (.jpeg with .jpg fallback)
            try {
              const elimRef = ref(storage, `${player.id}-eliminated.jpeg`);
              urlMap[`${player.id}-eliminated`] = await getDownloadURL(elimRef);
            } catch (err) {
              try {
                const fallbackElimRef = ref(storage, `${player.id}-eliminated.jpg`);
                urlMap[`${player.id}-eliminated`] = await getDownloadURL(fallbackElimRef);
              } catch (fallbackErr) {
                urlMap[`${player.id}-eliminated`] = 'https://via.placeholder.com/150'; // Fallback
              }
            }
          })
        );
        setImageUrls(urlMap);

      } catch (error) {
        console.error("Error fetching players or cloud assets for grid:", error);
      }
    };

    fetchPlayersAndImages();
  }, []);

  // ⏱️ TIMER LOGIC ENGINE
  useEffect(() => {
    let intervalId = null;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft]);

  // 🛠️ HELPER: Format seconds into MM:SS display format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎯 Toggles a player's ID in or out of the eliminated list
  const toggleElimination = (playerId) => {
    if (eliminatedPlayers.includes(playerId)) {
      setEliminatedPlayers(eliminatedPlayers.filter(id => id !== playerId));
    } else {
      setEliminatedPlayers([...eliminatedPlayers, playerId]);
    }
  };

  return (
    <>
      <div className="Round2" style={{ padding: '20px', textAlign: 'center' }}>
        <h1>FINAL ROUND</h1>
        <h1>Round 3</h1>
        <div style={{ maxWidth: '800px', margin: '0 auto 20px auto', color: '#bbb', textAlign: 'left', lineHeight: '1.6' }}>
          <h2>FREE FOR ALL SPIKE EVERYONES DRINK</h2>
          <h2>BUT IF U GET CAUGHT BY THE PERSON WHOSE CUP UR POURING IT IN THEN UR OUT</h2>
          <h2>FUCK IT FIND RANDOM SHIT AND POUR SHIT IN IT</h2>
          <h2>If someone accuses another person of spiking them and they’re wrong: Accuser drinks half a shooter.</h2>
        </div>

        {/* ⏱️ VISUAL TIMER COMPONENT CONTROL BLOCK */}
        <div style={{
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '300px',
          margin: '20px auto',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <div style={{ 
            fontSize: '3rem', 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            color: timeLeft === 0 ? '#ff4d4d' : isRunning ? '#2ecc71' : '#fff',
            letterSpacing: '2px',
            marginBottom: '10px'
          }}>
            {formatTime(timeLeft)}
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              disabled={timeLeft === 0}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: timeLeft === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                background: isRunning ? '#e74c3c' : '#2ecc71',
                color: '#fff',
                transition: 'background 0.2s'
              }}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>

            <button 
              onClick={() => { setIsRunning(false); setTimeLeft(1200); }}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: '1px solid #555',
                cursor: 'pointer',
                fontWeight: 'bold',
                background: '#333',
                color: '#fff'
            }}
          >
            Reset
          </button>
        </div>
      </div>

        {/* 💻 THE PLAYER ELIMINATION DASHBOARD GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', // Enforces exactly 4 columns per row
          gap: '20px',
          maxWidth: '1000px',
          margin: '30px auto'
        }}>
          {players.map((player) => {
            const isEliminated = eliminatedPlayers.includes(player.id);
            
            // 🖼️ Select the correct lookup key depending on state
            const imageKey = isEliminated ? `${player.id}-eliminated` : player.id;
            const finalImageUrl = imageUrls[imageKey] || 'https://via.placeholder.com/100';

            return (
              <div 
                key={player.id}
                onClick={() => toggleElimination(player.id)}
                style={{
                  background: isEliminated ? '#2a1212' : '#222',
                  border: isEliminated ? '3px solid #ff4d4d' : '3px solid #444',
                  borderRadius: '12px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isEliminated ? 0.65 : 1
                }}
              >
                {/* ☁️ Cloud assets render effortlessly with zero pop-in delay on click */}
                <img 
                  src={finalImageUrl} 
                  alt={player.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: isEliminated ? '3px solid #ff4d4d' : '3px solid #fff',
                    display: 'block',
                    margin: '0 auto 10px auto'
                  }}
                />
                <h3 style={{ color: isEliminated ? '#ff4d4d' : '#fff', margin: '5px 0 0 0' }}>
                  {player.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: isEliminated ? '#ff4d4d' : '#888' }}>
                  {isEliminated ? '💀 ELIMINATED' : '🟢 ALIVE'}
                </span>
              </div>
            );
          })}
        </div>
        
        <button onClick={onNavigate} className="next-btn" style={{ marginTop: '20px' }}>
          Go to opening
        </button>
      </div>
    </>
  );
};

export default Round3Screen;