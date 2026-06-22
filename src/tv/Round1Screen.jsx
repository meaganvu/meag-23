import { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // 🌟 Import storage instance
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // 🌟 Import storage utilities
import AssignPlayerRound1 from "./AssignPlayerRound1";

const Round1Screen = ({ onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // 🌟 Cache storage links by key string

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
              // Fallback placeholder string if an individual image upload is missing
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

  // 🎯 Toggles a player's ID and fetches their eliminated photo link if missing
  const toggleElimination = async (playerId) => {
    const isCurrentlyEliminated = eliminatedPlayers.includes(playerId);

    if (isCurrentlyEliminated) {
      // Return to Alive: Remove from list
      setEliminatedPlayers(eliminatedPlayers.filter(id => id !== playerId));
    } else {
      // Progress to Eliminated: Add to list
      setEliminatedPlayers([...eliminatedPlayers, playerId]);

      // Cache the "-eliminated.jpeg" cloud URL if we haven't grabbed it yet
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
      <p style={{ maxWidth: '800px', margin: '0 auto 20px auto', color: '#bbb' }}>
        Everyone gets assigned 1 person at random. Try to empty your shot without getting caught! 
        Wrong accusations = half a shooter penalties.
      </p>

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
          
          // 🖼️ Look up the dynamic URL pointer string cached from Firebase Storage
          const currentImageUrl = isEliminated 
            ? imageUrls[`${player.id}-eliminated`] || imageUrls[player.id] // Fallback to normal photo if eliminated variant fails loading
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
                src={currentImageUrl || 'https://via.placeholder.com/150'} // Renders direct HTTPS link from cloud bucket
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