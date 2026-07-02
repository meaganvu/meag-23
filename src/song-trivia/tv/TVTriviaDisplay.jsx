import { useState, useEffect } from 'react';
import TVOpeningTrivia from './TVOpeningTrivia';
import TVTriviaGame from './TVTriviaGame';
import { db } from '../../firebase'; 
import { doc, setDoc, onSnapshot } from 'firebase/firestore'; 

const TVTriviaDisplay = ({ onNavigate }) => {
  const [currentScreen, setCurrentScreen] = useState(null);
  const statusDocRef = doc(db, 'status', 'game');

  // 1️⃣ LIVE REAL-TIME LISTENER (Handles both initial load and live updates)
  useEffect(() => {
    const unsubscribe = onSnapshot(statusDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().currentScreen) {
        setCurrentScreen(docSnap.data().currentScreen);
      } else {
        // Fallback option if Firestore document doesn't exist yet
        setCurrentScreen('trivia-opening');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2️⃣ STATE BROADCASTER FOR TOGGLING BETWEEN SCREENS
  const handleScreenChange = async (nextScreen) => {
    try {
      await setDoc(statusDocRef, { currentScreen: nextScreen }, { merge: true });
    } catch (error) {
      console.error("Error updating game state:", error);
    }
  };

  // Loading Guard
  if (currentScreen === null) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>Initializing Trivia...</div>;
  }

  return (
    <div className="TVDisplay-container">
      {currentScreen === 'trivia-opening' && (
        <TVOpeningTrivia onNavigate={() => handleScreenChange('trivia-playing')} />
      )}

      {currentScreen === 'trivia-playing' && (
        <TVTriviaGame onNavigate={() => handleScreenChange('trivia-opening')} />
      )}
    </div>
  );
};

export default TVTriviaDisplay;