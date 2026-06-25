import React from 'react';

function TVOpeningTrivia({ onNavigate }) {
  return (
    <div className="player-container" style={{ textAlign: 'center', padding: '40px' }}>
      <h1> WELCOME TO SONG TRIVIA </h1>
      
      {/* 🟢 Clicking this will trigger handleScreenChange('trivia-playing') in TVTriviaDisplay */}
      <button 
        onClick={onNavigate} 
        className="start-button atomic-age-regular"
        style={{
          marginTop: '30px',
          padding: '15px 40px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Start Game ▶
      </button>
    </div>
  );
}

export default TVOpeningTrivia;