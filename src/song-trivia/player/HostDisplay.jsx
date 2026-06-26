import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

function HostDisplay() {
  const [teams, setTeams] = useState([]);
  const [scoreInputs, setScoreInputs] = useState({});

  // 🟢 1. Listen to the teams collection in real time
  useEffect(() => {
    const teamsRef = collection(db, 'teams');
    const unsubscribe = onSnapshot(teamsRef, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);
    }, (error) => {
      console.error("Error fetching teams for Host:", error);
    });

    return () => unsubscribe();
  }, []);

  // Handle individual manual input changes
  const handleInputChange = (teamId, value) => {
    setScoreInputs(prev => ({
      ...prev,
      [teamId]: value
    }));
  };

  // 🟢 2. Directly set/overwrite points in Firestore
  const handleSetPoints = async (teamId) => {
    const newPoints = parseInt(scoreInputs[teamId], 10);
    if (isNaN(newPoints)) {
      alert("Please enter a valid number");
      return;
    }

    try {
      const teamDocRef = doc(db, 'teams', teamId);
      await updateDoc(teamDocRef, { points: newPoints });
      // Clear specific input after setting
      setScoreInputs(prev => ({ ...prev, [teamId]: '' }));
    } catch (error) {
      console.error("Error setting score:", error);
    }
  };

  // 🟢 3. Quick Helper: Quick incremental adjustments (+1, +2, -1 points)
  const handleAdjustPoints = async (teamId, currentPoints, adjustment) => {
    try {
      const teamDocRef = doc(db, 'teams', teamId);
      await updateDoc(teamDocRef, {
        points: (currentPoints || 0) + adjustment
      });
    } catch (error) {
      console.error("Error adjusting score:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>👨‍💻 Host Control Dashboard</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Manage team points and view incoming guesses in real time.</p>
      
      <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {teams.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Loading teams from Firestore...</p>
        ) : (
          teams.map((team) => (
            <div key={team.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              {/* Left Side: Team Metadata & Current Round Guesses */}
              <div style={{ flex: '1', minWidth: '250px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{team.id}</h2>
                <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <div><strong>Song Guess:</strong> {team.songGuess || <span style={{color: '#999', fontStyle: 'italic'}}>None</span>}</div>
                  <div><strong>Artist Guess:</strong> {team.artistGuess || <span style={{color: '#999', fontStyle: 'italic'}}>None</span>}</div>
                </div>
              </div>

              {/* Right Side: Score Setting and Tweaking Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {/* Visual Tracker */}
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#777', textTransform: 'uppercase' }}>Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{team.points || 0}</div>
                </div>

                {/* Quick adjustment increments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <button onClick={() => handleAdjustPoints(team.id, team.points, 1)} style={adjustButtonStyle('#28a745')}>+1 Pt</button>
                  <button onClick={() => handleAdjustPoints(team.id, team.points, -1)} style={adjustButtonStyle('#dc3545')}>-1 Pt</button>
                </div>

                {/* Direct text input overrides */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type="number" 
                    placeholder="Set total..."
                    value={scoreInputs[team.id] || ''} 
                    onChange={(e) => handleInputChange(team.id, e.target.value)}
                    style={{
                      width: '90px',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button onClick={() => handleSetPoints(team.id)} style={{
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    Set
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const adjustButtonStyle = (bgColor) => ({
  padding: '4px 10px',
  fontSize: '0.8rem',
  backgroundColor: bgColor,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
});

export default HostDisplay;