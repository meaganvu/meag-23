import React, { useState, useEffect } from 'react';
import songData from './songs.json';
// Import Firestore hooks for real-time tracking
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

function TVTriviaGame({ onNavigate }) {
  const categories = Object.keys(songData);
  
  // Gameplay States
  const [currentCategory, setCurrentCategory] = useState(categories[0]);
  const [songIndex, setSongIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Team Scores State
  const [teams, setTeams] = useState([]);

  // --- Real-time Firebase Score Listener ---
  useEffect(() => {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, orderBy('points', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);
    }, (error) => {
      console.error("Error listening to team scores:", error);
    });

    return () => unsubscribe();
  }, []);

  const currentCategorySongs = songData[currentCategory];
  const currentSong = currentCategorySongs ? currentCategorySongs[songIndex] : null;

  const handleRestart = () => {
    setCurrentCategory(categories[0]);
    setSongIndex(0);
    setShowAnswer(false);
    setIsGameOver(false);
  };

  const handleNext = () => {
    if (songIndex < currentCategorySongs.length - 1) {
      setSongIndex(songIndex + 1);
      setShowAnswer(false);
    } else {
      const currentCatIndex = categories.indexOf(currentCategory);
      if (currentCatIndex < categories.length - 1) {
        setCurrentCategory(categories[currentCatIndex + 1]);
        setSongIndex(0);
        setShowAnswer(false);
      } else {
        setIsGameOver(true);
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '90vh', 
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      
      {/* MAIN GAME AREA */}
      <div style={{ flex: 1, textAlign: 'center', marginTop: '20px' }}>
        {isGameOver ? (
          <div>
            <h1 style={{ fontSize: '3rem', color: '#28a745' }}>🎉 Trivia Complete! 🎉</h1>
            <div style={{ gap: '15px', display: 'flex', justifyContent: 'center' }}>
              <button onClick={handleRestart} style={buttonStyle('#007bff')}>Play Again</button>
              {/* Menu button on game over screen */}
              <button onClick={onNavigate} style={buttonStyle('#6c757d')}>Main Menu</button>
            </div>
          </div>
        ) : (
          <div>
            <h2>Category: <span style={{ color: '#007bff' }}>{currentCategory}</span></h2>
            <p>Song {songIndex + 1} of {currentCategorySongs.length}</p>
            <hr style={{ width: '30%', margin: '20px auto' }} />

            <div style={{ margin: '40px 0', minHeight: '120px' }}>
              {!showAnswer ? (
                <h1 style={{ fontSize: '3rem', color: '#555' }}>🎵 Guess the Song! 🎵</h1>
              ) : (
                <div>
                  <h1 style={{ fontSize: '2.5rem', margin: '10px 0' }}>"{currentSong?.title}"</h1>
                  <h3 style={{ color: '#666' }}>by {currentSong?.artist}</h3>
                </div>
              )}
            </div>

            <div style={{ gap: '15px', display: 'flex', justifyContent: 'center' }}>
              {!showAnswer ? (
                <button onClick={() => setShowAnswer(true)} style={buttonStyle('#e0e0e0', '#333')}>Reveal Answer</button>
              ) : (
                <button onClick={handleNext} style={buttonStyle('#28a745')}>Next Song</button>
              )}
              <button onClick={handleRestart} style={buttonStyle('#dc3545')}>Restart</button>
              
              {/* 🟢 NEW: Back to Main Menu Button */}
              <button onClick={onNavigate} style={buttonStyle('#6c757d')}>
                Exit to Menu 🏠
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SCOREBOARD FOOTER */}
      <div style={{
        borderTop: '2px solid #eee',
        paddingTop: '20px',
        marginTop: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        padding: '15px'
      }}>
        <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#444' }}>🏆 Leaderboard 🏆</h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {teams.length === 0 ? (
            <p style={{ color: '#999' }}>Waiting for teams to be added to Firebase...</p>
          ) : (
            teams.map((team, index) => (
              <div key={team.id} style={{
                padding: '15px 25px',
                backgroundColor: index === 0 ? '#fff3cd' : '#fff',
                border: index === 0 ? '2px solid #ffeba2' : '1px solid #ddd',
                borderRadius: '8px',
                minWidth: '150px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : '🥉 '}
                  {team.name || team.id}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff', marginTop: '5px' }}>
                  {team.points} pts
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

const buttonStyle = (bgColor, textColor = '#fff') => ({
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: bgColor,
  color: textColor,
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});

export default TVTriviaGame;