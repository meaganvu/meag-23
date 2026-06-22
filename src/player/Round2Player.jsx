import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjusted path slightly to match your folder tree
import { doc, onSnapshot } from 'firebase/firestore';

function Round2Player({ user }) {
  // Added targetId and partnerId fields to hold the database string IDs
  const [matchData, setMatchData] = useState({ 
    targetName: null, 
    targetId: null,
    partnerName: null, 
    partnerId: null 
  });

  useEffect(() => {
    if (!user || !user.phone) return;

    const playerDocRef = doc(db, 'users', user.phone);

    // 🎧 Live listen to this player's document for round 2 fields
    const unsubscribe = onSnapshot(playerDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMatchData({
          targetName: data.assignedPlayerName || null,
          targetId: data.assignedPlayerId || null,      // 🎯 Pulls target image key
          partnerName: data.partnerName || null,
          partnerId: data.partnerId || null             // 🤝 Pulls partner image key
        });
      }
    }, (error) => {
      console.error("Error listening to Round 2 data:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const { targetName, targetId, partnerName, partnerId } = matchData;

  // Reusable circular image styling rules to guarantee they never squish again
  const circularImageStyle = {
    width: '120px',
    height: '120px',
    minWidth: '120px',  // 🛑 Prevents horizontal text squishing
    minHeight: '120px', // 🛑 Prevents vertical squishing
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid white',
    margin: '15px auto',
    display: 'block',
    backgroundColor: '#333'
  };

  return (
    <div className="player-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to Round 2, {user.name}!</h1>
      <p style={{ fontStyle: 'italic', color: '#888' }}>
        Double trouble. Watch your partner's cup, watch your own, and hunt down your target.
      </p>

      <hr style={{ margin: '30px 0', borderColor: '#444' }} />

      {/* 🤝 & 🎯 Dynamically shows partner and target cards based on backend status */}
      {!targetName || !partnerName || !targetId || !partnerId ? (
        <div style={{ padding: '20px', background: '#222', borderRadius: '8px' }}>
          <h3>🕵️‍♂️ Waiting for the Host to assign partners and targets...</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
          
          {/* Partner Card */}
          <div style={{ 
            padding: '20px', 
            background: '#144621', 
            border: '2px solid #2ecc71', 
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(46, 204, 113, 0.2)'
          }}>
            <h2 style={{ letterSpacing: '1px', textTransform: 'uppercase', color: '#a2f1c1', margin: '0 0 5px 0', fontSize: '1.2rem' }}>
              🤝 Your Partner In Crime:
            </h2>

            {/* 📸 Local Partner Image Asset */}
            <img 
              src={`../../images/${partnerId}.jpeg`} 
              alt={partnerName}
              style={circularImageStyle} 
            />

            <h1 style={{ fontSize: '2.2rem', margin: '10px 0', color: '#fff' }}>
              {partnerName}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#d1f7e0', margin: 0 }}>
              Protect each other's cups! If you catch their assassin, the assassin's partner drinks.
            </p>
          </div>

          {/* Target Card */}
          <div style={{ 
            padding: '20px', 
            background: '#841515', 
            border: '2px solid #ff4d4d', 
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(255, 77, 77, 0.2)'
          }}>
            <h2 style={{ letterSpacing: '1px', textTransform: 'uppercase', color: '#ffb3b3', margin: '0 0 5px 0', fontSize: '1.2rem' }}>
              🎯 Your Target:
            </h2>

            {/* 📸 Local Target Image Asset */}
            <img 
              src={`../../images/${targetId}.jpeg`} 
              alt={targetName}
              style={circularImageStyle} 
            />

            <h1 style={{ fontSize: '2.2rem', margin: '10px 0', color: '#fff' }}>
              {targetName}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#ffcccc', margin: 0 }}>
              Spike their drink! Remember, they are completely independent of your partner.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

export default Round2Player;