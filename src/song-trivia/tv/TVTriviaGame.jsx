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
  const [gameOverStep, setGameOverStep] = useState('intro'); // 'intro' or 'results'

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
    setGameOverStep('intro');
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

  // Helper to standardise hover effects dynamically
  const triggerHover = (e, background, glow) => {
    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
    e.currentTarget.style.boxShadow = `0 10px 25px ${glow}`;
    if (background) e.currentTarget.style.background = background;
  };

  const removeHover = (e, background, shadow) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = shadow || 'none';
    if (background) e.currentTarget.style.background = background;
  };

  return (
    <div style={styles.container}>
      
      {/* MAIN GAME CARD */}
      <div style={styles.card}>
        {isGameOver ? (
          <div style={styles.gameOverWrapper}>
            {gameOverStep === 'intro' ? (
              /* STEP 1: INTRO TO RESULTS */
              <div>
                <div style={styles.trophyIcon}>🎉</div>
                <h1 style={styles.gameOverTitle}>TRIVIA COMPLETE!</h1>
                <p style={styles.gameOverSubtitle}>Let's see how yall did...</p>
                
                <div style={styles.buttonGroup}>
                  <button 
                    onClick={() => setGameOverStep('results')} 
                    style={styles.revealBtn}
                    onMouseEnter={(e) => triggerHover(e, 'linear-gradient(90deg, #34d399, #10b981)', 'rgba(16, 185, 129, 0.4)')}
                    onMouseLeave={(e) => removeHover(e, 'linear-gradient(90deg, #10b981, #059669)', '0 4px 14px rgba(16, 185, 129, 0.3)')}
                  >
                    Reveal Leaderboard 📊
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: RANKINGS AND FINAL SCORES */
              <div>
                <div style={styles.trophyIcon}>🏆</div>
                <h1 style={styles.gameOverTitle}>FINAL RANKINGS</h1>
                <p style={styles.gameOverSubtitle}>The final scores have been settled.</p>
                
                {/* Dedicated Final Standings List */}
                <div style={styles.finalRankingsContainer}>
                  {teams.map((team, index) => {
                    const isFirst = index === 0;
                    const isSecond = index === 1;
                    const isThird = index === 2;

                    let placementIcon = '🏅';
                    let rankBg = 'rgba(30, 41, 59, 0.8)';
                    let borderStyle = '1px solid rgba(255, 255, 255, 0.08)';

                    if (isFirst) {
                      placementIcon = '🥇';
                      rankBg = 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.05))';
                      borderStyle = '2px solid #fbbf24';
                    } else if (isSecond) {
                      placementIcon = '🥈';
                      rankBg = 'linear-gradient(135deg, rgba(226, 232, 240, 0.15), rgba(226, 232, 240, 0.05))';
                      borderStyle = '1px solid #e2e8f0';
                    } else if (isThird) {
                      placementIcon = '🥉';
                      rankBg = 'linear-gradient(135deg, rgba(180, 83, 9, 0.15), rgba(180, 83, 9, 0.05))';
                      borderStyle = '1px solid #b45309';
                    }

                    return (
                      <div 
                        key={team.id} 
                        style={{
                          ...styles.finalRankRow,
                          background: rankBg,
                          border: borderStyle,
                          transform: isFirst ? 'scale(1.03)' : 'scale(1)'
                        }}
                      >
                        <div style={styles.finalRankLeft}>
                          <span style={styles.finalRankIcon}>{placementIcon}</span>
                          <span style={styles.finalRankName}>{team.name || team.id}</span>
                        </div>
                        <div style={{
                          ...styles.finalRankPoints,
                          color: isFirst ? '#fbbf24' : '#38bdf8'
                        }}>
                          {team.points} <span style={styles.finalPtsText}>PTS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={styles.buttonGroup}>
                  <button 
                    onClick={handleRestart} 
                    style={styles.primaryBtn}
                    onMouseEnter={(e) => triggerHover(e, 'linear-gradient(90deg, #818cf8, #6366f1)', 'rgba(129, 140, 248, 0.4)')}
                    onMouseLeave={(e) => removeHover(e, 'linear-gradient(90deg, #6366f1, #3b82f6)', '0 4px 14px rgba(129, 140, 248, 0.3)')}
                  >
                    Play Again 🔄
                  </button>
                  <button 
                    onClick={onNavigate} 
                    style={styles.secondaryBtn}
                    onMouseEnter={(e) => triggerHover(e, null, 'rgba(148, 163, 184, 0.2)')}
                    onMouseLeave={(e) => removeHover(e, null, 'none')}
                  >
                    Main Menu 🏠
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* CATEGORY HEADER */}
            <div style={styles.categoryBadgeContainer}>
              <div style={styles.categoryLabel}>CATEGORY</div>
              <h2 style={styles.categoryTitle}>{currentCategory}</h2>
              <div style={styles.songTracker}>
                Song <span style={styles.highlightText}>{songIndex + 1}</span> of {currentCategorySongs?.length || 0}
              </div>
            </div>

            <hr style={styles.divider} />

            {/* CONDITIONAL MAIN DISPLAY MODES */}
            <div style={styles.gameplayViewport}>
              
              {/* MODE 1: BASE GUESSING SCREEN */}
              {!showGuesses && (
                <div style={styles.guessingVibeContainer}>
                  <div style={styles.pulseIconContainer}>
                    <span style={styles.musicIcon}>🎵</span>
                  </div>
                  <h1 style={styles.guessingTitle}>GUESS THE SONG!</h1>
                  <p style={styles.guessingSubtitle}>Listen closely and lock in your answers below.</p>
                </div>
              )}

              {/* MODE 2: COMBINED GUESSES & REVEAL SCREEN */}
              {showGuesses && (
                <div>
                  {/* REVEAL TRUE ANSWER POPUP */}
                  {showAnswer && (
                    <div style={styles.answerBox}>
                      <div style={styles.answerTag}>CORRECT ANSWER</div>
                      <h1 style={styles.songTitle}>"{currentSong?.title}"</h1>
                      <h3 style={styles.artistName}>by {currentSong?.artist}</h3>
                    </div>
                  )}

                  {/* TEAMS' GUESSES TRACKER */}
                  <h2 style={styles.teamGuessesHeading}>👀 What the Teams Guessed:</h2>
                  <div style={styles.guessesGrid}>
                    {teams.map((team) => (
                      <div key={team.id} style={styles.guessCard}>
                        <strong style={styles.guessTeamName}>{team.name || team.id}</strong>
                        <div style={styles.guessOutputs}>
                          <div style={styles.guessRow}>
                            <span style={styles.guessLabel}>🎵 Song:</span> 
                            <span style={team.songGuess ? styles.guessValue : styles.noGuessValue}>
                              {team.songGuess || 'No guess'}
                            </span>
                          </div>
                          <div style={styles.guessRow}>
                            <span style={styles.guessLabel}>🎙️ Artist:</span> 
                            <span style={team.artistGuess ? styles.guessValue : styles.noGuessValue}>
                              {team.artistGuess || 'No guess'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CONTROL NAVIGATION BUTTONS */}
            <div style={styles.buttonGroup}>
              {!showGuesses && (
                <button 
                  onClick={() => setShowGuesses(true)} 
                  style={styles.primaryBtn}
                  onMouseEnter={(e) => triggerHover(e, 'linear-gradient(90deg, #818cf8, #6366f1)', 'rgba(129, 140, 248, 0.4)')}
                  onMouseLeave={(e) => removeHover(e, 'linear-gradient(90deg, #6366f1, #3b82f6)', '0 4px 14px rgba(129, 140, 248, 0.3)')}
                >
                  Show Team Guesses 👀
                </button>
              )}

              {showGuesses && !showAnswer && (
                <button 
                  onClick={() => setShowAnswer(true)} 
                  style={styles.revealBtn}
                  onMouseEnter={(e) => triggerHover(e, 'linear-gradient(90deg, #34d399, #10b981)', 'rgba(16, 185, 129, 0.4)')}
                  onMouseLeave={(e) => removeHover(e, 'linear-gradient(90deg, #10b981, #059669)', '0 4px 14px rgba(16, 185, 129, 0.3)')}
                >
                  Reveal True Answer 👑
                </button>
              )}

              {showAnswer && (
                <button 
                  onClick={handleNext} 
                  style={styles.nextBtn}
                  onMouseEnter={(e) => triggerHover(e, 'linear-gradient(90deg, #60a5fa, #3b82f6)', 'rgba(59, 130, 246, 0.4)')}
                  onMouseLeave={(e) => removeHover(e, 'linear-gradient(90deg, #3b82f6, #2563eb)', '0 4px 14px rgba(59, 130, 246, 0.3)')}
                >
                  Next Song ➡️
                </button>
              )}

              <button 
                onClick={handleRestart} 
                style={styles.dangerBtn}
                onMouseEnter={(e) => triggerHover(e, null, 'rgba(239, 68, 68, 0.2)')}
                onMouseLeave={(e) => removeHover(e, null, 'none')}
              >
                Restart 🔄
              </button>
              
              <button 
                onClick={onNavigate} 
                style={styles.secondaryBtn}
                onMouseEnter={(e) => triggerHover(e, null, 'rgba(148, 163, 184, 0.2)')}
                onMouseLeave={(e) => removeHover(e, null, 'none')}
              >
                Exit 🏠
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GAMING STYLE SCOREBOARD FOOTER */}
      {/* Hidden during final results view to ensure full layout emphasis on the main card ranks */}
      {(!isGameOver || gameOverStep === 'intro') && (
        <div style={styles.scoreboardFooter}>
          <h3 style={styles.scoreboardTitle}>🏆 Leaderboard 🏆</h3>
          <div style={styles.leaderboardRow}>
            {teams.length === 0 ? (
              <p style={styles.waitingText}>Waiting for teams to enter the stadium...</p>
            ) : (
              teams.map((team, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                let placementIcon = '🏅';
                let badgeColor = 'rgba(51, 65, 85, 0.5)';
                let borderColor = 'rgba(255, 255, 255, 0.08)';

                if (isFirst) {
                  placementIcon = '🥇';
                  badgeColor = 'rgba(251, 191, 36, 0.1)';
                  borderColor = 'rgba(251, 191, 36, 0.4)';
                } else if (isSecond) {
                  placementIcon = '🥈';
                  badgeColor = 'rgba(226, 232, 240, 0.1)';
                  borderColor = 'rgba(226, 232, 240, 0.3)';
                } else if (isThird) {
                  placementIcon = '🥉';
                  badgeColor = 'rgba(180, 83, 9, 0.1)';
                  borderColor = 'rgba(180, 83, 9, 0.3)';
                }

                return (
                  <div 
                    key={team.id} 
                    style={{
                      ...styles.leaderboardBadge,
                      backgroundColor: badgeColor,
                      borderColor: borderColor,
                    }}
                  >
                    <div style={styles.badgeLabel}>
                      <span style={styles.placementIcon}>{placementIcon}</span>
                      <span style={styles.teamName}>{team.name || team.id}</span>
                    </div>
                    <div style={{
                      ...styles.pointsDisplay,
                      color: isFirst ? '#fbbf24' : '#38bdf8'
                    }}>
                      {team.points} <span style={styles.ptsText}>PTS</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Design System mirroring TVOpeningTrivia aesthetic
const styles = {
  container: {
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: '100vh', 
    backgroundColor: '#0f172a', 
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '40px',
    boxSizing: 'border-box',
    justifyContent: 'space-between'
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)', 
    backdropFilter: 'blur(12px)',
    padding: '40px 60px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto 40px auto',
    boxSizing: 'border-box'
  },
  gameOverWrapper: {
    textAlign: 'center',
    padding: '30px 0'
  },
  trophyIcon: {
    fontSize: '6rem',
    marginBottom: '20px'
  },
  gameOverTitle: {
    fontSize: '3.5rem',
    fontWeight: '900',
    margin: '0 0 10px 0',
    background: 'linear-gradient(45deg, #fbbf24, #f43f5e)', 
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '2px'
  },
  gameOverSubtitle: {
    fontSize: '1.6rem',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '40px'
  },
  finalRankingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxWidth: '650px',
    margin: '0 auto 40px auto',
    textAlign: 'left'
  },
  finalRankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease'
  },
  finalRankLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  finalRankIcon: {
    fontSize: '2rem'
  },
  finalRankName: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff'
  },
  finalRankPoints: {
    fontSize: '2rem',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px'
  },
  finalPtsText: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#64748b'
  },
  categoryBadgeContainer: {
    textAlign: 'center',
    marginBottom: '15px'
  },
  categoryLabel: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '5px'
  },
  categoryTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    background: 'linear-gradient(45deg, #38bdf8, #818cf8)', 
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px'
  },
  songTracker: {
    fontSize: '1.15rem',
    color: '#94a3b8',
    fontWeight: '500'
  },
  highlightText: {
    color: '#fbbf24',
    fontWeight: '700'
  },
  divider: {
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    margin: '25px 0'
  },
  gameplayViewport: {
    minHeight: '260px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '30px 0'
  },
  guessingVibeContainer: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  pulseIconContainer: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    border: '2px solid rgba(56, 189, 248, 0.3)',
    boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)'
  },
  musicIcon: {
    fontSize: '3rem'
  },
  guessingTitle: {
    fontSize: '3rem',
    fontWeight: '900',
    letterSpacing: '2px',
    margin: '0 0 10px 0',
    color: '#f8fafc'
  },
  guessingSubtitle: {
    fontSize: '1.25rem',
    color: '#64748b',
    margin: '0'
  },
  answerBox: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))',
    border: '2px solid #10b981',
    borderRadius: '16px',
    padding: '25px',
    maxWidth: '700px',
    margin: '0 auto 35px auto',
    textAlign: 'center',
    boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
  },
  answerTag: {
    fontSize: '0.8rem',
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: '2px',
    marginBottom: '10px'
  },
  songTitle: {
    fontSize: '3.2rem',
    fontWeight: '900',
    margin: '0 0 10px 0',
    color: '#ffffff',
    letterSpacing: '0.5px'
  },
  artistName: {
    fontSize: '1.6rem',
    color: '#a7f3d0',
    margin: '0',
    fontWeight: '500'
  },
  teamGuessesHeading: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: '25px',
    textAlign: 'center',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  },
  guessesGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  guessCard: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '20px 25px',
    minWidth: '260px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    flex: '1 1 260px',
    maxWidth: '320px'
  },
  guessTeamName: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#f8fafc',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '10px',
    display: 'block',
    marginBottom: '12px'
  },
  guessOutputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  guessRow: {
    fontSize: '1.05rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  guessLabel: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: '0.95rem'
  },
  guessValue: {
    color: '#38bdf8',
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '160px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  noGuessValue: {
    color: '#475569',
    fontStyle: 'italic'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginTop: '20px'
  },
  primaryBtn: {
    padding: '14px 35px',
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#fff',
    background: 'linear-gradient(90deg, #6366f1, #3b82f6)', 
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(129, 140, 248, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  revealBtn: {
    padding: '14px 35px',
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#fff',
    background: 'linear-gradient(90deg, #10b981, #059669)', 
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  nextBtn: {
    padding: '14px 35px',
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#fff',
    background: 'linear-gradient(90deg, #3b82f6, #2563eb)', 
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  secondaryBtn: {
    padding: '12px 30px',
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#94a3b8',
    backgroundColor: 'transparent',
    border: '2px solid #334155',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  dangerBtn: {
    padding: '12px 30px',
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#f87171',
    backgroundColor: 'transparent',
    border: '2px solid #991b1b',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  scoreboardFooter: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    padding: '20px 30px',
    boxShadow: '0 -10px 30px rgba(0,0,0,0.3)'
  },
  scoreboardTitle: {
    textAlign: 'center',
    margin: '0 0 20px 0',
    color: '#f8fafc',
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '4px',
    textTransform: 'uppercase'
  },
  leaderboardRow: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  waitingText: {
    color: '#64748b',
    fontSize: '1.1rem',
    fontStyle: 'italic',
    margin: '10px 0'
  },
  leaderboardBadge: {
    padding: '14px 28px',
    borderRadius: '16px',
    minWidth: '220px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease'
  },
  badgeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  placementIcon: {
    fontSize: '1.4rem'
  },
  teamName: {
    fontWeight: '800',
    fontSize: '1.15rem',
    color: '#ffffff'
  },
  pointsDisplay: {
    fontSize: '1.6rem',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px'
  },
  ptsText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#64748b'
  }
};

export default TVTriviaGame;