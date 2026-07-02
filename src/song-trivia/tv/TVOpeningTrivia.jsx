import React from 'react';

function TVOpeningTrivia({ onNavigate }) {
  return (
    <div className="player-container" style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>WELCOME TO SONG TRIVIA</h1>
        
        <p style={styles.subtitle}>GET HYPEDDDDDDD</p>
        
        <p style={styles.description}>
          The ultimate test to see who possesses the supreme music knowledge.
          <br />
          <span style={styles.highlightText}>Will it be...</span>
        </p>

        <div style={styles.teamContainer}>
          <div style={styles.teamBadge}>SCU</div>
          <div style={styles.vsDivider}>VS</div>
          <div style={styles.teamBadge}>UCSD</div>
          <div style={styles.vsDivider}>VS</div>
          <div style={styles.teamBadge}>Lick High School</div>
        </div>

        {/* 🚀 New custom Vibe-Matched Action Button */}
        <button 
          onClick={onNavigate} 
          style={styles.actionButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(129, 140, 248, 0.8), 0 0 15px rgba(56, 189, 248, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(129, 140, 248, 0.5)';
          }}
        >
          <span style={styles.buttonText}>LAUNCH GAME</span>
          <span style={styles.buttonIcon}>⚡</span>
        </button>
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
    padding: '20px',
    backgroundColor: '#0f172a', 
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)', 
    backdropFilter: 'blur(12px)',
    padding: '60px 40px',
    borderRadius: '24px',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
    maxWidth: '750px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    letterSpacing: '3px',
    margin: '0 0 10px 0',
    background: 'linear-gradient(45deg, #38bdf8, #818cf8)', 
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fbbf24', 
    textTransform: 'uppercase',
    letterSpacing: '4px',
    margin: '0 0 35px 0',
    animation: 'pulse 1.5s infinite alternate' // Great if you map this to a CSS pulse keyframe later!
  },
  description: {
    fontSize: '1.25rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '0 0 35px 0'
  },
  highlightText: {
    display: 'block',
    marginTop: '15px',
    color: '#38bdf8',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  teamContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    margin: '0 0 50px 0'
  },
  teamBadge: {
    backgroundColor: '#1e293b',
    padding: '12px 28px',
    borderRadius: '12px',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
    border: '2px solid #475569',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  },
  vsDivider: {
    fontSize: '0.9rem',
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: '1px'
  },
  /* ⚡ The Brand New Button ⚡ */
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px 45px',
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#ffffff',
    background: 'linear-gradient(90deg, #6366f1, #3b82f6)', // Sleek Indigo-to-Blue cosmic gradient
    border: 'none',
    borderRadius: '50px', // Capsule shaped for a premium tech-arcade look
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(129, 140, 248, 0.5)',
    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease',
  },
  buttonText: {
    marginTop: '2px' // Keeps uppercase tracking balanced
  },
  buttonIcon: {
    fontSize: '1.5rem',
  }
};

export default TVOpeningTrivia;