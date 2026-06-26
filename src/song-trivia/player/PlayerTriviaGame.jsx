import React, { useState, useEffect } from 'react';
// Import Firestore hooks for real-time tracking and adding records
import { db } from '../../firebase';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

function PlayerTriviaGame({ user }) {
  const [teamPoints, setTeamPoints] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(true);

  // 🟢 State variables for Captain inputs
  const [songGuess, setSongGuess] = useState('');
  const [artistGuess, setArtistGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔒 Track if an answer has already been submitted for this round
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // --- Real-time Firebase Score & Guess Listener for Player's Team ---
  useEffect(() => {
    if (!user?.team) {
      setLoadingPoints(false);
      return;
    }

    const teamDocRef = doc(db, 'teams', user.team);

    const unsubscribe = onSnapshot(teamDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeamPoints(data.points !== undefined ? data.points : 0);
        
        // 🔒 If either guess field has data in Firestore, lock the form
        if (data.songGuess || data.artistGuess) {
          setHasSubmitted(true);
        } else {
          // 🔓 Automatically unlocks when Host clears guesses on "Next Song"
          setHasSubmitted(false);
        }
      } else {
        console.warn(`Team document '${user.team}' not found in Firestore.`);
        setTeamPoints(0);
        setHasSubmitted(false);
      }
      setLoadingPoints(false);
    }, (error) => {
      console.error("Error listening to team points:", error);
      setLoadingPoints(false);
    });

    return () => unsubscribe();
  }, [user?.team]);

  // 🟢 Handle Answer Submission for Captains
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!songGuess.trim() && !artistGuess.trim()) {
      alert("Please fill out at least one field before submitting!");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // 🟢 Targets teams/{user.team} directly
      const teamDocRef = doc(db, 'teams', user.team);
  
      // 🟢 setDoc with { merge: true } safely appends the fields without clearing points!
      await setDoc(teamDocRef, {
        songGuess: songGuess.trim(),
        artistGuess: artistGuess.trim(),
        guessTimestamp: serverTimestamp() 
      }, { merge: true });
  
      // Clear the local text boxes on successful submission
      setSongGuess('');
      setArtistGuess('');
    } catch (error) {
      console.error("Error updating team guess:", error);
      alert("Failed to submit guess. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="player-container" style={{
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Welcome, {user.name}!</h1>
      <h2>This is the trivia game screen 🎵</h2>
      
      <hr style={{ width: '50%', margin: '20px auto', borderColor: '#eee' }} />

      {user.team ? (
        <div>
          {/* TEAM SCORE CARD */}
          <div style={{
            margin: '20px auto',
            padding: '20px',
            maxWidth: '300px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Your Team</h3>
            <h2 style={{ margin: '0 0 15px 0', color: '#333' }}>{user.team}</h2>
            
            <div style={{ fontSize: '1.1rem', color: '#555' }}>Current Score:</div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#007bff',
              marginTop: '5px' 
            }}>
              {loadingPoints ? (
                <span style={{ fontSize: '1.5rem', color: '#999' }}>Loading...</span>
              ) : (
                `${teamPoints} pts`
              )}
            </div>
          </div>

          {/* 🟢 CAPTAIN PANEL FOR SUBMITTING GUESSES */}
          {user.captain && (
            <form onSubmit={handleSubmitAnswer} style={{
              margin: '30px auto',
              padding: '25px',
              maxWidth: '300px',
              backgroundColor: hasSubmitted ? '#f0f0f0' : '#eef7ff',
              border: hasSubmitted ? '1px solid #ccc' : '1px solid #bce0ff',
              borderRadius: '8px',
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', color: hasSubmitted ? '#666' : '#0056b3' }}>
                {hasSubmitted ? '🔒 Answer Submitted' : '👨‍✈️ Captain Answer Panel'}
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem', color: hasSubmitted ? '#999' : '#333' }}>
                  Song Title:
                </label>
                <input 
                  type="text"
                  placeholder={hasSubmitted ? "Locked until next song..." : "Guess the song name..."}
                  value={songGuess}
                  onChange={(e) => setSongGuess(e.target.value)}
                  disabled={isSubmitting || hasSubmitted}
                  style={{...inputStyle, backgroundColor: hasSubmitted ? '#e9ecef' : '#fff'}}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem', color: hasSubmitted ? '#999' : '#333' }}>
                  Artist Name:
                </label>
                <input 
                  type="text"
                  placeholder={hasSubmitted ? "Locked until next song..." : "Guess the artist..."}
                  value={artistGuess}
                  onChange={(e) => setArtistGuess(e.target.value)}
                  disabled={isSubmitting || hasSubmitted}
                  style={{...inputStyle, backgroundColor: hasSubmitted ? '#e9ecef' : '#fff'}}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || hasSubmitted}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isSubmitting ? '#999' : hasSubmitted ? '#6c757d' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: (isSubmitting || hasSubmitted) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Submitting...' : hasSubmitted ? 'Waiting for Next Song... ⏳' : 'Submit Answer 🚀'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div style={{ color: '#dc3545', margin: '20px 0' }}>
          ⚠️ You have not been assigned to a team yet. Please contact the host!
        </div>
      )}
    </div>
  );
}

// Simple layout formatting for the inputs
const inputStyle = {
  width: '100%',
  padding: '10px',
  boxSizing: 'border-box',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

export default PlayerTriviaGame;