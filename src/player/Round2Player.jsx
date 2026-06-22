import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // 🟢 Added storage import
import { doc, onSnapshot } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // 🟢 Added Firebase Storage methods

function Round2Player({ user }) {
  const [matchData, setMatchData] = useState({ 
    targetName: null, 
    targetId: null,
    targetImageUrl: null, // 🟢 To hold cloud storage target photo
    partnerName: null, 
    partnerId: null,
    partnerImageUrl: null // 🟢 To hold cloud storage partner photo
  });

  useEffect(() => {
    if (!user || !user.phone) return;

    const playerDocRef = doc(db, 'users', user.phone);

    // 🎧 Live listen to this player's document for round 2 fields
    const unsubscribe = onSnapshot(playerDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const tId = data.assignedPlayerId || null;
        const pId = data.partnerId || null;
        
        let targetUrl = null;
        let partnerUrl = null;

        // ⚡️ Fetch both avatar URLs from storage in parallel to maximize speed
        try {
          const fetches = [];
          
          if (tId) {
            const targetRef = ref(storage, `${tId}.jpeg`);
            fetches.push(getDownloadURL(targetRef).then(url => targetUrl = url).catch(() => 'https://via.placeholder.com/150'));
          }
          if (pId) {
            const partnerRef = ref(storage, `${pId}.jpeg`);
            fetches.push(getDownloadURL(partnerRef).then(url => partnerUrl = url).catch(() => 'https://via.placeholder.com/150'));
          }

          if (fetches.length > 0) {
            await Promise.all(fetches);
          }
        } catch (err) {
          console.error("Error resolution fetching cloud storage assets:", err);
        }

        setMatchData({
          targetName: data.assignedPlayerName || null,
          targetId: tId,
          targetImageUrl: targetUrl,
          partnerName: data.partnerName || null,
          partnerId: pId,
          partnerImageUrl: partnerUrl
        });
      }
    }, (error) => {
      console.error("Error listening to Round 2 data:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const { targetName, targetId, targetImageUrl, partnerName, partnerId, partnerImageUrl } = matchData;

  // Reusable circular image styling rules
  const circularImageStyle = {
    width: '120px',
    height: '120px',
    minWidth: '120px',  
    minHeight: '120px', 
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

            {/* ☁️ Partner cloud photo lookup reference hook */}
            <img 
              src={partnerImageUrl || 'https://via.placeholder.com/120'} 
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

            {/* ☁️ Target cloud photo lookup reference hook */}
            <img 
              src={targetImageUrl || 'https://via.placeholder.com/120'} 
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