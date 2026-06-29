import React from 'react';

function OpeningPlayer({ name }) {
  return (
    <div className="player-screen">
      <div className="player-shell">
        <header className="player-hero">
          <p className="player-kicker">MEAG's 23rd</p>
          <h1>Welcome, {name}!</h1>
          <p>Keep your phone close. Your assignments will appear here when the host starts each round.</p>
        </header>
        <section className="player-status-card">
          <h2>Waiting for the game to begin</h2>
          <p>The TV controls the current round. This screen updates automatically.</p>
        </section>
      </div>
    </div>
  );
}

export default OpeningPlayer;
