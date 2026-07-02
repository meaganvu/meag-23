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
  const [isPressed, setIsPressed] = useState(false); // Mobile button push state
  
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
      const teamDocRef = doc(db, 'teams', user.team);
  
      await setDoc(teamDocRef, {
        songGuess: songGuess.trim(),
        artistGuess: artistGuess.trim(),
        guessTimestamp: serverTimestamp() 
      }, { merge: true });
  
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
    <div className="player-container" style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>WELCOME, {user.name.toUpperCase()}!</h1>
        <p style={styles.subtitle}>TRIVIA ARENA 🎵</p>

        {user.team ? (
          <div>
            {/* TEAM SCORE CARD */}
            <div style={styles.scoreCard}>
              <h3 style={styles.scoreLabel}>YOUR TEAM</h3>
              <h2 style={styles.teamName}>{user.team}</h2>
              
              <div style={styles.pointsLabel}>Current Score</div>
              <div style={styles.pointsDisplay}>
                {loadingPoints ? (
                  <span style={styles.loadingText}>Loading...</span>
                ) : (
                  `${teamPoints} pts`
                )}
              </div>
            </div>

            {/* 🟢 CAPTAIN PANEL FOR SUBMITTING GUESSES */}
            {user.captain && (
              <form onSubmit={handleSubmitAnswer} style={{
                ...styles.formPanel,
                backgroundColor: hasSubmitted ? 'rgba(30, 41, 59, 0.4)' : 'rgba(30, 41, 59, 0.8)',
                borderColor: hasSubmitted ? 'rgba(255, 255, 255, 0.05)' : '#4f46e5'
              }}>
                <h3 style={{
                  ...styles.formTitle,
                  color: hasSubmitted ? '#64748b' : '#38bdf8'
                }}>
                  {hasSubmitted ? '🔒 ANSWER SUBMITTED' : '👨‍✈️ CAPTAIN PANEL'}
                </h3>

                <div style={styles.inputGroup}>
                  <label style={{...styles.inputLabel, color: hasSubmitted ? '#475569' : '#94a3b8'}}>
                    Song Title
                  </label>
                  <input 
                    type="text"
                    placeholder={hasSubmitted ? "Locked until next song..." : "Guess the song..."}
                    value={songGuess}
                    onChange={(e) => setSongGuess(e.target.value)}
                    disabled={isSubmitting || hasSubmitted}
                    style={{
                      ...styles.textInput,
                      backgroundColor: hasSubmitted ? 'rgba(15, 23, 42, 0.6)' : '#1e293b',
                      color: hasSubmitted ? '#475569' : '#f8fafc'
                    }}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={{...styles.inputLabel, color: hasSubmitted ? '#475569' : '#94a3b8'}}>
                    Artist Name
                  </label>
                  <input 
                    type="text"
                    placeholder={hasSubmitted ? "Locked until next song..." : "Guess the artist..."}
                    value={artistGuess}
                    onChange={(e) => setArtistGuess(e.target.value)}
                    disabled={isSubmitting || hasSubmitted}
                    style={{
                      ...styles.textInput,
                      backgroundColor: hasSubmitted ? 'rgba(15, 23, 42, 0.6)' : '#1e293b',
                      color: hasSubmitted ? '#475569' : '#f8fafc'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || hasSubmitted}
                  style={{
                    ...styles.actionButton,
                    background: isSubmitting 
                      ? '#475569' 
                      : hasSubmitted 
                        ? 'rgba(71, 85, 105, 0.4)' 
                        : 'linear-gradient(90deg, #22c55e, #10b981)', // Vibrant green gradient for active state
                    transform: isPressed && !hasSubmitted ? 'scale(0.96)' : 'scale(1)',
                    boxShadow: hasSubmitted ? 'none' : '0 0 15px rgba(34, 197, 94, 0.3)',
                    cursor: (isSubmitting || hasSubmitted) ? 'not-allowed' : 'pointer'
                  }}
                  onTouchStart={() => setIsPressed(true)}
                  onTouchEnd={() => setIsPressed(false)}
                  onMouseDown={() => setIsPressed(true)}
                  onMouseUp={() => setIsPressed(false)}
                >
                  <span style={styles.buttonText}>
                    {isSubmitting ? 'SUBMITTING...' : hasSubmitted ? 'WAITING FOR NEXT SONG... ⏳' : 'SUBMIT GUESS 🚀'}
                  </span>
                </button>
              </form>
            )}
          </div>
        ) : (
          <div style={styles.warningAlert}>
            ⚠️ You have not been assigned to a team yet. Please contact the host!
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '24px', 
    backgroundColor: '#0f172a', 
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)', 
    backdropFilter: 'blur(12px)',
    padding: '32px 20px', 
    borderRadius: '24px',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
    maxWidth: '430px', 
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxSizing: 'border-box'
  },
  title: {
    fontSize: '1.8rem', 
    fontWeight: '900',
    letterSpacing: '1px',
    margin: '0 0 4px 0',
    background: 'linear-gradient(45deg, #38bdf8, #818cf8)', 
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#fbbf24', 
    letterSpacing: '3px',
    margin: '0 0 25px 0',
  },
  scoreCard: {
    margin: '0 auto 24px auto',
    padding: '20px',
    backgroundColor: '#1e293b',
    border: '2px solid #475569',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    maxWidth: '340px'
  },
  scoreLabel: {
    margin: '0 0 4px 0', 
    color: '#64748b', 
    fontSize: '0.8rem', 
    letterSpacing: '2px',
    fontWeight: '800'
  },
  teamName: {
    margin: '0 0 16px 0', 
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: '800'
  },
  pointsLabel: {
    fontSize: '0.9rem', 
    color: '#94a3b8',
    fontWeight: '500'
  },
  pointsDisplay: {
    fontSize: '2.5rem', 
    fontWeight: '900', 
    color: '#38bdf8',
    marginTop: '2px',
    textShadow: '0 0 15px rgba(56, 189, 248, 0.3)'
  },
  loadingText: {
    fontSize: '1.3rem', 
    color: '#64748b'
  },
  formPanel: {
    margin: '0 auto',
    padding: '24px 20px',
    maxWidth: '340px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '16px',
    textAlign: 'left',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  },
  formTitle: {
    margin: '0 0 20px 0', 
    textAlign: 'center', 
    fontSize: '1rem',
    fontWeight: '900',
    letterSpacing: '1.5px'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  inputLabel: {
    display: 'block', 
    fontWeight: '700', 
    marginBottom: '6px', 
    fontSize: '0.85rem',
    letterSpacing: '0.5px'
  },
  textInput: {
    width: '100%',
    padding: '12px 16px',
    boxSizing: 'border-box',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '16px', // 👈 Fixes iOS Safari auto-zoom on field focus
    outline: 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', 
    padding: '16px',
    fontSize: '1.1rem',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50px', 
    marginTop: '8px',
    boxSizing: 'border-box',
    transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
  },
  buttonText: {
    marginTop: '1px'
  },
  warningAlert: {
    color: '#f87171', 
    margin: '20px 0',
    fontWeight: '600',
    lineHeight: '1.5'
  }
};

export default PlayerTriviaGame;