import React from 'react';

function Round3Player({ user }) {
  return (
    <div className="player-container">
      <h1>Welcome {user.name}!</h1>
      <h2>FINAL ROUND</h2>
    </div>
  );
}

export default Round3Player;