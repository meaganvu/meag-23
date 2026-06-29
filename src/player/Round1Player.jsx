import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // 🟢 Added storage import
import { doc, onSnapshot } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // 🟢 Added Firebase Storage methods

function Round1Player({ user }) {
  // Save name, ID, and the real-time download URL
  const [target, setTarget] = useState({ name: null, id: null, imageUrl: null });

  useEffect(() => {
    if (!user || !user.phone) return;

    const playerDocRef = doc(db, 'users', user.phone);

    const unsubscribe = onSnapshot(playerDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const targetId = data.assignedPlayerId || null;
        const targetName = data.assignedPlayerName || null;
        let fetchedImageUrl = null;

        // 📸 If a target exists, fetch their image directly from Firebase Storage root
        if (targetId) {
          try {
            const storageRef = ref(storage, `${targetId}.jpeg`);
            fetchedImageUrl = await getDownloadURL(storageRef);
          } catch (err) {
            console.error("Error fetching target image URL:", err);
            // Fallback placeholder if image doesn't exist in storage
            fetchedImageUrl = 'https://via.placeholder.com/150'; 
          }
        }

        setTarget({
          name: targetName,
          id: targetId,
          imageUrl: fetchedImageUrl
        });
      }
    }, (error) => {
      console.error("Error listening to target data:", error);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="player-screen">
      <div className="player-shell">
        <header className="player-hero">
          <p className="player-kicker">Round 1</p>
          <h1>Welcome, {user.name}!</h1>
          <p>Keep your eyes peeled, your drink guarded, and look out for assassins.</p>
        </header>

      {!target.name || !target.id ? (
        <section className="player-status-card">
          <p className="player-kicker">Assignment Pending</p>
          <h2>Waiting for the host to assign targets...</h2>
          <p>Your target will appear here automatically.</p>
        </section>
      ) : (
        <section className="player-card player-card-danger">
          <p className="player-card-label">Your Target Is</p>

          {/* ☁️ Target Photo loaded straight from Firebase Storage! */}
          <img 
            src={target.imageUrl || 'https://via.placeholder.com/140'} 
            alt={target.name}
            className="player-target-photo"
          />

          <h2>{target.name}</h2>
          <p>Spike their drink without getting caught.</p>
        </section>
      )}
      </div>
    </div>
  );
}

export default Round1Player;
