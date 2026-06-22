import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';

function AssignPlayerRound1() {
  
  const generateAssignments = async () => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollectionRef);
      
      const players = querySnapshot.docs
        .map(doc => ({
          id: doc.id, // This holds the phone number strings (e.g., "6504774562")
          ...doc.data()
        }))
        .filter(player => player.id !== '07032003'); 

      // Validation check
      if (players.length < 2) {
        console.warn("You need at least 2 players (excluding 07032003) to generate assignments.");
        return;
      }

      // 2. Fisher-Yates Shuffle to randomize the active player pool
      const shuffled = [...players];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // 3. Create the assignments in a closed loop
      for (let i = 0; i < shuffled.length; i++) {
        const currentPlayer = shuffled[i];
        const nextPlayer = shuffled[(i + 1) % shuffled.length]; // This is the full target object 🎯

        // 4. Update the active players' documents with BOTH the ID and the Name
        const playerDocRef = doc(db, 'users', currentPlayer.id);
        await updateDoc(playerDocRef, {
          assignedPlayerId: nextPlayer.id,
          assignedPlayerName: nextPlayer.Name || 'Unknown' // 🌟 Added: Logs the target's name text field
        });
      }

      console.log('🎉 Assignments generated successfully! (07032003 was skipped)');
    } catch (error) {
      console.error('Error generating assignments:', error);
    }
  };

  const resetAssignments = async () => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollectionRef);

      // Loop through every single document in the 'users' collection
      for (const playerDoc of querySnapshot.docs) {
        const playerDocRef = doc(db, 'users', playerDoc.id);

        // 🔄 Clears out BOTH the target ID and the target name for a completely clean slate
        await updateDoc(playerDocRef, {
          assignedPlayerId: deleteField(),
          assignedPlayerName: deleteField() // 🌟 Added: Wipes out the name on reset too
        });
      }

      console.log('🔄 All assignments have been successfully reset for the next round!');
    } catch (error) {
      console.error('Error resetting assignments:', error);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <button onClick={generateAssignments} className="generate-btn">
        Generate Assignments
      </button>
      <button onClick={resetAssignments} className="reset-btn" style={{ marginLeft: '10px', backgroundColor: '#ff4d4d', color: 'white' }}>
        Reset Round
      </button>
    </div>
  );
}

export default AssignPlayerRound1;