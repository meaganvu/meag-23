import AssignPlayer from "./AssignPlayer";
const TVDisplay = () => {

  return (
    <>
    <div className="TVDisplay">
      <h1>HELLO WELCOME TO MY 23 BIRTHDAY PARTY</h1>
      <h2>Tonight we'll be playing Drinking Assassin and here are the rulesssss</h2>
      <h2>There will be 3 rounds</h2>
      <h2>3 rounds 1 shot a round. 20 min rounds </h2>
      <h1>Round 1</h1>
      <h2>Everyone gets assigned 1 person at random where they spike they’re drink</h2>
      <h3>If ur not drinking out of ur cup then you have to put it down to give the assassin a chance to spike it</h3>
      <h2>try to empty all of the shot w/o getting caught </h2>
      <h2>if target catches u… u gotta finish whats left the of the shot</h2>
      <h2>If someone accuses another person of spiking them and they’re wrong: Accuser drinks half a shooter.</h2>
    </div>

    <AssignPlayer />
    </>
  );
};

export default TVDisplay;