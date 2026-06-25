import { useState, useEffect } from 'react';
import './App.css';
import SignIn from './SignIn';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc } from 'firebase/firestore'; 
import phoneNumbers from './phone-numbers.json';
import TVDisplay from './tv/TVDisplay';
import PlayerDisplay from './player/PlayerDisplay';
import TVTriviaDisplay from './song-trivia/tv/TVTriviaDisplay';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

// 🟢 NEW HELPER COMPONENT: Resets Firestore game status when loading root (/)
function RootHome({ user, handleSignInSuccess }) {
  useEffect(() => {
    // Only clear the game state if the TV admin is the one accessing the root URL
    if (user && user.phone === '07032003') {
      const resetGlobalState = async () => {
        try {
          console.log("🏠 Root URL accessed. Resetting global status to 'opening'...");
          const statusDocRef = doc(db, 'status', 'game');
          await setDoc(statusDocRef, { currentScreen: 'opening' }, { merge: true });
        } catch (error) {
          console.error("Failed to reset global screen status:", error);
        }
      };
      resetGlobalState();
    }
  }, [user]);

  // Render what you originally had for the root path
  return !user ? (
    <SignIn onSignInSuccess={handleSignInSuccess} />
  ) : (
    <div>
      <TVDisplay />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('user_session');
    
    if (savedSession) {
      const { phone, name, loginTime } = JSON.parse(savedSession);
      const currentTime = new Date().getTime();

      if (currentTime - loginTime < TWO_HOURS_MS) {
        setUser({ phone, name });
      } else {
        localStorage.removeItem('user_session');
      }
    }
    setLoading(false);
  }, []);

  const syncUsersWithFirestore = async () => {
    const usersRef = collection(db, 'users'); 
    try {
      const existingUsersSnapshot = await getDocs(usersRef);
      const existingUsers = existingUsersSnapshot.docs.map((doc) => doc.id); 
      const newUsers = phoneNumbers.filter((u) => !existingUsers.includes(u.phone));

      for (const u of newUsers) {
        const userDoc = doc(usersRef, u.phone);
        await setDoc(userDoc, { Name: u.name });
      }
      console.log('Firestore synced with phone-numbers.json');
    } catch (error) {
      console.error('Error syncing users with Firestore:', error);
    }
  };

  useEffect(() => {
    syncUsersWithFirestore();
  }, []);

  const handleSignInSuccess = async (verifiedUser) => {
    const userDocRef = doc(db, 'users', verifiedUser.phone);

    try {
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, { Name: verifiedUser.name });
      }

      const userData = { phone: verifiedUser.phone, name: verifiedUser.name };
      const sessionData = {
        ...userData,
        loginTime: new Date().getTime()
      };
      localStorage.setItem('user_session', JSON.stringify(sessionData));

      setUser({ phone: verifiedUser.phone, name: verifiedUser.name });
    } catch (error) {
      console.error('Error verifying user in Firestore:', error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* ROUTE 1: Root Path (localhost:1010/) 
              🟢 Swapped with our wrapper to handle the conditional Firestore reset
          */}
          <Route 
            path="/" 
            element={
              <RootHome user={user} handleSignInSuccess={handleSignInSuccess} />
            } 
          />

          {/* ROUTE 2: Trivia Path (localhost:1010/trivia) */}
          <Route 
            path="/trivia" 
            element={
              user ? (
                <div>
                  {user.phone === '07032003' ? (
                    /* 🟢 Removed the broken onNavigate handler loop since TVTriviaDisplay 
                       manages its own screen transitions internally */
                    <TVTriviaDisplay />
                  ) : (
                    <PlayerDisplay user={user} />
                  )}
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;