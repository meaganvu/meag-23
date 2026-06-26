import { useState, useEffect } from 'react';
import './App.css';
import SignIn from './SignIn';
import { db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import phoneNumbers from './phone-numbers.json';
import TVDisplay from './tv/TVDisplay';
import PlayerDisplay from './player/PlayerDisplay';
import TVTriviaDisplay from './song-trivia/tv/TVTriviaDisplay';
import HostDisplay from './song-trivia/player/HostDisplay';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlayerDisplayTrivia from './song-trivia/player/PlayerDisplayTrivia';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function RootHome({ user, handleSignInSuccess }) {
  useEffect(() => {
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

  if (!user) {
    return <SignIn onSignInSuccess={handleSignInSuccess} />;
  }

  return (
    <div>
      {user.phone === '07032003' ? (
        <TVDisplay />
      ) : (
        <PlayerDisplay user={user} />
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      // 🟢 Added captain parameter to local session restoration
      const { phone, name, team, captain, loginTime } = JSON.parse(savedSession);
      const currentTime = new Date().getTime();

      if (currentTime - loginTime < TWO_HOURS_MS) {
        setUser({ phone, name, team: team || "", captain: !!captain });
      } else {
        localStorage.removeItem('user_session');
      }
    }
    setLoading(false);
  }, []);

  const syncUsersWithFirestore = async () => {
    const usersRef = collection(db, 'users');
    try {
      for (const u of phoneNumbers) {
        const userDoc = doc(usersRef, u.phone);
        // 🟢 Merging Captain field to Firestore from local JSON. Defaults to false if not found.
        await setDoc(userDoc, {
          Name: u.name,
          Team: u.team || "",
          Captain: !!u.captain 
        }, { merge: true });
      }
      console.log('Firestore synced with phone-numbers.json (Names, Teams & Captain Status Updated)');
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
      const localUserRecord = phoneNumbers.find(u => u.phone === verifiedUser.phone);
      const assignedTeam = localUserRecord?.team || "";
      const isCaptain = !!localUserRecord?.captain; // 🟢 Extract captain status from local JSON

      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) {
        // 🟢 Adds Captain field if creating a new fallback user document
        await setDoc(userDocRef, {
          Name: verifiedUser.name,
          Team: assignedTeam,
          Captain: isCaptain
        });
      }

      const userData = {
        phone: verifiedUser.phone,
        name: verifiedUser.name,
        team: assignedTeam,
        captain: isCaptain // 🟢 Added to global runtime user object
      };
      const sessionData = {
        ...userData,
        loginTime: new Date().getTime()
      };
      localStorage.setItem('user_session', JSON.stringify(sessionData));

      setUser(userData);
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
          <Route
            path="/"
            element={
              <RootHome user={user} handleSignInSuccess={handleSignInSuccess} />
            }
          />

          <Route
            path="/trivia"
            element={
              user ? (
                <div>
                  {user.phone === '07032003' ? (
                    <TVTriviaDisplay />
                  ) : user.phone === '6692141979' ? (
                    <HostDisplay />
                  ) : (
                    <PlayerDisplayTrivia user={user} />
                  )}
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;