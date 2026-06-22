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

          {/* ☁️ Target Photo loaded straight from Firebase Storage! */}
          <img 
            src={target.imageUrl || 'https://via.placeholder.com/140'} 
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