import React, { useState } from 'react';

function OpeningPlayerTrivia({ user }) {
  // Mobile touch feedback state
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="player-container" style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>WELCOME, {user.name.toUpperCase()}!</h1>
        
        <p style={styles.subtitle}>GET HYPEDDDDDDD</p>
        
        <p style={styles.description}>
          This is the opening page for <br />
          <span style={styles.highlightText}>TRIVIA :p</span>
        </p>

        <div style={styles.teamContainer}>
          <div style={styles.vsDivider}>YOUR TEAM</div>
          <div style={styles.teamBadge}>{user.team}</div>
        </div>
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
    padding: '24px', // Optimized for iPhone safe areas
    backgroundColor: '#0f172a', 
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)', 
    backdropFilter: 'blur(12px)',
    padding: '40px 24px', // Slightly narrower padding for mobile screens
    borderRadius: '24px',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
    maxWidth: '430px', // Perfect width ceiling for iPhone 15 Pro Max
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxSizing: 'border-box'
  },
  title: {
    fontSize: '2rem', // Scaled down slightly from TV so it doesn't wrap awkwardly
    fontWeight: '900',
    letterSpacing: '2px',
    margin: '0 0 8px 0',
    background: 'linear-gradient(45deg, #38bdf8, #818cf8)', 
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#fbbf24', 
    textTransform: 'uppercase',
    letterSpacing: '3px',
    margin: '0 0 25px 0',
  },
  description: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: '0 0 35px 0'
  },
  highlightText: {
    display: 'block',
    marginTop: '8px',
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: '1.4rem',
    letterSpacing: '1px'
  },
  teamContainer: {
    display: 'flex',
    flexDirection: 'column', // Stacked vertically for clean mobile viewing
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 40px 0'
  },
  teamBadge: {
    backgroundColor: '#1e293b',
    padding: '14px 36px',
    borderRadius: '16px',
    fontSize: '1.4rem', // Make their own team pop out 
    fontWeight: '800',
    color: '#fff',
    border: '2px solid #818cf8', // Highlight color so the player knows it's theirs
    boxShadow: '0 4px 12px rgba(129, 140, 248, 0.25)',
    width: '80%', // Looks cleaner on iOS
    maxWidth: '280px'
  },
  vsDivider: {
    fontSize: '0.85rem',
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: '2px',
    textTransform: 'uppercase'
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 40px',
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#ffffff',
    background: 'linear-gradient(90deg, #6366f1, #3b82f6)', 
    border: 'none',
    borderRadius: '50px', 
    cursor: 'pointer',
    width: '100%', // Full width on mobile for easy thumb tapping
    maxWidth: '300px',
    transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease',
    WebkitTapHighlightColor: 'transparent', // Removes default grey flash on iOS touch
  },
  buttonText: {
    marginTop: '2px' 
  },
  buttonIcon: {
    fontSize: '1.3rem',
  }
};

export default OpeningPlayerTrivia;