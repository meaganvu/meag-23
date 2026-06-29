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

  return (
    <div className="player-screen">
      <div className="player-shell">
        <header className="player-hero">
          <p className="player-kicker">Round 2</p>
          <h1>Welcome, {user.name}!</h1>
          <p>Double trouble. Watch your partner's cup, watch your own, and hunt down your target.</p>
        </header>

      {!targetName || !partnerName || !targetId || !partnerId ? (
        <section className="player-status-card">
          <p className="player-kicker">Assignment Pending</p>
          <h2>Waiting for partners and targets...</h2>
          <p>Your round 2 info will appear here automatically.</p>
        </section>
      ) : (
        <div className="player-card-stack">
          
          {/* Partner Card */}
          <section className="player-card player-card-ally">
            <p className="player-card-label">Your Partner In Crime</p>

            {/* ☁️ Partner cloud photo lookup reference hook */}
            <img 
              src={partnerImageUrl || 'https://via.placeholder.com/120'} 
              alt={partnerName}
              className="player-target-photo" 
            />

            <h2>{partnerName}</h2>
            <p>Protect each other's cups. If you catch their assassin, the assassin's partner drinks.</p>
          </section>

          {/* Target Card */}
          <section className="player-card player-card-danger">
            <p className="player-card-label">Your Target</p>

            {/* ☁️ Target cloud photo lookup reference hook */}
            <img 
              src={targetImageUrl || 'https://via.placeholder.com/120'} 
              alt={targetName}
              className="player-target-photo" 
            />

            <h2>{targetName}</h2>
            <p>Spike their drink. Your target is independent of your partner.</p>
          </section>

        </div>
      )}
      </div>
    </div>
  );
}

export default Round2Player;
