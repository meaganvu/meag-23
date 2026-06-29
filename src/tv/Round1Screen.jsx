import { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // 🌟 Import storage instance
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // 🌟 Import storage utilities
import AssignPlayerRound1 from "./AssignPlayerRound1";
import "./styles/RoundScreenGeneral.css";

import roundScreenBackground from "../assets/tv/roundScreenBackground.png";
import glassBottle1 from "../assets/tv/glassBottle1.png";
import glassBottle2 from "../assets/tv/glassBottle2.png";

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
    <div className="Round1Container">
      <img
        src={roundScreenBackground}
        className="round-screen-background"
        alt="round-screen-background"
      />
      <div className="round-screen-content">
        <h1 className='atomic-age-regular round-title'>
        <img
          src={glassBottle1}
          className="glass-bottle1"
          alt="glass-bottle1"
        />
        ROUND 1
        <img
          src={glassBottle2}
          className="glass-bottle2"
          alt="glass-bottle2"
        />
      </h1>
      <div className="round-main-content">
        <div className="round-instructions-timer-container">
          <div className="round-instructions">
              <h2>Everyone gets assigned 1 target at random where they suppose to spike they’re drink<br/>
              If your target catches you then you have to drink<br/>
              Your drink will stay in one place in the living room and assassins need to empty their flasks without getting a shot<br/>
              If someone accuses another person of spiking them and they’re wrong: Accuser drinks half a shooter.</h2>
          </div>
          {/* ⏱️ VISUAL TIMER COMPONENT CONTROL BLOCK */}
          <div className="round-timer-card">
            <div
              className={`round-timer-display ${
                timeLeft === 0 ? 'timer-ended' : isRunning ? 'timer-running' : ''
              }`}
            >
              {formatTime(timeLeft)}
            </div>
            
            <div className="round-timer-actions">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                disabled={timeLeft === 0}
                className={`round-timer-btn ${isRunning ? 'pause' : 'start'}`}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>

              <button 
                onClick={() => { setIsRunning(false); setTimeLeft(1200); }}
                className="round-timer-btn reset"
              >
                Reset
              </button>
            </div>
          </div>
        </div>


      {/* 💻 THE PLAYER ELIMINATION DASHBOARD GRID */}
      <div className="elimination-dashboard">
        {players.map((player) => {
          const isEliminated = eliminatedPlayers.includes(player.id);
          const currentImageUrl = isEliminated 
            ? imageUrls[`${player.id}-eliminated`] || imageUrls[player.id]
            : imageUrls[player.id];

          return (
            <div 
              key={player.id}
              onClick={() => toggleElimination(player.id)}
              className={`player-elimination-card ${isEliminated ? 'eliminated' : ''}`}
            >
              <img 
                src={currentImageUrl || 'https://via.placeholder.com/150'}
                alt={player.name}
                className="player-elimination-photo"
              />
              <h3>
                {player.name}
              </h3>
              <span>
                {isEliminated ? 'ELIMINATED' : 'ALIVE'}
              </span>
            </div>
          );
        })}
      </div>
      </div>
      
      <AssignPlayerRound1 />

      <button onClick={onNavigate} className="next-btn">
        Go to Round 2
      </button>
      </div>
    </div>
  );
};

export default Round1Screen;
