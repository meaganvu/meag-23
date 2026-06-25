import { useState, useEffect } from 'react';
import TVOpeningTrivia from './TVOpeningTrivia';
import TVTriviaGame from './TVTriviaGame';
import { db } from '../../firebase'; 
import { doc, setDoc, onSnapshot } from 'firebase/firestore'; 

const TVTriviaDisplay = ({ onNavigate }) => {
  const [currentScreen, setCurrentScreen] = useState(null);
  const statusDocRef = doc(db, 'status', 'game');

  // 1️⃣ FORCE INITIAL STATE ON URL LOAD
  // This runs exactly ONCE when the user navigates to /trivia
  useEffect(() => {
    const forceTriviaOpening = async () => {
      try {
        console.log("🚀 URL /trivia accessed. Forcing Firestore state to 'trivia-opening'...");
        await setDoc(statusDocRef, { currentScreen: 'trivia-opening' }, { merge: true });
      } catch (error) {
        console.error("Failed to initialize URL state in Firestore:", error);
      }
    };

    forceTriviaOpening();
  }, []); // Empty dependency array ensures this only triggers on fresh page mount

  // 2️⃣ LIVE REAL-TIME LISTENER
  useEffect(() => {
    const unsubscribe = onSnapshot(statusDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().currentScreen) {
        setCurrentScreen(docSnap.data().currentScreen);
      } else {
        setCurrentScreen('trivia-opening');
      }
    });

    return () => unsubscribe();
  }, []);

  // 3️⃣ STATE BROADCASTER FOR TOGGLING BETWEEN SCREENS
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
      {/* Now perfectly matches 'trivia-opening' string coming from your update */}
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