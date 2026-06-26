import React, { useState, useEffect } from 'react';
import songData from './songs.json';
// Import Firestore hooks for real-time tracking and updates
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

function TVTriviaGame({ onNavigate }) {
  const categories = Object.keys(songData);
  
  // Gameplay States
  const [currentCategory, setCurrentCategory] = useState(categories[0]);
  const [songIndex, setSongIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showGuesses, setShowGuesses] = useState(false); // Controls when guesses are visible
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

  // Helper function to clear guesses from Firestore so teams start fresh
  const clearAllTeamGuesses = async () => {
    try {
      const updatePromises = teams.map((team) => {
        const teamDocRef = doc(db, 'teams', team.id);
        return updateDoc(teamDocRef, {
          songGuess: '',
          artistGuess: ''
        });
      });
      await Promise.all(updatePromises);
      console.log("All team guesses cleared from Firestore.");
    } catch (error) {
      console.error("Error clearing team guesses:", error);
    }
  };

  const handleRestart = () => {
    clearAllTeamGuesses();
    setCurrentCategory(categories[0]);
    setSongIndex(0);
    setShowAnswer(false);
    setShowGuesses(false);
    setIsGameOver(false);
  };

  const handleNext = () => {
    clearAllTeamGuesses(); // Clear previous guesses before moving forward
    
    if (songIndex < currentCategorySongs.length - 1) {
      setSongIndex(songIndex + 1);
      setShowAnswer(false);
      setShowGuesses(false);
    } else {
      const currentCatIndex = categories.indexOf(currentCategory);
      if (currentCatIndex < categories.length - 1) {
        setCurrentCategory(categories[currentCatIndex + 1]);
        setSongIndex(0);
        setShowAnswer(false);
        setShowGuesses(false);
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
              <button onClick={onNavigate} style={buttonStyle('#6c757d')}>Main Menu</button>
            </div>
          </div>
        ) : (
          <div>
            <h2>Category: <span style={{ color: '#007bff' }}>{currentCategory}</span></h2>
            <p>Song {songIndex + 1} of {currentCategorySongs.length}</p>
            <hr style={{ width: '30%', margin: '20px auto' }} />

            {/* CONDITIONAL MAIN DISPLAY MODES */}
            <div style={{ margin: '40px 0', minHeight: '180px' }}>
              
              {/* MODE 1: BASE GUESSING SCREEN */}
              {!showGuesses && (
                <h1 style={{ fontSize: '3rem', color: '#555' }}>🎵 Guess the Song! 🎵</h1>
              )}

              {/* MODE 2: COMBINED GUESSES & REVEAL SCREEN */}
              {showGuesses && (
                <div>
                  {/* 🟢 NEW: Renders the True Answer above the guesses if flipped on */}
                  {showAnswer && (
                    <div style={{
                      backgroundColor: '#d4edda',
                      border: '2px solid #c3e6cb',
                      color: '#155724',
                      borderRadius: '8px',
                      padding: '20px',
                      maxWidth: '600px',
                      margin: '0 auto 30px auto',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                    }}>
                      <h3 style={{ margin: '0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem' }}>Correct Answer</h3>
                      <h1 style={{ fontSize: '2.8rem', margin: '5px 0' }}>"{currentSong?.title}"</h1>
                      <h3 style={{ margin: '0', opacity: 0.8, fontSize: '1.5rem' }}>by {currentSong?.artist}</h3>
                    </div>
                  )}

                  <h2 style={{ color: '#ffc107', marginBottom: '25px' }}>👀 What the Teams Guessed:</h2>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}>
                    {teams.map((team) => (
                      <div key={team.id} style={{
                        padding: '15px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        backgroundColor: '#f1f1f1',
                        minWidth: '200px'
                      }}>
                        <strong style={{ fontSize: '1.2rem', color: '#333' }}>{team.name || team.id}</strong>
                        <div style={{ marginTop: '10px', fontSize: '0.95rem', color: '#555' }}>
                          <div><b>Song:</b> {team.songGuess || <span style={{color: '#999', fontStyle: 'italic'}}>No guess</span>}</div>
                          <div><b>Artist:</b> {team.artistGuess || <span style={{color: '#999', fontStyle: 'italic'}}>No guess</span>}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CONTROL NAVIGATION BUTTONS */}
            <div style={{ gap: '15px', display: 'flex', justifyContent: 'center' }}>
              {!showGuesses && (
                <button onClick={() => setShowGuesses(true)} style={buttonStyle('#ffc107', '#333')}>
                  Show Team Guesses 👀
                </button>
              )}

              {showGuesses && !showAnswer && (
                <button onClick={() => setShowAnswer(true)} style={buttonStyle('#e0e0e0', '#333')}>
                  Reveal True Answer 👑
                </button>
              )}

              {showAnswer && (
                <button onClick={handleNext} style={buttonStyle('#28a745')}>
                  Next Song ➡️
                </button>
              )}

              <button onClick={handleRestart} style={buttonStyle('#dc3545')}>Restart</button>
              <button onClick={onNavigate} style={buttonStyle('#6c757d')}>Exit to Menu 🏠</button>
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
  cursor: 'pointer',
  fontWeight: 'bold'
});

export default TVTriviaGame;