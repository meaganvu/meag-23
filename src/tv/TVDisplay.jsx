import { useState, useEffect } from 'react';
import OpeningScreen from "./OpeningScreen";
import Round1Screen from "./Round1Screen";
import Round2Screen from "./Round2Screen";
import Round3Screen from './Round3Screen';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // 🟢 Added getDoc

const TVDisplay = () => {
  // 🟢 Initialize as null (or a loading state) so we don't accidentally overwrite Firestore on load
  const [currentScreen, setCurrentScreen] = useState(null);

  // 1️⃣ 🔄 Fetch initial game state from Firestore when the component first boots up
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const statusDocRef = doc(db, 'status', 'game');
        const docSnap = await getDoc(statusDocRef);
        
        if (docSnap.exists() && docSnap.data().currentScreen) {
          setCurrentScreen(docSnap.data().currentScreen);
        } else {
          // Fallback if the document doesn't exist yet
          setCurrentScreen('opening');
        }
      } catch (error) {
        console.error("Error fetching initial game state:", error);
        setCurrentScreen('opening'); // Emergency fallback
      }
    };

    fetchInitialState();
  }, []);

  // 2️⃣ 💾 Push screen updates to Firestore ONLY after we have loaded the initial state
  useEffect(() => {
    if (currentScreen === null) return; // 🛑 Don't write to Firestore while loading the initial state

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

  // ⌛️ Simple loading guard so the screen doesn't flicker or break while fetching from the database
  if (currentScreen === null) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>Loading game state...</div>;
  }

  return (
    <div className="TVDisplay-container">
      {currentScreen === 'opening' && (
        <OpeningScreen onNavigate={() => setCurrentScreen('round1')} />
      )}

      {currentScreen === 'round1' && (
        <Round1Screen onNavigate={() => setCurrentScreen('round2')} />
      )}

      {currentScreen === 'round2' && (
        <Round2Screen onNavigate={() => setCurrentScreen('round3')} /> 
      )}

      {currentScreen === 'round3' && (
        <Round3Screen onNavigate={() => setCurrentScreen('opening')} /> 
      )}
    </div>
  );
};

export default TVDisplay;