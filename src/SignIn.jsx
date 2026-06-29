import { useState } from 'react';
import users from './phone-numbers.json';
import '../src/player/styles/PlayerScreen.css';
import meaganPic from "../src/assets/meaganbday.png"

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
    <div className="player-screen">
      <div className="player-shell">
        <header className="sign-in-player-hero">
          <p className="sign-in-player-kicker">MEAG's 23rd</p>
          <h1>Welcome to 1157!</h1>
          <p>Happy birthday to Ms. Meagan Vu. For her birthday, she's organized a game of deceit and liquor. Log in with you phone number to get started.</p>
          <img src={meaganPic} className="meagan-pic" alt="meagan-pic" />
        </header>
        <section className="sign-in-player-status-card">
          <h2>Please enter your phone number<br/>and hit "Sign in"</h2>
            <input
              type="text"
              id="phoneInput"
              placeholder="(XXX) XXX-XXXX"
              name="phoneInputName"
              className="phoneInputField"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onSubmit={handleSignInSubmit}
            />
          <button className="signInButton" onClick={handleSignInSubmit}>Sign In</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </section>
      </div>
    </div>
  );
};

export default SignIn;