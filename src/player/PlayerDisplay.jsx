import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore'; // 🌟 Import onSnapshot for live listening
import OpeningPlayer from "./OpeningPlayer";
import Round1Player from "./Round1Player"; // 🌟 Import player views for each round
import Round2Player from './Round2Player';
import Round3Player from './Round3Player';

const PlayerDisplay = ({ user }) => {
  const [currentScreen, setCurrentScreen] = useState('loading'); // Start at loading state

  useEffect(() => {
    // 🎧 Listen directly to the global game state document
    const statusDocRef = doc(db, 'status', 'game');

    const unsubscribe = onSnapshot(statusDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentScreen) {
          setCurrentScreen(data.currentScreen); // ⚡ Instantly updates phone state when computer updates Firestore
        }
      } else {
        // Fallback if the document doesn't exist in the database yet
        setCurrentScreen('opening'); 
      }
    }, (error) => {
      console.error("Error listening to global game status:", error);
    });

    // Clean up the real-time listener if the user closes the app
    return () => unsubscribe();
  }, []);

  return (
    <div className="PlayerDisplay-container">
      {currentScreen === 'loading' && (
        <div><h2>Connecting to TV screen... 🕒</h2></div>
      )}

      {currentScreen === 'opening' && (
        <OpeningPlayer name={user.name} />
      )}

      {currentScreen === 'round1' && (
        <Round1Player user={user} /> // Passing full user object so they can fetch targets next!
      )}

      {currentScreen === 'round2' && (
        <Round2Player user={user} /> // Passing full user object so they can fetch targets next!
      )}

      {currentScreen === 'round3' && (
        <Round3Player user={user} /> // Passing full user object so they can fetch targets next!
      )}
    </div>
  );
};

export default PlayerDisplay;