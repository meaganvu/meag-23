import React from 'react';

function Round3Player({ user }) {
  return (
    <div className="player-screen">
      <div className="player-shell">
        <header className="player-hero">
          <p className="player-kicker">Final Round</p>
          <h1>Welcome, {user.name}!</h1>
          <p>Free for all. Keep your cup close and move carefully.</p>
        </header>

        <section className="player-card player-card-danger">
          <p className="player-card-label">Round 3 Rules</p>
          <h2>Final Round</h2>
          <ul className="player-rule-list">
            <li>Everyone is a target.</li>
            <li>If you get caught pouring into someone's cup, you're out.</li>
            <li>Wrong accusations still cost half a shooter.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Round3Player;
