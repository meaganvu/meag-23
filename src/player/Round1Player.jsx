import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function Round1Player({ user }) {
  // Save both name and ID so we can pull the matching picture
  const [target, setTarget] = useState({ name: null, id: null });

  useEffect(() => {
    if (!user || !user.phone) return;

    const playerDocRef = doc(db, 'users', user.phone);

    const unsubscribe = onSnapshot(playerDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTarget({
          name: data.assignedPlayerName || null,
          id: data.assignedPlayerId || null
        });
      }
    }, (error) => {
      console.error("Error listening to target data:", error);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="player-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to Round 1, {user.name}!</h1>
      <p style={{ fontStyle: 'italic', color: '#888' }}>
        Keep your eyes peeled, your drink guarded, and look out for assassins...
      </p>

      <hr style={{ margin: '30px 0', borderColor: '#444' }} />

      {!target.name || !target.id ? (
        <div style={{ padding: '20px', background: '#222', borderRadius: '8px' }}>
          <h3>🕵️‍♂️ Waiting for the Host to assign targets...</h3>
        </div>
      ) : (
        <div style={{ 
          padding: '20px', 
          background: '#841515', 
          border: '2px solid #ff4d4d', 
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(255, 77, 77, 0.3)'
        }}>
          <h2 style={{ letterSpacing: '1px', textTransform: 'uppercase', color: '#ffb3b3' }}>
            YOUR TARGET IS:
          </h2>

          {/* 📸 Target Photo Loaded Directly From Your Local Directory */}
          <img 
            src={`/images/${target.id}.jpeg`} 
            alt={target.name}
            style={{ 
              width: '140px', 
              height: '140px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '4px solid white',
              margin: '15px 0',
              backgroundColor: '#333'
            }} 
          />

          <h1 style={{ fontSize: '2.5rem', margin: '5px 0', color: '#fff' }}>
            🎯 {target.name}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#ffcccc' }}>
            Spike their drink without getting caught!
          </p>
        </div>
      )}
    </div>
  );
}

export default Round1Player;