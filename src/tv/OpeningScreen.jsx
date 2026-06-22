const OpeningScreen = ({ onNavigate }) => {

  return (
    <div className="OpeningScrren">
      <h1>HELLO WELCOME TO MY 23 BIRTHDAY PARTY</h1>
      <h2>Tonight we'll be playing Drinking Assassin and here are the rulesssss</h2>
      <h2>There will be 3 rounds</h2>
      <h2>3 rounds 1 shot a round. 20 min rounds </h2>

      <button onClick={onNavigate} className="next-btn">
        Start Round 1
      </button>
    </div>
  );
};

export default OpeningScreen;