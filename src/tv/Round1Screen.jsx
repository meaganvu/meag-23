import { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // 🌟 Import storage instance
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // 🌟 Import storage utilities
import AssignPlayerRound1 from "./AssignPlayerRound1";

const Round1Screen = ({ onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // 🌟 Cache storage links by key string

  // ⏱️ TIMER STATES (20 minutes = 1200 seconds)
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isRunning, setIsRunning] = useState(false);

  // 🔄 Fetch players and their initial Firebase Storage URLs on load
  useEffect(() => {
    const fetchPlayersAndImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const playerList = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().Name || 'Unknown'
          }))
          .filter(player => player.id !== '07032003'); // Exclude host

        setPlayers(playerList);

        // 🖼️ Prefetch standard "alive" URLs from your Firebase Storage avatars folder
        const urlMap = {};
        await Promise.all(
          playerList.map(async (player) => {
            try {
              const storageRef = ref(storage, `${player.id}.jpeg`);
              const url = await getDownloadURL(storageRef);
              urlMap[player.id] = url;
            } catch (err) {
              console.error(`Error fetching alive photo for ${player.id}:`, err);
              urlMap[player.id] = 'https://via.placeholder.com/150';
            }
          })
        );
        setImageUrls(urlMap);

      } catch (error) {
        console.error("Error setting up dashboard data:", error);
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

    // Cleanup interval thread on state changes or unmounting
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

  // 🎯 Toggles a player's ID and fetches their eliminated photo link if missing
  const toggleElimination = async (playerId) => {
    const isCurrentlyEliminated = eliminatedPlayers.includes(playerId);

    if (isCurrentlyEliminated) {
      setEliminatedPlayers(eliminatedPlayers.filter(id => id !== playerId));
    } else {
      setEliminatedPlayers([...eliminatedPlayers, playerId]);

      const eliminatedKey = `${playerId}-eliminated`;
      if (!imageUrls[eliminatedKey]) {
        try {
          const storageRef = ref(storage, `${playerId}-eliminated.jpeg`);
          const url = await getDownloadURL(storageRef);
          setImageUrls(prev => ({ ...prev, [eliminatedKey]: url }));
        } catch (err) {
          console.error(`Error fetching eliminated image for ${playerId}:`, err);
        }
      }
    }
  };

  return (
    <div className="Round1" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Round 1</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto 20px auto', color: '#bbb', textAlign: 'left', lineHeight: '1.6' }}>
          <h2>Everyone gets assigned 1 target at random where they suppose to spike they’re drink</h2>
          <h2>If your target catches you then you have to drink</h2>
          <h2>Your drink will stay in one place in the living room and assassins need to empty their flasks without getting a shot</h2>
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
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        maxWidth: '1000px',
        margin: '30px auto'
      }}>
        {players.map((player) => {
          const isEliminated = eliminatedPlayers.includes(player.id);
          const currentImageUrl = isEliminated 
            ? imageUrls[`${player.id}-eliminated`] || imageUrls[player.id]
            : imageUrls[player.id];

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
              <img 
                src={currentImageUrl || 'https://via.placeholder.com/150'}
                alt={player.name}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isEliminated ? '3px solid #ff4d4d' : '3px solid #fff',
                  display: 'block',
                  margin: '0 auto 10px auto',
                  backgroundColor: '#333'
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
      
      <AssignPlayerRound1 />

      <button onClick={onNavigate} className="next-btn" style={{ marginTop: '20px' }}>
        Go to Round 2
      </button>
    </div>
  );
};

export default Round1Screen;