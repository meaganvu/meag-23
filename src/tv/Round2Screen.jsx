import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import AssignPlayerRound2 from "./AssignPlayerRound2";

const Round2Screen = ({ onNavigate }) => {
  const [players, setPlayers] = useState([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);

  // 🔄 Fetch all players from Firestore when the screen loads
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const playerList = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().Name || 'Unknown'
          }))
          .filter(player => player.id !== '07032003'); // Exclude host from grid

        setPlayers(playerList);
      } catch (error) {
        console.error("Error fetching players for grid:", error);
      }
    };

    fetchPlayers();
  }, []);

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
        <h1>NEXT ROUND</h1>
        <h1>Round 2</h1>
        <div style={{ maxWidth: '800px', margin: '0 auto 20px auto', color: '#bbb', textAlign: 'left', lineHeight: '1.6' }}>
          <h2>Everyone still gets assigned 1 target at random where they suppose to spike they’re drink</h2>
          <h2>BUT now everyone gets a partner</h2>
          <h2>Your partner will help look after your cup as well as their own</h2>
          <h2>If your partner catches someone spiking your drink then the assassins partner has to drink </h2>
          <h2>If you catch your assassin then your assassin has to drink</h2>
          <h2>Your targets will never be your partner, but targets are not based on partners, they are still at random</h2>
          <h2>If someone accuses another person of spiking them and they’re wrong: Accuser drinks half a shooter.</h2>
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
            
            // 🖼️ Dynamically switch filename string based on elimination flag status
            const imageFileName = isEliminated 
              ? `${player.id}-eliminated.jpeg` 
              : `${player.id}.jpeg`;

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
                  src={`../images/${imageFileName}`} // Pointing to your local src/images directory
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

        <AssignPlayerRound2 />
        
        <button onClick={onNavigate} className="next-btn" style={{ marginTop: '20px' }}>
          Go to opening
        </button>
      </div>
    </>
  );
};

export default Round2Screen;