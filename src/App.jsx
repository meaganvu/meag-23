import { useState, useEffect } from 'react';
import './App.css';
import SignIn from './SignIn';
import { db } from './firebase';
// Imported BOTH getDocs and getDoc properly here 👇
import { collection, doc, setDoc, getDocs, getDoc } from 'firebase/firestore'; 
import phoneNumbers from './phone-numbers.json';
import TVDisplay from './TVDisplay';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('user_session');
    
    if (savedSession) {
      const { phone, name, loginTime } = JSON.parse(savedSession);
      const currentTime = new Date().getTime();

      // Check if 2 hours have passed since login Time
      if (currentTime - loginTime < TWO_HOURS_MS) {
        setUser({ phone, name });
      } else {
        // Session expired! Clear it.
        localStorage.removeItem('user_session');
      }
    }
  }, []);

  // 1. Core Syncing Logic (Kept at the app level)
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

  // 2. Clear handling function that receives verified user data from the SignIn child
  const handleSignInSuccess = async (verifiedUser) => {
    const userDocRef = doc(db, 'users', verifiedUser.phone);

    try {
      const userSnapshot = await getDoc(userDocRef);
      
      // If they somehow aren't in Firestore yet, add them dynamically
      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, { Name: verifiedUser.name });
      }

      const userData = { phone: verifiedUser.phone, name: verifiedUser.name };

      const sessionData = {
        ...userData,
        loginTime: new Date().getTime() // Capture current time in milliseconds
      };
      localStorage.setItem('user_session', JSON.stringify(sessionData));

      setUser({ phone: verifiedUser.phone, name: verifiedUser.name });
    } catch (error) {
      console.error('Error verifying user in Firestore:', error);
    }
  };

  return (
    <div className="app-container">
      {!user ? (
        <SignIn onSignInSuccess={handleSignInSuccess} />
      ) : (
        <div>
          {user.phone === '07032003' ? (
            <TVDisplay />
          ) : (
            <h1>Welcome, {user.name}!</h1>
          )}
        </div>
      )}
    </div>
  );
}

export default App;