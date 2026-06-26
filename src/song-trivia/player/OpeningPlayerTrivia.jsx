import React from 'react';

function OpeningPlayerTrivia({ user }) {
  return (
    <div className="player-container">
      <h1>Welcome {user.name}!</h1>
      <h2>This is the opening page for TRIVIA:p</h2>
      <h2>You are one team {user.team}</h2>
    </div>
  );
}

export default OpeningPlayerTrivia;