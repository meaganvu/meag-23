import { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // 🟢 Added storage import
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // 🟢 Added Firebase Storage methods
import "./styles/RoundScreenGeneral.css";

import roundScreenBackground from "../assets/tv/roundScreenBackground.png";
import glassBottle1 from "../assets/tv/glassBottle1.png";
import glassBottle2 from "../assets/tv/glassBottle2.png";

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
    <div className="Round1Container">
      <img
        src={roundScreenBackground}
        className="round-screen-background"
        alt="round-screen-background"
      />
      <div className="round-screen-content">
        <h1 className="atomic-age-regular round-title">
          <img
            src={glassBottle1}
            className="glass-bottle1"
            alt="glass-bottle1"
          />
          ROUND 3
          <img
            src={glassBottle2}
            className="glass-bottle2"
            alt="glass-bottle2"
          />
        </h1>
        <div className="round-main-content">
          <div className="round-instructions-timer-container">
            <div className="round-instructions anonymous-pro-regular">
              <h2>FREE FOR ALL SPIKE EVERYONES DRINK<br/>
              BUT IF U GET CAUGHT BY THE PERSON WHOSE CUP UR POURING IT IN THEN UR OUT<br/>
              FUCK IT FIND RANDOM SHIT AND POUR SHIT IN IT<br/>
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
            
            // 🖼️ Select the correct lookup key depending on state
            const imageKey = isEliminated ? `${player.id}-eliminated` : player.id;
            const finalImageUrl = imageUrls[imageKey] || 'https://via.placeholder.com/100';

            return (
              <div 
                key={player.id}
                onClick={() => toggleElimination(player.id)}
                className={`player-elimination-card ${isEliminated ? 'eliminated' : ''}`}
              >
                {/* ☁️ Cloud assets render effortlessly with zero pop-in delay on click */}
                <img 
                  src={finalImageUrl} 
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
        
        <button onClick={onNavigate} className="next-btn">
          Go to opening
        </button>
      </div>
    </div>
  );
};

export default Round3Screen;
