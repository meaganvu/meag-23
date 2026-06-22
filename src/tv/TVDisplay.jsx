import { useState, useEffect } from 'react';
import OpeningScreen from "./OpeningScreen";
import Round1Screen from "./Round1Screen";
import Round2Screen from "./Round2Screen";
import { db } from '../firebase'; // 🌟 Import your database
import { doc, setDoc } from 'firebase/firestore'; 

const TVDisplay = () => {
  const [currentScreen, setCurrentScreen] = useState('opening');

  // 💾 Push screen updates to Firestore in real-time whenever it changes
  useEffect(() => {
    const updateGlobalStatus = async () => {
      try {
        const statusDocRef = doc(db, 'status', 'game');
        await setDoc(statusDocRef, { currentScreen: currentScreen }, { merge: true });
        console.log(`📡 Broadcasted global game state: ${currentScreen}`);
      } catch (error) {
        console.error("Error updating global game state:", error);
      }
    };

    updateGlobalStatus();
  }, [currentScreen]);

  return (
    <div className="TVDisplay-container">
      {currentScreen === 'opening' && (
        <OpeningScreen onNavigate={() => setCurrentScreen('round1')} />
      )}

      {currentScreen === 'round1' && (
        <Round1Screen onNavigate={() => setCurrentScreen('round2')} />
      )}

      {currentScreen === 'round2' && (
        <Round2Screen onNavigate={() => setCurrentScreen('opening')} /> 
      )}
    </div>
  );
};

export default TVDisplay;