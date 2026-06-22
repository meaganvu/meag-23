import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';

function AssignPlayerRound2() {
  
  const generateAssignments = async () => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollectionRef);
      
      const players = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(player => player.id !== '07032003');

      if (players.length < 4 || players.length % 2 !== 0) {
        console.warn("You need an even number of players (at least 4) to generate pairs and targets.");
        return;
      }

      // --- PHASE 1: GENERATE PARTNERS (Mutual Pairs) ---
      const partnerShuffle = [...players];
      for (let i = partnerShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [partnerShuffle[i], partnerShuffle[j]] = [partnerShuffle[j], partnerShuffle[i]];
      }

      const partnerMap = {};
      const partnerNameMap = {}; // 🌟 Added to map partner names
      
      for (let i = 0; i < partnerShuffle.length; i += 2) {
        const p1 = partnerShuffle[i];
        const p2 = partnerShuffle[i + 1];
        
        partnerMap[p1.id] = p2.id;
        partnerMap[p2.id] = p1.id;

        // Store their names (fallback to 'Unknown' if the Name field doesn't exist)
        partnerNameMap[p1.id] = p2.Name || 'Unknown';
        partnerNameMap[p2.id] = p1.Name || 'Unknown';
      }

      // --- PHASE 2: GENERATE TARGETS (Secret Santa Loop) ---
      let targetMap = {};
      let targetNameMap = {}; // 🌟 Added to map target names
      let validTargetsFound = false;
      let attempts = 0;

      while (!validTargetsFound && attempts < 500) {
        attempts++;
        targetMap = {};
        targetNameMap = {}; 
        
        const targetPool = [...players];
        for (let i = targetPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [targetPool[i], targetPool[j]] = [targetPool[j], targetPool[i]];
        }

        let isRoundValid = true;

        for (let i = 0; i < players.length; i++) {
          const currentPlayerId = players[i].id;
          const assignedTarget = targetPool[i];
          const partnerId = partnerMap[currentPlayerId];

          if (assignedTarget.id === currentPlayerId || assignedTarget.id === partnerId) {
            isRoundValid = false;
            break; 
          }

          targetMap[currentPlayerId] = assignedTarget.id;
          targetNameMap[currentPlayerId] = assignedTarget.Name || 'Unknown'; // 🌟 Map the target's name
        }

        if (isRoundValid) {
          validTargetsFound = true;
        }
      }

      if (!validTargetsFound) {
        console.error("Could not find a valid target configuration. Please click try again.");
        return;
      }

      // --- PHASE 3: WRITE EVERYTHING TO FIRESTORE BACKEND ---
      for (const player of players) {
        const playerDocRef = doc(db, 'users', player.id);
        
        await updateDoc(playerDocRef, {
          partnerId: partnerMap[player.id],
          partnerName: partnerNameMap[player.id],             // 🤝 Logs partner's name
          assignedPlayerId: targetMap[player.id],
          assignedPlayerName: targetNameMap[player.id]         // 🎯 Logs target's name
        });
      }

      console.log(`🎉 Round 2 Matchmaking successful! Generated in ${attempts} attempts.`);
    } catch (error) {
      console.error('Error generating Round 2 assignments:', error);
    }
  };

  const resetAssignments = async () => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollectionRef);

      for (const playerDoc of querySnapshot.docs) {
        const playerDocRef = doc(db, 'users', playerDoc.id);

        // 🔄 Clears out all 4 generated fields for a clean slate
        await updateDoc(playerDocRef, {
          assignedPlayerId: deleteField(),
          assignedPlayerName: deleteField(),
          partnerId: deleteField(),
          partnerName: deleteField()
        });
      }

      console.log('🔄 All assignments, partners, and names successfully wiped for the next round!');
    } catch (error) {
      console.error('Error resetting assignments:', error);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <button onClick={generateAssignments} className="generate-btn">
        Generate Round 2
      </button>
      <button onClick={resetAssignments} className="reset-btn" >
        Reset Round
      </button>
    </div>
  );
}

export default AssignPlayerRound2;