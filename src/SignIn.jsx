import { useState } from 'react';
import users from './phone-numbers.json';

const SignIn = ({ onSignInSuccess }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSignInSubmit = () => {
    setError(''); // Clear past errors

    // Client-side quick check against your local white-list JSON
    const foundUser = users.find((u) => u.phone === phone.trim());

    if (foundUser) {
      onSignInSuccess(foundUser); // Pass verified data up to App.jsx
    } else {
      setError('Phone number not recognized.');
    }
  };

  return (
    <div className="signin-card">
      <h2>Sign In</h2>
      <input
        type="text"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={handleSignInSubmit}>Sign In</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SignIn;